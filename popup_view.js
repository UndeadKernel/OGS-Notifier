
// shorthand for creating dom elements
function create(tag) {
   return $(document.createElement(tag));
}

/**
 * games is a list of game objects:
 * game { "link": "http://..", "time_desc": "1d 15hr", "opponent": "a_player" }
 */
function populate_data(games)
{
   var gameTable  = create('table')
      .append( create('tr')
            .append( create('td').html(""))
            .append( create('td').html("Deadline")).addClass('rowh')
            .append( create('td').html("Opponent"))
            );

   var my_turn_count = 0;

   for (var i = 0; i < games.length; ++i) {

      var gameRow = create('tr');
      var game = games[i];

      // put the link in the row's rel attribute so that it can be accessed from the click() function
      gameRow.attr('rel', game.link);

      gameRow.click( function() {
         chrome.tabs.create( {url: $(this).attr('rel') } );
      });

      // Create table elements containing the data
      gameRow
         .append(create('td').html(my_turn_count + 1))
         .append(create('td').html(game.time_desc))
         .append(create('td').html(game.opponent));

      var name = "Row"+my_turn_count;

      gameRow.addClass('row' + (my_turn_count % 2));
      gameRow.attr('id', name);
      gameTable.append(gameRow);

      my_turn_count++;

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

   $('#games-injection').fadeIn(250);
}

function initialize()
{
   chrome.runtime.sendMessage({method: "popup_games"}, function(games) {
      $('#games-injection').hide();
      $('#games.injection').html("");

      if (games === null) {
         $('#remote-information').hide();
         $('#login-wrapper').show();
      }
      else {
         $('#remote-information').show();
         $('#login-wrapper').hide();

         function dataSort(lhs, rhs) { return lhs.time_left - rhs.time_left; };
         games.sort(dataSort);
         populate_data(games);
      }
   });

   $('#login-link').click(function() {
      chrome.tabs.create( {url: "http://online-go.com" } );
   });
}

window.addEventListener("load", initialize);
