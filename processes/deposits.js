"use strict";

var queue = require('../lib/deposit_queue.js');
var config = require('../config/nconf.js');
var abstract = require('../lib/abstract.js');
var api = require("ripple-gateway-data-sequelize-adapter");
var sql = require('../node_modules/ripple-gateway-data-sequelize-adapter/lib/sequelize.js');
var gateway = require('../lib/gateway.js');
var exchangeRate = require('../lib/get_exchange_rate.js');
var converter = require('../lib/discount_and_convert.js');

queue.on('deposit', function (deposit) {

    exchangeRate.getRate(function(err, exchangeRate){
        if(err){
            console.log(err);
        } else {
            sql.transaction(function (t) {

                abstract.getExternalAccountRippleAddress(deposit.external_account_id, function (err, address) {
                    if (err) {

                        t.rollback();
                        return;
                    }

                    var discountBy = config.get('DISCOUNT_PERCENTAGE') / 100;
                    var toDeposit = converter.convert(deposit.amount, exchangeRate[0]['last'], 'XRP', discountBy);

                    console.log('conversion', toDeposit);

                    var opts = {
                        to_address_id: address.id,
                        amount: toDeposit.amount,
                        to_currency: toDeposit.currency,
                        currency: toDeposit.currency,
                        user_id: 3

                    };

                    console.log(opts);

                    gateway.payments.enqueueOutgoing(opts, function (err, payment) {
                        if (err) {
                            console.log(err);
                            t.rollback();
                            return;
                        }

                        console.log('PAYMENT', payment.to_amount, payment.to_currency, payment.to_issuer);

                        if (payment) {
                            var opts = {
                                id: deposit.id,
                                ripple_transaction_id: payment.id
                            };

                            gateway.deposits.finalize(opts, function (err, deposit) {
                                if (err) {

                                    t.rollback();
                                    return;
                                }

                                t.commit();
                                console.log(deposit.toJSON());

                            });
                        } else {
                            t.rollback();
                            return;
                        }

                    });
                });
            });
        }
    });
});

queue.work();

console.log('Processing deposits from the inbound asset deposit queue.');