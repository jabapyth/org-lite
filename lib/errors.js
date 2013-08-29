
var util = require('util');

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || 'Error';
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var newError = function(name, fn, parent) {
  util.inherits(fn, parent || AbstractError);
  fn.prototype.name = name;
  return fn;
};

var BaseParseError = newError('Base Parse Error', function(msg, constr) {
  BaseParseError.super_.call(this, msg, this.constructor);
});

var ParseError = newError('Parser Error', function (fname, lineno, msg) {
  msg = 'Parse Error in "' + fname + '" at line ' + lineno + ': ' + msg;
  ParseError.super_.call(this, msg, this.constructor);
}, BaseParseError);

var SSyntaxError = newError('Syntax Error', function (input, msg) {
  msg = 'Parse Error: ' + msg + ' (input "' + input + '")';
  SSyntaxError.super_.call(this, msg, this.constructor);
}, BaseParseError);

var oSyntaxError = newError('Syntax Error', function (fname, lineno, msg) {
  msg = 'Parse Error in "' + fname + '" at line ' + lineno + ': ' + msg;
  SyntaxError.super_.call(this, msg, this.constructor);
}, BaseParseError);

module.exports = {
  ParseError: BaseParseError,
  SyntaxError: oSyntaxError,
  SSyntaxError: SSyntaxError
};
