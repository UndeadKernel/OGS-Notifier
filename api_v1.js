
function ApiWrapper()
{
   function request_user_data(callback)
   {
      var error_handler = function(jqXHR, textStatus) {
         callback.user_data_failed(textStatus);
      };

      var request = $.ajax({
         url      : "http://online-go.com/api/v1/me/",
         dataType : 'json',
         success  : callback.user_data_success,
         error    : error_handler,
      });

      request.fail(error_handler);
   }

   function request_game_info(game_id, callback)
   {
      var error_handler = function(jqXHR, textStatus) {
         callback.game_data_failed(game_id, textStatus);
      };

      var success_handler = function(data) {
         callback.game_data_success(game_id, data);
      }

      var request = $.ajax({
         url      : "http://online-go.com/api/v1/games/" + game_id,
         dataType : 'json',
         success  : success_handler,
         error    : error_handler,
      });

      request.fail(error_handler);
   }

   function request_my_games(callback_function)
   {
      url = "http://online-go.com/api/v1/me/games/?outcome=";
      _obtain_user_games(url, [], callback_function)
   }

   function _obtain_user_games(base_url, initial_data, callback_function)
   {
      $.ajax({
         url: base_url,
         dataType: 'json',
         success: function(data) {

            if (localStorage['debug'] == 1)
               console.log("_obtain_user_games: " + data.count + " from " + base_url);

            consolidated = initial_data.concat(data.results);

            // continue to obtain data from the API
            if (data.next != null) {
               _obtain_user_games(data.next, consolidated, callback_function);
               return;
            }

            if (localStorage['debug'] == 1)
               console.log("_obtain_user_games: received " + consolidated.length + " total games");

            callback_function(consolidated);
         }
      });
   }

   var that = {}
   that.request_game_info = request_game_info;
   that.request_user_data = request_user_data;
   that.request_my_games  = request_my_games;

   return that;
}
