
function set_initial_display_state(area)
{
   $('#games-injection').hide();
   $('#games.injection').html("");

   if (area == "login") {
      $('#remote-information').hide();
      $('#ajax-loader').hide();
      $('#login-wrapper').show();
   }
   else {
      $('#remote-information').show();
      $('#ajax-loader').show();
      $('#login-wrapper').hide();
   }
}

function getUserName(data)
{
   var regex = /var global_user = (.*);/
   var matches = regex.exec(data);
   if (matches === null) {
      return "";
   }

   var user_contents = matches[1];
   var user_creator  = new Function("return " + user_contents + ";");
   var global_user   = user_creator();

   if (global_user === undefined || global_user === null)
      return "";

   return global_user.username;
}

function timeLeft(time)
{
   var days  = Math.floor(time / 86400);
   time -= days * 86400;

   var hours = Math.floor(time / 3600);
   time -= hours * 3600;

   var minutes = Math.floor(time / 60);
   time -= minutes * 60;

   time = Math.floor(time);

   var description = "";
   if (days > 0)
      description += "" + days + "d ";

   if (hours > 0)
      description += "" + hours + "h ";

   if (days > 0 && hours > 0)
      return description;

   if (minutes > 0)
      description += "" + minutes + "m ";

   return description;
}

function extractData(game, user)
{
   var black = game.black;
   var white = game.white;

   var me  = black.username === user ? black : white;
   var opp = black.username === user ? white : black;

   var clock    = game.json.clock;
   var current_player_id   = clock.current_player;
   var current_player_name = current_player_id === game.json.black_player_id
                           ? black.username 
                           : white.username;
   var my_turn = current_player_name === user;

   var my_time  = black.username === user ? clock.black_time : clock.white_time;
   var opp_name = opp.username;

   var game_data = game.json;
   var game_num  = game_data.game_id;
   var time_left = my_time.thinking_time;
   var remaining = timeLeft(time_left);

   var link = "http://online-go.com/game/" + game_num;

   return [ time_left, { time: remaining, link: link, opponent: opp_name, turn: my_turn} ];
}

function begin_scrape(callback)
{
   // clear the results container, show ajax spinner, hide html result wrapper
   set_initial_display_state("games");

   // query and scrape the game list
   var requestTime = new Date().getTime();
   $.ajax({
      url: "http://online-go.com/games",
   dataType: 'text',
   success: function(data) {

      var user = getUserName(data);
      var debug = localStorage['debug'] == 1;

      if (debug)
         console.log("Data arrived for " + user);

      if (user.length === 0) {
         return;
      }

      var regex = /var list = (.*?);/
      var matches = regex.exec(data);

      if (matches === null) {
         console.log(data);
         return;
      }

      var gameList = JSON.parse(matches[1]);

      if (!gameList.length)
         return;

      if (debug)
         console.log("Parsing " + gameList.length + " total games");

      callback(gameList, user, requestTime);
   }
   });
}
