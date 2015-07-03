# CSGO Lounge API
## A NodeJS API for [csgolounge.com](http://csgolounge.com)

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