
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

// Ensure that the timer continues polling.  Interruption can occur when a packet gets lost.
function keepAlive() {

   // check if the update timer's last timestamp was less than the current poll interval
   var curstamp = new Date().getTime();

   if (localStorage['timer_timestamp'] + localStorage['interval'] > curstamp)
   {
      // invalidate the old timer, just in case
      invalidateCurrentTimer();
      update();
      if (localStorage['debug'] == 1) {
         console.log("Keep Alive: just reupped the timer");
      }
   }
}

// shorthand for creating dom elements
function create(tag) {
   return $(document.createElement(tag));
}

function invalidateCurrentTimer()
{
   // DEBUG:
   if (localStorage['debug'] == 1) {
      console.log("Clearing old timer: " + localStorage['timeout-id']);
   }

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

   var root = localStorage['url'];
   var view = localStorage['include_viewed'] == 'true' ? "" : "?only_unviewed=true";

   $.ajax({
      url: root + "/includes/functions/ajax/gameCount.php" + view,
      context: document.body,
      success: function(response){

         // if we're not logged in, stop checking
         if (response == -1) {
            response = "err";
            localStorage['logged-in'] = 'false';
            invalidateCurrentTimer();

         } else {

            localStorage['logged-in']   = 'true';
         }

         // wait for at least 5 seconds and reload the function
         var wait = Math.max(5000, localStorage['interval']);

         localStorage['timeout-id']      = setTimeout(update, wait);
         localStorage['timer_timestamp'] = new Date().getTime();

         // DEBUG:
         if (localStorage['debug'] == 1) {
            console.log("Started new timer " + localStorage['timeout-id'] + ", waiting "+ (wait / 1000) + " seconds");
         }


         // DEBUG:
         if (localStorage['debug'] == 1) {
            console.log("Timer " + localStorage['timeout-id'] + " reported \""+ response + "\" ");
         }

         // update the numerical overlay
         if (response == 0 && localStorage['display_zero'] !== 'true')
            response = "";  // zero games = no badge
         chrome.browserAction.setBadgeText({text:response});
      }
   });

   build_popup();
}

function gotoLogin() {
   var root = localStorage['url'];
   chrome.tabs.create( {url: root+"/login.php"} );
}

function build_popup() {

   var root = localStorage['url'];
   var view = localStorage['include_viewed'] == 'on' ? "" : "?only_unviewed=true";

   // check if loggged in
   var response;

   if (localStorage['logged-in'] === 'false') {

      $('#login-wrapper').show();

      // on submission, create a new tab, send the login information
      $('#submit').click( function(event) {

         $.ajax({
            type: 'POST',
            url: root+"/includes/functions/ajax/login.php",
            data: {passWord: $('#password').attr("value"), userName: $('#username').attr("value")},
            success: function(response){
               if (response == 'ok') {
                  localStorage['logged-in'] = true;
                  update();
               }
               $('#message').html(response);
               $('#message').show();
               setTimeout( function() { $('#message').hide();} , 5000);
            }
         });

         event.stopPropagation();
      });

   } else {

      // clear the results container
      $('#remote-information').show();
      $('#games.injection').html("");
      $('#login-wrapper').hide();

      // pop up a new mygames when when the link is clicked
      $('#mygames-link').attr('href', root + "/games/mygames.php").click( function() {
         chrome.tabs.create( {url: $(this).attr('href') } );
      });


      // download the game/message information from the notifier
      var notifierURL = root+"/games/xmlnotifier.php?format=json";
      /*
         {
         "id"           : "305567",
         "opponentName" : "betterlife",
         "deadline"     : "2011-09-29T13:35:33",
         "name"         : "OGS Tianyuan 2010 (Main Class), Round 2 Group 3",
         "size"         : "19",
         "ruleset"      : "Chinese",
         "toMove"       : "1"
         } */

      // download and parse the game information
      $.get(notifierURL, function(data) {
         var games    = data.games;
         var messages = data.messages;

         var gameTable  = create('table')
            .append( create('tr')
            .append( create('td').html(""))
            .append( create('td').html("Deadline")).addClass('rowh')
            .append( create('td').html("Opponent"))
            );

      // inject each game into the DOM
      for (var i = 0; i < games.length; i++) {

         var gameRow = create('tr');

         // put the link in the row's rel attribute so that it can be accessed from the click() function
         gameRow.attr('rel', root + "/games/board.php?boardID=" + games[i].id);

         gameRow.click( function() {
            chrome.tabs.create( {url: $(this).attr('rel') } );
         });

         // Extract the date in milliseconds since epoch
         var dt  = new Date(games[i].deadline.replace("T", " ") + " UTC" ).getTime();

         // Express the time until the deadline in seconds
         dt = (dt - new Date().getTime() ) / 1000;

         var days  = Math.floor(dt / (3600 * 24) ); dt -= days  * 3600 * 24;
         var hours = Math.floor(dt / (3600)      ); dt -= hours * 3600;
         var mins  = Math.floor(dt / (60)        );

         // Construct a plain-text description of the time until the deadline
         var remaining = "";
         if (days  > 0)
            remaining += days + "d";

         remaining += " " + hours + "h";

         if (days == 0)
            remaining += "  " + mins + "m";

         // make the board reference bold if it's unviewed
         if (games[i].viewed === "0")
            gameRow.addClass('unviewed');

         // Create table elements containing the data
         gameRow
            .append( create('td').html(i+1))
            .append( create('td').html(remaining))
            .append( create('td').html(games[i].opponentName));

         gameRow.addClass( 'row' + (i % 2) );
         gameTable.append( gameRow );

         // uncomment below to test very long lines
         //gameTable.append( create('tr').append( create('td').attr('colspan', '3').html("junk") ) );

      } // for ( ... games ... )

      // append the game table to the dom
      gameTable.attr('id','games');
      $('#games-injection').append(gameTable);

      // detect scrollbars and set the width accordingly.  Chrome limits popups to 600px height, 800px width
      $('#games').ready( function() {
         var db = document.body;
         var sw = (db.scrollHeight < 600) ? 0 : db.clientWidth - db.offsetWidth;
         $('body').css('padding-right', sw + 'px');
      });

      }, "json"); // $.get(...

      $('#mygames-link').blur();
   } // if logged in
}

window.addEventListener("load", initialize);

function attachAction()
{
}
