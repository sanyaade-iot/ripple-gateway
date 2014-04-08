var config = require("../config/nconf");
var Client = require('ripple-rest-client');

var client = new Client({
    api: 'http://localhost:5990/',
    account: config.get('gateway_hot_wallet').address,
    secret: ''
});

function poll(hash, fn){
    client.getPayment(hash, function(err, payment){
        if(err) {
            fn(err, null)
            return;
        } else {
            if(payment){
                fn(null, payment)
            } else {
                setTimeout(function(){
                    poll(hash, fn);
                }, 10000)
            }
        }
    });
}

module.exports = poll;