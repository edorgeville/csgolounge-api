# CSGO Lounge API
## A NodeJS API for [csgolounge.com](http://csgolounge.com)

### How to use 
```
var lounge = require('csgolounge-api');

lounge.getMatches(function(matches){
    console.log(matches);
});
```