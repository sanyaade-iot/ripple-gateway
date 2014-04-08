'use strict';

var gateway = require('../lib/gateway.js'),
    request = require('request'),
	conf = require('../config/inbound.js');

var lastQueued = 0;
var transaction;
var btc_units = 100000000;

var BlockchainEndpoints = {
	host: 'https://blockchain.info',
	getReceivedUrl: function(address, confirmations) {
		return this.host + '/q/getreceivedbyaddress/' + address + '?confirmations=' + confirmations + '&format=json&api_code=' + conf.get('BLOCKCHAIN_API_KEY');
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
		total_received: conf.get('TOTAL_BTC_RECEIVED'),
		diff: 0
	};

	this.poll = function(address){
        _getReceived(address, function(err){
            if(err){
                return;
            } else {
                _check(function(diff){
                    _queue(diff, function(){
                        console.log('QUEUED', diff / btc_units);
                    });
                })
            }
        });
	};

	var _getReceived = function(address, fn){
		var receivedUrl = LocalEndpoints.getReceivedUrl(address, conf.get('NUMBER_OF_CONFIRMATIONS'));
        request.get(receivedUrl,function(err, resp, body) {
            transactions.received = Number(body);
            fn(err, body)
        });
	};

	var _check = function(fn){
		transactions.diff = transactions.received - conf.get('TOTAL_BTC_RECEIVED');
		console.log('cheked at ', new Date());
        console.log(transactions);
		if(transactions.diff > 0){
            fn(Number(transactions.diff), fn);
		} else {
            lastQueued = 0;
		}
	};

	var _queue = function(diff, fn){

		if(diff != conf.get('TOTAL_BTC_RECEIVED')) {
			transaction = new TxnModel({
				amount: diff,
				external_account_id: conf.get('USER_ID') //ask steven what it is
			});

			gateway.deposits.record(transaction, function(transaction){
                conf.set('TOTAL_BTC_RECEIVED', Number(transactions.received));
                conf.save(function(){
                    transactions.total_received = conf.get('TOTAL_BTC_RECEIVED');
                    fn(transactions);
                });
			});
		}
	};
}

module.exports = Txn;
