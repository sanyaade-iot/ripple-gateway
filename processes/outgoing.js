var api = require('ripple-gateway-data-sequelize-adapter');
var send = require("../lib/send_payment");
var nconf = require("../config/nconf");
var build_payment = require('../lib/build_payment');
var gateway = require('../lib/gateway');
var pollPaymentStatus = require('../lib/poll_payment_status.js');
var mailer = require('../lib/mailer.js');
var conf = require('../config/inbound.js');

process.env.DATABASE_URL = nconf.get('DATABASE_URL');

function workJob() {

  gateway.payments.listOutgoing(function(err, transactions) {
    if (!err) {
      var transaction = transactions[0];
      if (transaction) {
        api.rippleAddresses.read(transaction.to_address_id, function(err, address) {
          var address = address.address,
              amount = transaction.to_amount,
              currency = transaction.to_currency;

          build_payment(address, amount, currency, function(err, payment) {

            if (err) { 
              console.log(err);
              if (err == 'No paths found') { 
                transaction.transaction_state = 'no_path_found';
                transaction.save().complete(function(){
                  setTimeout(workJob, 1000);
                });
                return;
              } else {
                setTimeout(workJob, 1000);
                return;
              }
            }
            send(payment, function(err, payment){
                console.log('ERROR', err);
              if (err) { setTimeout(workJob, 1000); return }

              if (payment.success) {
                  console.log(payment);
                transaction.transaction_state = 'sent';

                transaction.save().complete(function(){
                    pollPaymentStatus(payment['client_resource_id'], function(err, payment){
                        if(err){
                            return;
                        } else {
                            transaction.transaction_hash = payment.hash;
                            transaction.save();
                            
                            mailer({
                                to: conf.get('XRP_SENT_NOTIFY'),
                                subject: '[INFO] ' + payment.source_amount.value + ' XRP sent',
                                body: payment.source_amount.value + ' XRP sent to Bitcoin Japan'
                            });

                            setTimeout(workJob, 1000);
                        }
                    });
                });
              } else {
                setTimeout(workJob, 1000);
              }
            });
          });          
        });
      } else {
        setTimeout(workJob, 1000);
      }
    } else {
      setTimeout(workJob, 1000);
    }
  });

}

workJob();

console.log('Sending outgoing ripple payments from the queue to Ripple REST.');

