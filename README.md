# CSGO Lounge API
## A NodeJS API for [csgolounge.com](http://csgolounge.com)

[![npm](https://img.shields.io/npm/v/csgolounge-api.svg?maxAge=2592000)](https://www.npmjs.com/package/csgolounge-api)

### How to install
```npm install --save csgolounge-api```  

### How to use 
```
var lounge = require('csgolounge-api');

lounge.getMatches(function(matches){
    console.log(matches);
});

lounge.getMatch(matchId, function(match){
    console.log(match);
});
```
