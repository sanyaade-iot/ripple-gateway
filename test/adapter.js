var assert = require('assert');

// Enable testing of any adapter by passing in name of file in /adapters
var adapterName = process.env.ADAPTER || 'test_adapter';
var Adapter = require('../adapters/'+adapterName).Adapter;

describe('Data Adapter', function(){
  before(function(){
    adapter = new Adapter;
  });
  it('should have CRUD operations for users', function(done){
    assert(typeof adapter.getUser == 'function');
    assert(typeof adapter.listUsers == 'function');
    assert(typeof adapter.createUser == 'function');
    assert(typeof adapter.updateUser == 'function');
    assert(typeof adapter.destroyUser == 'function');
    done();
  });
  it('should have CRUD operations for ripple addresses', function(done){
    assert(typeof adapter.getRippleAddress == 'function');
    assert(typeof adapter.listRippleAddress == 'function');
    assert(typeof adapter.createRippleAddress == 'function');
    assert(typeof adapter.updateRippleAddress == 'function');
    assert(typeof adapter.destroyRippleAddress == 'function');
    done();
  });
  it('should have CRUD operations for ripple payments', function(done){
    assert(typeof adapter.getRipplePayment == 'function');
    assert(typeof adapter.listRipplePayments == 'function');
    assert(typeof adapter.createRipplePayment == 'function');
    assert(typeof adapter.updateRipplePayment == 'function');
    assert(typeof adapter.destroyRipplePayment == 'function');
    done();
  });
  it('should have CRUD operations for external accounts', function(done){
    assert(typeof adapter.getExternalAccount == 'function');
    assert(typeof adapter.listExternalAccounts == 'function');
    assert(typeof adapter.createExternalAccount == 'function');
    assert(typeof adapter.updateExternalAccount == 'function');
    assert(typeof adapter.destroyExternalAccount == 'function');
    done();
  });
  it('should have CRUD operations for external transactons', function(done){
    assert(typeof adapter.getExternalTransaction == 'function');
    assert(typeof adapter.listExternalTransactions == 'function');
    assert(typeof adapter.createExternalTransaction == 'function');
    assert(typeof adapter.updateExternalTransaction == 'function');
    assert(typeof adapter.destroyExternalTransaction == 'function');
    done();
  });
  it('should have operations for external balances', function(done){
    assert(typeof adapter.getExternalBalance == 'function');
    assert(typeof adapter.listExternalBalances == 'function');
    assert(typeof adapter.createExternalBalance == 'function');
    assert(typeof adapter.updateExternalBalance == 'function');
    assert(typeof adapter.destroyExternalBalance == 'function');
    done();
  });
  it('should have operations for hosted ripple balances', function(done){
    assert(typeof adapter.getHostedRippleBalance == 'function');
    assert(typeof adapter.listHostedRippleBalances == 'function');
    assert(typeof adapter.createHostedRippleBalance == 'function');
    assert(typeof adapter.updateHostedRippleBalance == 'function');
    assert(typeof adapter.destroyHostedRippleBalance == 'function');
    done();
  });
  it('should have operations for hosted ripple balances', function(done){
    assert(typeof adapter.getUserBalance == 'function');
    assert(typeof adapter.listUserBalances == 'function');
    assert(typeof adapter.createUserBalance == 'function');
    assert(typeof adapter.updateUserBalance == 'function');
    assert(typeof adapter.destroyUserBalance == 'function');
    done();
  });
});
