function initializeLocalStorage()
{
   localStorage['logged-in']    = 'false';
   localStorage['display_zero'] = 'false';
   localStorage['game_update_interval'] = 10 * 1000;
   localStorage['login_check_interval'] = 5 * 1000;
   localStorage['game_count_only_my_turn'] = 'false';
}

function resetLocalStorage()
{
   localStorage.removeItem('logged-in');
   localStorage.removeItem('display_zero');
   localStorage.removeItem('game_update_interval');
   localStorage.removeItem('login_check_interval');
   localStorage.removeItem('game_count_only_my_turn');
}

function DebugObserver()
{
   var that = {};
   that.user_data_failed = function(c) { console.log("Logged Out"); };
   that.game_data_updated = function (controller_caller) {
      console.log("game_data_updated: " + controller_caller.api_user_object.username
                  +  " count=" + controller_caller.my_turn_count);
   };

   return that;
}


function initialize() {

   localStorage['debug'] = 0;

   // DEBUG: clear existing values on load
   if (localStorage['debug'] == 1)
      resetLocalStorage();

   // load default settings if they're not there
   if (localStorage['logged-in'] === undefined) {
      if (localStorage['debug'] == 1)
         console.log("Initializing local storage");

      initializeLocalStorage();
   }

   chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});


   window.badge_updater = BadgeUpdater();
   window.badge_updater.user_data_failed(); // show 'Err'


   window.background_controller = BackgroundController();
   window.background_controller.observers.push(window.badge_updater);

   if (localStorage['debug'] == 1)
      window.background_controller.observers.push(DebugObserver());
}

window.addEventListener("load", initialize);
