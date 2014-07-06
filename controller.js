

function Controller()
{
   function _updateBadge(api_game_list, api_user_object)
   {
      var count = 0;
      var total = api_game_list.length;

      for (var ii = 0; ii < total; ++ii) {
         var game = api_game_list[ii];
         var data = GameData(game, api_user_object);
         var turn = data.my_turn;

         if (turn)
            count++;
      }

      var display = (count !== 0 || localStorage['display_zero']
         ? "" + count
         : "");

         chrome.browserAction.setBadgeText({text:display});
   }

   var that = {}

   // members
   //---------------------------------------------------------------------------
   that.api_user_object = null;
   that.api_game_list   = null;
   that.model_game_dict = {};
   that.wrap = ApiWrapper();
   that.model = null;

   // private functions
   //---------------------------------------------------------------------------
   function remove_completed_games() {
      var to_remove = []

      var models = that.model_game_dict;
      var keys = Object.keys(models);
      for (key in keys) {
         if (!models.hasOwnProperty(key))
            continue;

         var game_object = models[key].api_game;
         var outcome = game_object.outcome 
         if (outcome === "") {
            if (localStorage['debug'] == 1)
               console.log("remove game " + game_object.id + " with outcome " + outcome);

            to_remove.append(key);
         }
      }

      for (key in to_remove)
         delete that.model_game_dict[key];
   }

   function construct_game_info()
   {
      if (that.api_user_object === null)
         return;

      if (that.api_game_list === null)
         return;

      if (localStorage['debug'] == 1)
         console.log("user=" + that.api_user_object.username + " data_count=" + that.api_game_list.length);

      // Add any unseen games to the game list; GameObject requests data from the api
      var length = that.api_game_list.length;
      for (var ii = 0; ii < length; ++ii) {
         var api_game = that.api_game_list[ii];
         var game_id = "" + api_game.id;

         if (!that.model_game_dict.hasOwnProperty(game_id)) {
            if (localStorage['debug'] == 1)
               console.log("creating game object for " + api_game.id);

            that.model_game_dict[game_id] = GameObject(api_game,
                                                       that.api_user_object,
                                                       that.wrap,
                                                       that);
         }
      }

      remove_completed_games();
   }

   function user_games_success(api_game_list) {
      that.api_game_list = api_game_list;
      construct_game_info();
   }

   function user_data_success(api_user_object) {
      that.api_user_object = api_user_object;
      construct_game_info();
   }

   function request_my_games() {
      that.wrap.request_my_games(user_games_success);
   }

   function request_my_data() {
      that.wrap.request_user_data(that);
   }

   // public_functions
   //---------------------------------------------------------------------------
   //
   // api interaction
   that.user_data_failed = function(status) { console.log("user_data_failed: " + status); };
   that.user_data_success = user_data_success;

   // model interaction
   that.game_data_failed = function (id, text) { console.log("game_data_failed: " + id + " " + text); };
   that.game_data_updated = function() { console.log("game_data_updated"); };

   // remainder of constructor calls
   //---------------------------------------------------------------------------
   request_my_games();
   request_my_data();

   // check for new games
   var delay = localStorage['update_interval'];
   setInterval(request_my_games, delay);
   setInterval(request_my_data,  delay);
}

function initialize()
{
   window.controller = Controller();
}


window.addEventListener("load", initialize);
