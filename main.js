
// shorthand for creating dom elements
function create(tag) {
   return $(document.createElement(tag));
}

function gotoLogin() {
   var root = localStorage['url'];
   chrome.tabs.create( {url: root+"/login.php"} );
}

function computeRemaining(dateTime)
{
   // Express the time until the deadline in seconds
   var dt = (dateTime - new Date().getTime() ) / 1000;

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

   return remaining;
}

function set_initial_display_state(area)
{
   $('#games-injection').hide();
   $('#games.injection').html("");

   if (area == "login") {
      $('#remote-information').hide();
      $('#ajax-loader').hide();
      $('#login-wrapper').show();
   }
   else {
      $('#remote-information').show();
      $('#ajax-loader').show();
      $('#login-wrapper').hide();
   }
}

function build_login_wrapper()
{
   set_initial_display_state("login");
   if (debug)
      console.log("Not logged in, showing login wrapper");

   // on submission, create a new tab, send the login information
   $('#submit').click( function(event) {

      $.ajax({
         type: 'POST',
         url: root+"/includes/functions/ajax/login.php",
         data: {passWord: $('#password').attr("value"), userName: $('#username').attr("value")},
         success: function(response){

            var debug = localStorage['debug'] == 1;
            if (debug)
               console.log("Received response '" + response + "'");

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

}

function get_next_row_delay(delay, position)
{
   console.log("delay for " + position + " is " + delay);
   return delay + 100 / (1 + Math.sqrt(position));
}

function visibility_fuse(name)
{
   return function() {
      var dt = new Date().getTime();
      $('#'+name).show();
   };
}

function build_popup() {

   var debug = localStorage['debug'] == 1;
   var root  = localStorage['url'];

   // check if loggged in
   var response;
   if (localStorage['logged-in'] === 'false') {
      build_login_wrapper();
      return;
   }

   // clear the results container, show ajax spinner, hide html result wrapper
   set_initial_display_state("games");

   // pop up a new mygames when when the link is clicked
   $('#mygames-link').attr('href', root + "/games/mygames.php").click( function() {
      chrome.tabs.create( {url: $(this).attr('href') } );
   });

   var notifierURL = root+"/games/xmlnotifier.php?format=json";
   var requestTime = new Date().getTime();
   /**
    * format:
    *
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

      var delay = 0;
      // inject each game into the DOM
      for (var i = 0; i < games.length; i++) {

         var gameRow = create('tr');

         // put the link in the row's rel attribute so that it can be accessed from the click() function
         gameRow.attr('rel', root + "/games/board.php?boardID=" + games[i].id);

         gameRow.click( function() {
            chrome.tabs.create( {url: $(this).attr('rel') } );
         });

         // Extract the date in milliseconds since epoch
         var dateTime  = new Date(games[i].deadline.replace("T", " ") + " UTC" ).getTime();
         var remaining = computeRemaining(dateTime);

         // make the board reference bold if it's unviewed
         if (games[i].viewed === "0")
            gameRow.addClass('unviewed');

         // Create table elements containing the data
         gameRow
            .append(create('td').html(i+1))
            .append(create('td').html(remaining))
            .append(create('td').html(games[i].opponentName));

         var name = "Row"+i;
         delay = get_next_row_delay(delay, i);

         gameRow.addClass('row' + (i % 2));
         gameRow.attr('id', name);
         gameTable.append(gameRow);

         window.setTimeout(visibility_fuse(name), delay);
         gameRow.hide();

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

      // wait at least half a second so the transition isn't so jarring
      var completionTime  = new Date().getTime();
      var transitionDelay = Math.min(500 - (completionTime - requestTime), 500);

      //$('#games-injection').show();
      //$('#ajax-loader').hide();
      window.setTimeout(function() {
      $('#ajax-loader').slideUp('slow');
      $('#games-injection').fadeIn(250);
      //$('#games-injection').show("scale", {}, 1000);
      }, transitionDelay);

      //$('#games-injection').slideDown('slow');

      // re-show the table container and hide the ajax spinner
      //$('#games-injection').show();
      //$('#ajax-loader').hide();

   }, "json"); // $.get(...
}

function initialize() {
   document.getElementById("login_link").addEventListener("click", gotoLogin);

   build_popup();
}

window.addEventListener("load", initialize);
