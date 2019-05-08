(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.liskConstants = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPOCH_TIME = new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0));
exports.EPOCH_TIME_MILLISECONDS = exports.EPOCH_TIME.getTime();
var MS_FACTOR = 1000;
exports.EPOCH_TIME_SECONDS = Math.floor(exports.EPOCH_TIME.getTime() / MS_FACTOR);
var MAX_EIGHT_BYTE_NUMBER = '18446744073709551615';
exports.MAX_ADDRESS_NUMBER = MAX_EIGHT_BYTE_NUMBER;
exports.MAX_TRANSACTION_ID = MAX_EIGHT_BYTE_NUMBER;
exports.MAX_TRANSACTION_AMOUNT = '9223372036854775807';
exports.SIGNED_MESSAGE_PREFIX = 'Lisk Signed Message:\n';
exports.TESTNET_NETHASH = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
exports.MAINNET_NETHASH = 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';

},{}]},{},[1])(1)
});
