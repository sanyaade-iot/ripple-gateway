'use strict';

var conf = require('../config/nconf.js'),
    request = require('request');

var issuerAddress = conf.get('EXCHANGE_ISSUER_ADDRESS');

var json = {
    "pairs" : [{
        "base":{"currency":"BTC","issuer":"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"},
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
