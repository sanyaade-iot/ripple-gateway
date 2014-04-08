'use strict';

var config = require('../config/nconf'),
    request = require('request');

var json = {
    "pairs" : [{
        "base":{"currency":"BTC","issuer": config.get('EXCHANGE_ISSUER_ADDRESS')},
        "trade":{"currency":"XRP"}
    }]
}

var Exchange = {
    getRate: function(fn) {
        var url = 'http://RippleChartsStagingAPI-869095469.us-east-1.elb.amazonaws.com/api/exchangerates';
        request.post({ url: url, json: json }, function(err, resp, body) {
            fn(err, body);
        });
    }
}


module.exports = Exchange;
