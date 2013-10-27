
/*
 * Update the game count by polling
 */
function update() {

   if (localStorage['debug'] == 1)
      console.log("Update called");

   begin_scrape(updateBadge);
}

function initializeLocalStorage()
{
   localStorage['logged-in']    = "false";
   localStorage['display_zero'] = 'false';
}

function resetLocalStorage()
{
   localStorage.removeItem('logged-in');
   localStorage.removeItem('display_zero');
   console.log("Options were removed from local storage");
}

function initialize() {

   //localStorage['debug'] = 1; // debug on
   localStorage['debug'] = 0; // debug off

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
   update();

   // ensure the updater keeps updating with 5-minute checks
   window.keep_alive = setInterval(update, 5 * 60 * 1000);
}

window.addEventListener("load", initialize);
