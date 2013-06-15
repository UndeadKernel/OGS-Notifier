function initialize() {

   document.getElementById("login_link").addEventListener("click", gotoLogin);
   //localStorage['debug'] = 1; // debug on
   localStorage['debug'] = 0; // debug off

   // DEBUG: clear existing values on load
   if (localStorage['debug'] == 1) {
      localStorage.removeItem('timeout-id');
      localStorage.removeItem('interval');
      localStorage.removeItem('logged-in');
      localStorage.removeItem('url');
      localStorage.removeItem('include_viewed');
      localStorage.removeItem('display_zero');
      localStorage.removeItem('timer_timestamp');
      console.log("Options were removed from local storage");
   }

   // load default settings if they're not there
   if (localStorage['logged-in'] === undefined) {
      localStorage['timeout-id']     = '';
      localStorage['interval']       = 20000;
      localStorage['logged-in']      = "false";
      localStorage['url']            = "http://www.online-go.com";
      localStorage['include_viewed'] = 'false';
      localStorage['display_zero']   = 'false';
   }

   // invalidate any stored counters when the browser starts up
   invalidateCurrentTimer();

   update(); // starts polling for games

   // ensure the updater keeps updating with 5-minute checks
   window.keep_alive = setInterval(keepAlive, 5 * 60 * 1000);
}

window.addEventListener("load", initialize);

