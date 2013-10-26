
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

function updateBadge(gameList, user, requestTime)
{
   var count = 0;
   for (var ii = 0; ii < gameList.length; ++ii) {
      var game = gameList[ii];
      var data = extractData(game, user);
      var turn = data[1].turn;

      if (turn)
         count++;
   }

   chrome.browserAction.setBadgeText({text:"" + count});
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

   begin_scrape(updateBadge);
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
