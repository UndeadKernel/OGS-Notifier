

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

function updateBadge(page, requestTime)
{
   var count = 0;
   var user  = page.user;
   var games = page.games;
   var total = page.games.length;

   for (var ii = 0; ii < total; ++ii) {
      var game = games[ii];
      var data = GameData(game, user);
      var turn = data.my_turn;

      if (turn)
         count++;
   }

   var display = (count !== 0 || localStorage['display_zero']
                  ? "" + count
                  : "");

   chrome.browserAction.setBadgeText({text:display});
}

function begin_scrape(callback)
{
   // clear the results container, show ajax spinner, hide html result wrapper
   set_initial_display_state("games");

   // query and scrape the game list
   var requestTime = new Date().getTime();
   $.ajax({
      url: "http://online-go.com/games",
      dataType: 'text',
      success: function(data) {

         var page = GamePage(data);

         if (localStorage['debug'] == 1)
            console.log("Data arrived for " + page.user);

         if (page.user.length === 0) {
            localStorage['logged-in'] = false;
            set_initial_display_state("login");
            chrome.browserAction.setBadgeText({text:"Err"});
            return;
         }

         localStorage['logged-in'] = true;

         if (page.games.length == 0)
            return;

         if (localStorage['debug'] == 1)
            console.log("Parsing " + page.games.length + " total games");

         updateBadge(page, requestTime);

         callback(page, requestTime);
      }
   });
}
