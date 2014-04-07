'use strict';

var Rest = require('../lib/rest.js'),
	events = require('events'),
	util = require('util'),
	gateway = require('../lib/gateway.js'),
	conf = require('../config/inbound.js');

var rest = Rest;

var BlockchainEndpoints = {
	host: 'https://blockchain.info',
	allInfoByAddress: function(address){
		return this.host + '/address/' + address + '?format=json&api_code=' + conf.get('BLOCKCHAIN_API_KEY');
	},
	getReceivedUrl: function(address, confirmations) {
		return this.host + '/q/getreceivedbyaddress/' + address + '?confirmations=' + confirmations + '&format=json&api_code=' + conf.get('BLOCKCHAIN_API_KEY');
	}
};

var LocalEndpoints = {
	allInfoByAddress: function(address) {
		return 'http://localhost:3333/json/'+address+'.json';
	},
	getReceivedUrl: function(address, confirmations){
		return 'http://localhost:3333/json/'+address+'_received.json' + '?confirmations=' + confirmations;
	}
};

var btc_units = 100000000;

var TxnModel = function(config){
	this.amount = (config.amount / btc_units);
	this.currency = 'XRP';
	this.deposit = true;
	this.status = 'queued';
	this.external_account_id = config.external_account_id;
	this.ripple_transaction_id = config.ripple_transaction_id;
};

var lastQueued = 0;

var Txn = function(){

	var transactions = {
		received: 0, 
		total_received: 0, 
		diff: 0
	};

	var getAllInfoData = rest,
		getReceivedData = rest;

	this.poll = function(address){
		this.emit('newCall', address);
		
	};

	var _getAllInfo = function(address){
        var self = this;
		var allInfoUrl = BlockchainEndpoints.allInfoByAddress(address);

		getAllInfoData.once('data', function(data){
			transactions.received = data['total_received'];
			self.emit('gotTotalReceived', address);	
		});

		getAllInfoData.getJson(allInfoUrl);
	};

	var _getReceived = function(address){
        var self = this;
		var receivedUrl = BlockchainEndpoints.getReceivedUrl(address, conf.get('NUMBER_OF_CONFIRMATIONS'));
        console.log(receivedUrl);
		getReceivedData.once('data', function(data){
			transactions.total_received = data;
			self.emit('gotReceived', address);		
		});

		getReceivedData.getJson(receivedUrl);
	};

	var _check = function(){
		transactions.diff = transactions.received - transactions.total_received;
		console.log('cheked at ', new Date());
		console.log(transactions);
		if(transactions.diff > 0){
			this.emit('queue', transactions.diff);
		} else {
			lastQueued = 0;
		}
		
	};

	var transaction;
	var _queue = function(diff){
		var self = this;
		if(diff != lastQueued) {
			transaction = new TxnModel({
				amount: diff,
				external_account_id: 1 //ask steven what it is
			});
			
			gateway.deposits.record(transaction, function(transaction){
				self.emit('successfullyQueued');
				lastQueued = diff;
			});
		} else {
			self.emit('noQueue')
		}
	};

	this.on('newCall', _getAllInfo);
	this.on('gotTotalReceived', _getReceived);
	this.on('gotReceived', _check);
	this.on('queue', _queue);
	this.on('successfullyQueued', function(){
		console.log('QUEUED', transaction.amount);
	});

	this.on('noQueue', function(){
		console.log('no queue because ' + lastQueued + ' was queued');
	});
}

util.inherits(Txn, events.EventEmitter);

module.exports = Txn;