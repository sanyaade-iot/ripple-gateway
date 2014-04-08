var nconf = require('../config/nconf');
var coldWalletAddress = nconf.get('gateway_cold_wallet');
var hot_wallet = nconf.get('gateway_hot_wallet');

var api = require("ripple-gateway-data-sequelize-adapter");

/**
* List Users
*
* @returns [{User}]
*/

function listUsers(fn) { 
  api.users.readAll(fn);
}

/**
* Clear Withdrawal
*
* @param {integer} id
* @returns [{User}]
*/

function clearWithdrawal(id, fn) {
  var opts = { 
    id: id, 
    status: "cleared"
  };  
  api.externalTransactions.update(opts, fn);
}

/**
* Register a User
* - creates external account named "default"
* - creates ripple address as provided
*
* @param {string} name
* @param {string} rippleAddress 
* @param {string} password
* @returns {User}, {ExternalAccount}, {RippleAddress}
*/

function registerUser(opts, fn) {
  var userOpts = { 
    name: opts.name,
    password: opts.password
  };  
  api.users.create(userOpts, function(err, user) {
    if (err) { fn(err, null); return; }
    var addressOpts = { 
      user_id: user.id,
      address: opts.rippleAddress,
      managed: false,
      type: "independent"
    };  
    api.rippleAddresses.create(addressOpts, function(err, ripple_address) {
      if (err) { fn(err, null); return; };
      api.externalAccounts.create({ name: "default", user_id: user.id }, function(err, account){
        if (err) { fn(err, null); return; }
        var addressOpts = { 
          user_id: user.id,
          address: coldWalletAddress,
          managed: true,
          type: "hosted",
          tag: account.id
        };  
        api.rippleAddresses.create(addressOpts, function(err, hosted_address) {
          var response = user.toJSON();
          response.ripple_address = ripple_address;
          response.external_account = account;
          response.hosted_address = hosted_address
          fn(err, response);
        }); 
      }); 
    }); 
  }); 
};

/**
* Record the deposit of an asset
*
* @param {string} currency
* @param {decimal} amount 
* @param {intenger} external_account_id 
* @param {function(err, deposit)} callback
* @returns {Deposit}
*/

function recordDeposit(opts, fn) {

  api.externalTransactions.create({
    external_account_id: opts.external_account_id,
    currency: opts.currency,
    amount: opts.amount,
    deposit: true,
    status: 'queued'
  }, fn); 

}

/**
* Finalize a deposit after processing
*
* @param {integer} id
* @param {integer} ripple_transaction_id 
* @param {function(err, deposit)} callback
* @returns {Deposit}
*/

function finalizeDeposit(opts, fn) {

  api.externalTransactions.update({ 
    id: opts.id,
    ripple_transaction_id: opts.ripple_transaction_id,
    status: "processed"
  }, fn);

}

/**
* List unprocessed deposits
*
* @param {function(err, deposit)} callback
* @returns [Deposit]
*/

function listQueuedDeposits(fn) {

  api.externalTransactions.readAll({
    deposit: true,
    status: 'queued'
  }, fn);

}

/**
* Add a payment to the outgoing queue
*
* @param {string} currency
* @param {decimal} amount
* @param {integer} ripple_address_id
* @param {function(err, deposit)} callback
* @returns [Payment]
*/

function enqueueOutgoingPayment(opts, fn) {

  api.rippleTransactions.create({
    to_amount: opts.amount,
    to_currency: opts.currency,
    to_issuer: coldWalletAddress,
    from_amount: opts.amount,
    from_currency: opts.currency,
    from_issuer: coldWalletAddress,
    to_address_id: opts.to_address_id,
    from_address_id: nconf.get('gateway_hot_wallet').id,
    transaction_state: 'outgoing'
  }, fn);
    
}

/**
* List outgoing payments
*
* @param {function(err, deposit)} callback
* @returns [Payment]
*/

function listOutgoingPayments(fn) {

  api.rippleTransactions.readAll({ transaction_state: 'outgoing' }, fn);

}

/**
* List incoming payments
*
* @param {function(err, deposit)} callback
* @returns [Payment]
*/

function listIncomingPayments(fn) {

  api.rippleTransactions.readAll({ transaction_state: 'incoming' }, fn);

}

/**
* Record incoming payment
*
* @param {integer} to_address_id
* @param {intgeger} from_address_id
* @param {decimal} to_amount
* @param {string} to_currency
* @param {string} to_issuer
* @param {decimal} from_amount
* @param {string} from_currency
* @param {string} from_issuer 
* @param {function(err, deposit)} callback
* @returns {Payment}
*/

function recordIncomingNotification(opts, fn) {

  if (opts.transaction_state == 'tesSUCCESS') {
    opts.transaction_state = 'incoming';
    api.rippleTransactions.create(opts, fn);
  } else {
    fn('state not tesSUCCESS', null);
  }

}

/**
* Record incoming payment
*
* @param {integer} id
* @param {string} transaction_state
* @param {string} transaction_hash 
* @param {function(err, deposit)} callback
* @returns {Payment}
*/

function recordOutgoingNotification(opts, fn) {

  api.rippleTransactions.update({ 
    id: opts.id,
    transaction_state: opts.transaction_state,
    transaction_hash: opts.transaction_hash
  }, fn);

}
/**
* Record incoming payment
*
* @param {function(err, deposit)} callback
* @returns [Withdrawals]
*/

function listPendingWithdrawals(fn) {
  api.externalTransactions.readAllPending(fn);
}

/**
* Issue Currency from Cold Wallet to Hot Wallet
* - the cold wallet's secret must be provided
*
* @param {string} currency 
* @param {decimal} amount 
* @param {string} secret
* @param {function(err, deposit)} callback
* @returns [Withdrawals]
*/

function issueCurrency(amount, currency, secret, fn) {
  var opts = {
    to_account: nconf.get('gateway_hot_wallet').address,
    from_account: nconf.get('gateway_cold_wallet'),
    amount: amount,
    currency: currency,
    issuer: nconf.get('gateway_cold_wallet'),
    secret: secret
  }

  sendCurrency(opts, fn);
}

/**
* Get the public address of the Gateway's cold wallet
* @returns [RippleAddress]
*/

function getColdWalletAddress() {
  return nconf.get('gateway_cold_wallet');
}

module.exports = {
  users: {
    register: registerUser,
    list: listUsers
  },
  deposits: {
    record: recordDeposit,
    listQueued: listQueuedDeposits,
    finalize: finalizeDeposit 
  },
  withdrawals: {
    listPending: listPendingWithdrawals,
    clear: clearWithdrawal
  },
  coldWallet: {
    issueCurrency: issueCurrency,
    getAddress: getColdWalletAddress
  },
  payments: {
    enqueueOutgoing: enqueueOutgoingPayment,
    listOutgoing: listOutgoingPayments,
    listIncoming: listIncomingPayments,
    recordIncomingNotification: recordIncomingNotification,
    recordOutgoingNotification: recordOutgoingNotification
  }
} 

