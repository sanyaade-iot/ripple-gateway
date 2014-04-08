var gateway = require('./gateway');
var EventEmitter = require("events").EventEmitter;
var util = require('util');

var queue = new EventEmitter; 

function pollQueued(fn) {
  gateway.deposits.listQueued(function(err, deposits) {
    if (err) {
      console.log('error:', err);
    } else {
      if (deposits[0]) {
        queue.emit('deposit', deposits[0]);
      } 
    }
    setTimeout(function() {
      fn(pollQueued);
    }, 5000);
  });
}

queue.work = function() {
  pollQueued(pollQueued);
}

module.exports = queue;

