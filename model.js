function GameData(api_game_object, api_user_object)
{
   var describe = function (time)
   {
      if (typeof time != "number")
         return time;

      // convert to seconds
      time = time / 1000;

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

   var getOpponent = function () {
      var black = api_game_object.players.black.username;
      var white = api_game_object.players.white.username;
      return black === api_user_object.username ? white : black;
   }

   var isMyTurn = function () {
      var white_user = api_game_object.players.white.username;
      var user_is_white = white_user == api_user_object.username;
      var clock = api_game_object.gamedata.clock;
      var user_id = user_is_white ? clock.white_player_id : clock.black_player_id;

      return user_id == clock.current_player;
   }

   var that = {};

   that.time_left = api_game_object.gamedata.clock.expiration_delta; // millis
   that.time_desc = describe(that.time_left)
   that.my_turn   = isMyTurn();
   that.opponent  = getOpponent();
   that.link      = "http://online-go.com/game/" + api_game_object.id;

   return that;
}

function GameObject(api_game_object, api_user_object, api_wrapper, controller)
{
   var that = {}

   // data members
   //---------------------------------------------------------------------------
   that.api_game   = api_game_object;
   that.api_user   = api_user_object;
   that.api_wrap   = api_wrapper;
   that.controller = controller;
   that.game_data  = null;

   // private functions
   //---------------------------------------------------------------------------
   var request_api_data = function() {
      api_wrapper.request_game_info(that.api_game.id, callback_wrap);
   }

   var start_timer = function() {
      var delay = localStorage['update_interval'];
      window.setTimeout(request_api_data, delay);
   }

   // interact with api wrapper
   //---------------------------------------------------------------------------
   var callback_wrap = {};
   callback_wrap.game_data_success = function(game_id, new_api_game_object) {
      that.api_game = new_api_game_object;
      that.game_data = GameData(that.api_game, that.api_user);
      start_timer();
      controller.game_data_updated();
   }
   callback_wrap.game_data_failed = function(id, text) {
      controller.game_data_failed(id, text);
   }

   // complete setup
   //---------------------------------------------------------------------------
   request_api_data();
   return that;
}
