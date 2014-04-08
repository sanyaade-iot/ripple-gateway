var fs    = require('fs'),
	nconf = require('nconf');

nconf
	.file({file: './config/inbound_config.json'})
	.env();


nconf.defaults({
	'BTC_INBOUND' : '1AbwTNnCN2KgbP43oudZFe4YPsTdT2y4B5',
	'EXCHANGE_ISSUER_ADDRESS' : 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
	'BLOCKCHAIN_API_KEY': '5cb5f110-39a4-4f8f-b25e-eb1c14cc9ebb',
    'USER_ID' : 1,
	'XRP_DELIVER' : 'r456',
	'XRP_FUND' : 'r123',
	'XRP_FUND_SECRET' : 'sXYZ',
	'DISCOUNT_PERCENTAGE' : 10,
	'BTC_RECEIVE_NOTIFY' : ['abiy@ripple.com'],
	'XRP_SENT_NOTIFY' : ['abiy@ripple.com'],
	'SANE_PRICE_MIN' : 20000,
	'SANE_PRICE_MAX' : 40000,
	'XRP_LOW_BALANCE_WARNING' : 40,
	'XRP_LOW_BALANCE_EMAIL' : ['abiy@ripple.com'],
	'NUMBER_OF_CONFIRMATIONS': 2,
    'TOTAL_BTC_RECEIVED': 0
});

module.exports = nconf;