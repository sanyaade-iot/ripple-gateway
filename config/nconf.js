var nconf = require('nconf');

nconf
  .file({ file: './config/config.json' })
  .env();

nconf.defaults({
    'RIPPLE_REST_API': 'http://localhost:5990',
    'RIPPLE_CHARTS_API': 'http://RippleChartsStagingAPI-869095469.us-east-1.elb.amazonaws.com/api/exchangerates',
    'DATABASE_URL': 'postgres://postgres:password@localhost:5432/ripple_gateway',
    'RIPPLE_DATAMODEL_ADAPTER': 'ripple-gateway-data-sequelize-adapter',
    'RIPPLE_EXPRESS_GATEWAY': 'ripple-gateway-express',
    'SSL': true,
    'PORT': 5000,
    'HOST': 'localhost',
    'domain': 'example.com',

    'BTC_INBOUND' : '<bitcoin_wallet_address>',
    'EXCHANGE_ISSUER_ADDRESS' : 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    'BLOCKCHAIN_API_KEY': '<blockchain_api_key>',
    'USER_ID' : 1,
    "gateway_hot_wallet": {
        "address": "<hot_wallet_address>",
        "secret": "<hot_wallet_secret>",
        "id": "3"
    },
    'DISCOUNT_PERCENTAGE' : 10,
    'BTC_RECEIVE_NOTIFY' : ['abiy@ripple.com'],
    'XRP_SENT_NOTIFY' : ['abiy@ripple.com'],
    'SANE_PRICE_MIN' : 20000,
    'SANE_PRICE_MAX' : 40000,
    'XRP_LOW_BALANCE_WARNING' : 40,
    'XRP_LOW_BALANCE_EMAIL' : ['abiy@ripple.com'],
    'NUMBER_OF_CONFIRMATIONS': 2,

    'AMAZON_SES_CREDENTIALS': {
        'AWSAccessKeyId': '<aws_id>',
        'AWSSecretKey': '<aws_secret>'
    },
    'total_btc_received': 0
});

module.exports = nconf;
