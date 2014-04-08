'use strict';

var conf = require('../config/nconf.js'),
    request = require('request');

var json = {
    "pairs" : [{
        "base":{"currency":"BTC","issuer": conf.get('EXCHANGE_ISSUER_ADDRESS')},
        "trade":{"currency":"XRP"}
    }]
}

function getExchangeRate(fn) {
    var url = 'http://RippleChartsStagingAPI-869095469.us-east-1.elb.amazonaws.com/api/exchangerates';
    request.post({ url: url, json: json }, function(err, resp, body) {
        fn(err, body);
    });
}

module.exports = getExchangeRate;
