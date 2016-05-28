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

				$('#bets > .matchmain').has(".matchleft").each(function(i, elem) {
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

						// added by derpierre65
						var matchType = parseInt($(this).find('.match').find('.format').text().substr(2));
						var teamLogo1 = $team1.parent().parent().find('.team').css()['background'];
						var teamLogo2 = $team2.parent().parent().find('.team').css()['background'];
						var winner = 0;
						var matchLogo = $(this).find('.match').css()['background-image'];
						matchLogo = matchLogo.substr(1, matchLogo.length - 2);

						if ($teams.first().find('.team img').length > 0) winner = 1;
						else if ($teams.last().find('.team img').length > 0) winner = 2;

						var timestamp = Math.round((new Date()).getTime() / 1000),
						test = time.split(' '),
						check = time.split(test[0] + ' ');

						switch (check[1]) {
							case 'seconds from now':
							case 'second from now':
							timestamp += test[0];
							break;
							case 'seconds ago':
							case 'second ago':
							timestamp -= test[0];
							break;
							case 'minutes from now':
							case 'minute from now':
							timestamp += test[0] * 60;
							break;
							case 'minutes ago':
							case 'minute ago':
							timestamp -= test[0] * 60;
							break;
							case 'hours ago':
							case 'hour ago':
							timestamp -= test[0] * 3600;
							break;
							case 'hours from now':
							case 'hour from now':
							timestamp += test[0] * 3600;
							break;
							case 'days ago':
							case 'day ago':
							timestamp -= test[0] * 86400;
							break;
							case 'days from now':
							case 'day from now':
							timestamp += test[0] * 86400;
							break;
							default:
							lounge.log('time not found:', time);
						}

						lounge.matches.push({
							id: id,
							time: time,
							winner: winner,
							timestamp: timestamp,
							type: matchType,
							matchLogo: matchLogo.substr(4, matchLogo.length - 5),
							matchname: $(this).find('.matchheader').find('.eventm').text(),
							teams: [team1, team2],
							teamLogos: [teamLogo1.substr(5, teamLogo1.length - 7), teamLogo2.substr(5, teamLogo2.length - 7)]
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

				var languages = [];
				$(".tab").each(function (){
					languages.push($(this).text().split("Stream")[0].trim());
				});

				var match = {};
				match.id = matchId;
				match.teams = [team1, team2];
				match.languages = languages;
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

lounge.findStream = function(matchid, language, callback){
	request.post({url:'http://csgolounge.com/ajax/choseStream.php', form: {m:matchid,lang:language}}, function(err,httpResponse,body){
		if (err) lounge.log(err);
		else {
			var stream= {type: "unknown"} , page = null;
			if (body) {
				var page = cheerio.load(body);
				page("iframe").each(function(){
					var iframeSrc = page(this).attr("src");

					if (iframeSrc.indexOf("hitbox.tv/embedchat") != -1){
						stream.type="hitbox";
						stream.embedchat = iframeSrc.replace("//","");
					}
					else if (iframeSrc.indexOf("hitbox.tv/embed/") != -1){
						stream.type="hitbox";
						stream.embedplayer = iframeSrc.replace("//","");
						stream.url = stream.embedplayer.replace("/embed","");
					}
					else if ((iframeSrc.indexOf("www.twitch.tv") != -1) && (iframeSrc.indexOf("chat?") != -1)){
						stream.type="twitch";
						stream.embedchat = iframeSrc.replace("//","").replace("?popout=","");
					}
					else if (iframeSrc.indexOf("player.twitch.tv") != -1){
						stream.type="twitch";
						stream.embedplayer = iframeSrc.replace("//","").split("&autoplay")[0];
						stream.url = stream.embedplayer.replace("//player","www").replace("?channel=","");
					}
				});
			}
			if (callback){
				callback(stream)
			}
		}
	});
}



	module.exports = lounge;
