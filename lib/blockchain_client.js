'use strict';

var gateway = require('../lib/gateway.js'),
    Mailer = require('../lib/mailer.js'),
    request = require('request'),
    config = require('../config/nconf');

var transaction;
var btc_units = 100000000;

var BlockchainEndpoints = {
	host: 'https://blockchain.info',
	getReceivedUrl: function(address, confirmations) {
		return this.host + '/q/getreceivedbyaddress/' + address + '?confirmations=' + confirmations + '&format=json&api_code=' + config.get('BLOCKCHAIN_API_KEY');
	}
};

var LocalEndpoints = {
	getReceivedUrl: function(address, confirmations){
		return 'http://localhost:3333/json/'+address+'_received.json' + '?confirmations=' + confirmations;
	}
};

var TxnModel = function(config){
	this.amount = (config.amount / btc_units);
	this.currency = 'XRP';
	this.deposit = true;
	this.status = 'queued';
	this.external_account_id = config.external_account_id;
	this.ripple_transaction_id = config.ripple_transaction_id;
};

var Txn = function(){

	var transactions = {
		received: 0,
		total_received: config.get('total_btc_received'),
		diff: 0
	};
    
	this.poll = function(address){

        _getReceived(address, function(err){
            if(err){
                console.log(err);
                return;
            } else {
                
                //Check if there is a new confirmed payment
                _check(function(diff){
                    //Queue if there is a new payment
                    _queue(diff, function(){
                        //Email on BTC arrival
                        Mailer.sendEmail({
                           to: config.get('BTC_RECEIVE_NOTIFY'),
                           subject: '[INFO] Incoming Bitcoin payment',
                           body: 'New Bitcoin payment of ' + diff / btc_units + ' with ' + config.get('NUMBER_OF_CONFIRMATIONS') +' confirmation(s) has arrived.'
                        });

                    });
                });

            }

        });
	};

	var _getReceived = function(address, fn){
		var receivedUrl = BlockchainEndpoints.getReceivedUrl(address, config.get('NUMBER_OF_CONFIRMATIONS'));

        request.get(receivedUrl,function(err, resp, body) {
            transactions.received = Number(body);
            fn(err, body)
        });
	};

	var _check = function(fn){
		transactions.diff = transactions.received - config.get('total_btc_received');
        console.log(transactions, ' checked at ', new Date());

        if(transactions.diff > 0){
            fn(Number(transactions.diff), fn);
		}
	};

	var _queue = function(diff, fn){

		if(diff != config.get('total_btc_received')) {
			transaction = new TxnModel({
				amount: diff,
				external_account_id: config.get('USER_ID') //ask steven what it is
			});

            //Store queue to database
			gateway.deposits.record(transaction, function(transaction){
                config.set('total_btc_received', Number(transactions.received));
                config.save(function(){
                    transactions.total_received = config.get('total_btc_received');
                    fn(transactions);
                });
			});
		}
	};
}

module.exports = Txn;
