"use strict";

var queue = require('../lib/deposit_queue.js');

var config = require('../config/nconf.js');
var exchangeConfig = require('../config/inbound.js');
var abstract = require('../lib/abstract.js');
var api = require("ripple-gateway-data-sequelize-adapter");
var sql = require('../node_modules/ripple-gateway-data-sequelize-adapter/lib/sequelize.js');
var gateway = require('../lib/gateway.js');
var getExchangeRate = require('../lib/get_exchange_rate.js');


var discountBy = exchangeConfig.get('DISCOUNT_PERCENTAGE') / 100;

var btc_units = 100000000;

var Utils = {
    discount: function(amount, discount){
        var m = amount * btc_units;
        var d = (m + (m * discount));
        return d / btc_units;
    },
    convert: function(amount, exchangeRate, toCurrency) {
        var a = this.discount(amount, discountBy);
        return {
            amount: a * exchangeRate,
            currency: toCurrency
        }
    }
}

queue.once('deposit', function (deposit) {

    getExchangeRate(function(err, exchangeRate){
        if(err){
            console.log('ERROR', err);
        } else {
            sql.transaction(function (t) {

                abstract.getExternalAccountRippleAddress(deposit.external_account_id, function (err, address) {
                    if (err) {

                        t.rollback();
                        return;
                    }
                    console.log('EXCHANGE RATE', exchangeRate);
                    var toDeposit = Utils.convert(deposit.amount, exchangeRate[0]['last'], 'XRP');

                    console.log('conversion', toDeposit);

                    var opts = {
                        to_address_id: address.id,
                        amount: toDeposit.amount,
                        to_currency: toDeposit.currency
                    };
                    console.log(opts);
                    gateway.payments.enqueueOutgoing(opts, function (err, payment) {
                        if (err) {
                            console.log(err);
                            t.rollback();
                            return;
                        }

                        console.log('PAYMENT', payment);

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