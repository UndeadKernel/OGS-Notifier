function BackgroundController()
{
   var that = {}

   // members
   //---------------------------------------------------------------------------
   that.api_user_object = null;
   that.api_game_list   = [];
   that.model_game_dict = {};
   that.wrap            = ApiWrapper();
   that.model           = null;
   that.my_turn_count   = null;
   that.my_total_count  = null;
   that.observers       = [];
   that.is_logged_in    = false;

   // private functions
   //---------------------------------------------------------------------------
   function _for_each_model(callback)
   {
      var models = that.model_game_dict;
      var keys = Object.keys(models);
      for (index in keys) {
         var key = keys[index];
         if (!models.hasOwnProperty(key))
            continue;

         callback(key, models);
      }
   }

   function remove_completed_games()
   {
      var remover = {};
      var to_remove = []

      function add_callback(key, models) {
         var game_object = models[key].api_game;
         var outcome = game_object.outcome;

         // remove games that have an outcome, or if the game list was cleared
         if (outcome === "" && that.api_game_list.length !== 0)
            return;

         if (localStorage['debug'] == 1)
            console.log("remove game " + game_object.id + " with outcome " + outcome);

         to_remove.push(key);
      }

      _for_each_model(add_callback);

      if (localStorage['debug'] == 1)
         console.log("remove_completed_games: " + to_remove);

      for (index in to_remove) {
         var key = to_remove[index];
         if (localStorage['debug'] == 1)
            console.log("removing: " + key);

         that.model_game_dict[key].stop_timer();
         delete that.model_game_dict[key];
      }
   }

   function construct_game_info()
   {
      if (that.api_user_object === null)
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

   function user_games_success(api_game_list)
   {
      that.is_logged_in = true;
      that.api_game_list = api_game_list;
      construct_game_info();
   }

   function user_data_failure(status)
   {
      if (!this.is_logged_in)
         return;

      this.is_logged_in = false;
      that.api_game_list = [];
      construct_game_info();
      that.api_user_object = null;

      _for_each_observer(function(obs) { obs.user_data_failed(that); });
   }

   function user_data_success(api_user_object)
   {
      that.is_logged_in = true;
      that.api_user_object = api_user_object;
      that.wrap.request_my_games(user_games_success);
      construct_game_info();
   }

   function request_my_data() {
      that.wrap.request_user_data(that);
   }

   function _update_turn_count() {

      var count = 0;
      var games = 0;

      function update_callback(key, models) {
         var game_object = models[key];
         games++;

         // game data has not arrived yet
         if (game_object.game_data === null)
            return;

         if (game_object.game_data.my_turn)
            count++;
      }

      _for_each_model(update_callback);
      that.my_turn_count  = count;
      that.my_total_count = games;
   }

   function _for_each_observer(callback)
   {
      for (key in that.observers) {
         if (!that.observers.hasOwnProperty(key))
            continue;

         callback(that.observers[key]);
      }
   }

   function game_data_updated()
   {
      _update_turn_count();
      _for_each_observer(function(obs) { obs.game_data_updated(that); });
   }

   function popup_listener(request, sender, callback)
   {
      if (!that.is_logged_in) {
         callback(null);
         return;
      }

      var games = [];

      function append_callback(key, models) {
         var game_data = models[key].game_data;
         if (game_data.my_turn)
            games.push(game_data);
      }

      _for_each_model(append_callback);
      callback(games);
   }

   // public_functions
   //---------------------------------------------------------------------------
   //
   // api interaction
   that.user_data_failed  = user_data_failure;
   that.user_data_success = user_data_success;

   // model interaction
   that.game_data_failed  = function (id, text) { console.log("game_data_failed: " + id + " " + text); };
   that.game_data_updated = game_data_updated;

   // remainder of constructor calls
   //---------------------------------------------------------------------------
   chrome.runtime.onMessage.addListener(popup_listener);
   request_my_data();

   // check for new data
   setInterval(request_my_data,  localStorage['login_check_interval']);

   return that;
}

function BadgeUpdater()
{
   var that = {};

   that.user_data_failed  = function(controller) {
      chrome.browserAction.setBadgeText({text:"Err"});
   }
   that.game_data_updated = function(controller) {
      var count = (localStorage['game_count_only_my_turn']
         ? controller.my_turn_count
         : controller.my_total_count);

      var display = (count !== 0 || localStorage['display_zero']
            ? "" + count
            : "");

      chrome.browserAction.setBadgeText({text:display});
   };

   return that;
}
