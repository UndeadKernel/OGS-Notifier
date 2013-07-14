
// Ensure that the timer continues polling.  Interruption can occur when a packet gets lost.
function keepAlive() {

   // check if the update timer's last timestamp was less than the current poll interval
   var curstamp = new Date().getTime();

   if (localStorage['timer_timestamp'] + localStorage['interval'] <= curstamp)
      return;

   // invalidate the old timer, just in case
   invalidateCurrentTimer();
   update();
   if (localStorage['debug'] == 1)
      console.log("keepAlive(): just reupped the timer");
}

function invalidateCurrentTimer()
{
   // DEBUG:
   if (localStorage['debug'] == 1)
      console.log("invalidateCurrentTimer(): timeout=" + localStorage['timeout-id']);

   if (localStorage['timeout-id'] !== '') {
      clearTimeout(localStorage['timeout-id']);
      localStorage['timeout-id'] = '';
   }
}

/*
 * Update the game count by polling
 */
function update() {
   chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});

   var root  = localStorage['url'];
   var view  = localStorage['include_viewed'] == 'true' ? "" : "?only_unviewed=true";
   var debug = localStorage['debug'] == 1;

   if (debug)
      console.log("Update called");

   $.ajax({
      url: root + "/includes/functions/ajax/gameCount.php" + view,
      context: document.body,
      success: function(response){

         var debug = localStorage['debug'] == 1;
         if (debug)
            console.log("Timer " + localStorage['timeout-id'] + " reported \""+ response + "\" ");

         // if we're not logged in, stop checking
         if (response == -1) {
            response = "err";
            localStorage['logged-in'] = 'false';
            invalidateCurrentTimer();

            if (debug)
               console.log("update(): not logged in");

         } else {
            localStorage['logged-in']   = 'true';

            if (debug)
               console.log("update(): logged in");
         }

         // wait for at least 5 seconds and reload the function
         var wait = Math.max(5000, localStorage['interval']);

         localStorage['timeout-id']      = setTimeout(update, wait);
         localStorage['timer_timestamp'] = new Date().getTime();

         if (debug)
            console.log("Started new timer " + localStorage['timeout-id'] + ", waiting "+ (wait / 1000) + " seconds");

         // update the numerical overlay
         if (response == 0 && localStorage['display_zero'] !== 'true')
            response = "";  // zero games = no badge

         chrome.browserAction.setBadgeText({text:response});
      }
   });
}

function initializeLocalStorage()
{
   localStorage['timeout-id']     = '';
   localStorage['interval']       = 20000;
   localStorage['logged-in']      = "false";
   localStorage['url']            = "http://www.online-go.com";
   localStorage['include_viewed'] = 'false';
   localStorage['display_zero']   = 'false';
}

function resetLocalStorage()
{
   localStorage.removeItem('timeout-id');
   localStorage.removeItem('interval');
   localStorage.removeItem('logged-in');
   localStorage.removeItem('url');
   localStorage.removeItem('include_viewed');
   localStorage.removeItem('display_zero');
   localStorage.removeItem('timer_timestamp');
   console.log("Options were removed from local storage");
}

function initialize() {

   localStorage['debug'] = 1; // debug on
   //localStorage['debug'] = 0; // debug off

   // DEBUG: clear existing values on load
   if (localStorage['debug'] == 1)
      resetLocalStorage();

   // load default settings if they're not there
   if (localStorage['logged-in'] === undefined) {
      if (localStorage['debug'] == 1)
         console.log("Initializing local storage");

      initializeLocalStorage();
   }

   // invalidate any stored counters when the browser starts up
   invalidateCurrentTimer();

   update(); // starts polling for games

   // ensure the updater keeps updating with 5-minute checks
   window.keep_alive = setInterval(keepAlive, 5 * 60 * 1000);
}

window.addEventListener("load", initialize);
