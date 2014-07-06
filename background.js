function initializeLocalStorage()
{
   localStorage['logged-in']    = "false";
   localStorage['display_zero'] = 'false';
   localStorage['game_update_interval'] = 5 * 60 * 1000;
   localStorage['login_check_interval'] = 5 * 1000;
}

function resetLocalStorage()
{
   localStorage.removeItem('logged-in');
   localStorage.removeItem('display_zero');
   localStorage.removeItem('game_update_interval');
   localStorage.removeItem('login_check_interval');

   console.log("Options were removed from local storage");
}

function initialize() {

   localStorage['debug'] = 1;

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

   // ensure the updater keeps updating with 5-minute checks
   //window.keep_alive = setInterval(update, 5 * 60 * 1000);
}

window.addEventListener("load", initialize);
