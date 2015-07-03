
var cheerio = require('cheerio'),
    request = require('request');

var exports = {};

exports.url = 'http://csgolounge.com';

exports.getMatches = function(callback){
    if(exports.matches){
        if(callback){
            callback(exports.matches);
        }
    } else{
        request(exports.url, function(error, response, html){

            if(!error){

                exports.matches = [];

                var $ = cheerio.load(html);

                $('#bets > .matchmain').each(function(i, elem) {
                    var time = $(this).find('.matchheader').find('.whenm').contents().first().text();

                    var $teams = $(this).find('.team').first().parent().parent().children();

                    var id = parseInt($teams.parent().attr('href').replace('match?m=', ''));

                    var $team1 = $teams.first().find('.teamtext').children();
                    var $team2 = $teams.last().find('.teamtext').children();

                    var team1 = {
                        name: $team1.first().text(),
                        percentage: $team1.last().text()
                    };
                    var team2 = {
                        name: $team2.first().text(),
                        percentage: $team2.last().text()
                    };

                    var teams = [
                        team1, team2
                    ];
                    exports.matches.push({
                        id: id,
                        time: time,
                        teams: teams
                    });
                });

                if(callback){
                    callback(exports.matches);
                }
            }
        });
    }
};

exports.getMatch = function(matchId, callback){
    if(exports.matchesDetails){
        if(callback){
            callback(exports.matchesDetails);
        }
    } else{
        request(exports.url + '/match?m=' + matchId, function(error, response, html){
            if(!error){
                exports.matchesDetails = [];

                var $ = cheerio.load(html);


                if(callback){
                    callback(exports.matchesDetails);
                }
            }
        });
    }
}

module.exports = exports;