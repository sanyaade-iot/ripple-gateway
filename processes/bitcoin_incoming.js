var InboundBtc = require('../lib/blockchain_client.js'),
	conf = require('../config/inbound.js');

var inboundBtc = new InboundBtc;

var Poll=  {
    inbound: function(){
        var self = this;
        inboundBtc.poll(conf.get('BTC_INBOUND'));
        //TODO: listen to success before set time out
        setTimeout(function(){
            self.inbound();
        }, 10000);
    }
};

Poll.inbound();
