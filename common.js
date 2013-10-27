
function GamePage(data) {

   var that = {};

   that.data = data;
   that.games = [];

   var getUserName = function (data) {
      var regex = /var global_user = .*username: "(.*?)".*;/
      var matches = regex.exec(data);

      return matches === null ? "" : matches[1];
   }

   var getGameList = function (data) {
      var regex = /var list = (.*?);/
      var matches = regex.exec(data);

      if (matches === null)
         return [];

      var gameList = JSON.parse(matches[1]);

      return gameList.length ? gameList : [];
   }

   that.user  = getUserName(data);
   that.games = getGameList(data);

   return that;
}

function GameData(game, user)
{
   var describe = function (time)
   {
      if (typeof time != "number")
         return time;

      var days  = Math.floor(time / 86400);
      time -= days * 86400;

      var hours = Math.floor(time / 3600);
      time -= hours * 3600;

      var minutes = Math.floor(time / 60);
      time -= minutes * 60;

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

   var timeLeft = function () {
      var clock   = game.json.clock;
      var my_time = game.black.username === user ? clock.black_time : clock.white_time;
      return my_time.thinking_time;
   }

   var getOpponent = function () {
      var black = game.black;
      var white = game.white;
      return black.username === user ? white.username : black.username;
   }

   var isMyTurn = function () {
      var current_player_id    = game.json.clock.current_player;
      var current_player_black = current_player_id === game.json.black_player_id;
      var current_player_name  = current_player_black ? game.black.username : game.white.username;
      return current_player_name === user;
   }

   var createLink = function () {
      var game_num  = game.json.game_id;
      return "http://online-go.com/game/" + game_num;
   }

   var that = {};

   that.time_left = timeLeft()
   that.time_desc = describe(that.time_left)
   that.my_turn   = isMyTurn();
   that.opponent  = getOpponent();
   that.link      = createLink();

   return that;
}

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

         var page = GamePage(data);

         if (localStorage['debug'] == 1)
            console.log("Data arrived for " + page.user);

         if (page.user.length === 0) {
            localStorage['logged-in'] = false;
            set_initial_display_state("login");
            chrome.browserAction.setBadgeText({text:"Err"});
            return;
         }

         localStorage['logged-in'] = true;
     
         if (page.games.length == 0)
            return;

         if (localStorage['debug'] == 1)
            console.log("Parsing " + page.games.length + " total games");

         callback(page, requestTime);
      }
   });
}
