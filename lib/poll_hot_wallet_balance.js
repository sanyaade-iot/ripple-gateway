var nconf = require('../config/nconf'),
    conf = require('../config/inbound.js'),
    mailer = require('../lib/mailer.js'),
    request = require('request');

var checkHotWalletBalance = function(){
    //var url = globalConf.get('RIPPLE_REST_API') + '/v1/accounts/' + globalConf.get('gateway_hot_wallet').address +'/balances';
    var url = 'http://localhost:5990' + '/v1/accounts/' + 'rEYHMzQQkwdyTACWX23XPVceZpWD8isVw1' +'/balances';

    request.get(url, function(err, resp, body){
        if(!err){
            var accountInfo = JSON.parse(body)
            var bal = Number(accountInfo.balances[0].amount);

            if(bal <= conf.get('XRP_LOW_BALANCE_WARNING')){
                mailer({
                    to: conf.get('XRP_LOW_BALANCE_EMAIL'),
                    subject: '[ALERT] Low hot wallet XRP balance',
                    body: 'Hot wallet account balance is low (' + bal + ' XRPs). Please fund wallet.'
                });
            };
        }
    });
    setTimeout(checkHotWalletBalance, 10800000);
};

module.exports = checkHotWalletBalance;