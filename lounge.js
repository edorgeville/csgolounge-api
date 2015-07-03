
var cheerio = require('cheerio'),
    request = require('request');

var lounge = {};

lounge.url = 'http://csgolounge.com';

lounge.getMatches = function(callback){
    if(lounge.matches){
        if(callback){
            callback(lounge.matches);
        }
    } else{
        request(lounge.url, function(error, response, html){

            if(!error){

                lounge.matches = [];

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
                    lounge.matches.push({
                        id: id,
                        time: time,
                        teams: teams
                    });
                });

                if(callback){
                    callback(lounge.matches);
                }
            }
        });
    }
};

lounge.matchesDetails = [];

lounge.getMatch = function(matchId, callback){
    if(lounge.matchesDetails[matchId]){
        if(callback){
            callback(lounge.matchesDetails[matchId]);
        }
    } else{
        request(lounge.url + '/match?m=' + matchId, function(error, response, html){
            if(!error){

                var $ = cheerio.load(html);

                $teams = $('main section').first().find('a');

                $team1 = $teams.eq(0);
                $team2 = $teams.eq(1);

                team1Name = $team1.find('b').text();
                team2Name = $team2.find('b').text();

                // console.log(team2Name);

                var winner;

                if(team1Name.indexOf("(win)") > -1){
                    team1Name = team1Name.replace(' (win)', '');
                    winner = 0;
                }else if(team2Name.indexOf("(win)") > -1){
                    team2Name = team2Name.replace(' (win)', '');
                    winner = 1;
                }

                var team1 = {
                    name: team1Name
                };

                var team2 = {
                    name: team2Name
                };

                var match = {};
                match.id = matchId;
                match.teams = [team1, team2];
                if (winner !== undefined){
                    match.winner = winner;
                }

                lounge.matchesDetails[matchId] = match;

                if(callback){
                    callback(lounge.matchesDetails[matchId]);
                }
            }
        });
    }
}

lounge.watchers = [];

lounge.watchMatch = function(matchId, callback){
    lounge.log('Now watching match #' + matchId);
    lounge.watchers[matchId] = setInterval(function(){
        lounge.getMatch(matchId, function(match){
            if(callback){
                callback(match);
            }
        });
    }, 1000 * 10); // Every 10 sec
}

lounge.stopWatchMatch = function(matchId){
    clearInterval(lounge.watchers[matchId]);
    lounge.log('Stopped watching match #' + matchId);
}

lounge.onWin = function(matchId, callback){
    lounge.watchMatch(matchId, function(match){
        if(match.winner !== undefined){
            lounge.log(match.teams[match.winner].name + ' won match #' + matchId);
            lounge.stopWatchMatch(matchId);
            callback(match);
        }
    });
}

lounge.log = function(message){
    console.log('[lounge] ' + message);
}

module.exports = lounge;