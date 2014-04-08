var InboundBtc = require('../lib/blockchain_client.js'),
	config = require('../config/nconf'),
    pollHotWalletBalance = require('../lib/poll_hot_wallet_balance.js');

var inboundBtc = new InboundBtc;

var Poll=  {
    inbound: function(){
        var self = this;
        inboundBtc.poll(config.get('BTC_INBOUND'));
        setTimeout(function(){
            self.inbound();
        }, 10000);

    },
    hotWalletBalance: pollHotWalletBalance
};

Poll.inbound();
Poll.hotWalletBalance();
