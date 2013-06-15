
function initialize() {

   // When page initially loads, set the proper 'include-viewed' and 'display-zero' selections
   if (localStorage['include_viewed'] == 'true')  {
      $('#include_viewed').prop('checked', true);
   }
   if (localStorage['display_zero'] == 'true')  {
      $('#display_zero').prop('checked', true);
   }

   // When page initially loads, set the proper interval selection
   switch(localStorage['interval']) {
      case '5000':
         $('#int5').prop('checked', true);
         break;

      case '60000':
         $('#int60').prop('checked', true);
         break;

      case '10000':
      default:
         $('#int10').prop('checked', true);
         break;
   }

   // When the page initially loads, select the appropriate base url
   switch(localStorage['url']) {
      case 'http://www.online-go.org':
         $('#wwworg').prop('checked', true);
         break;

      case 'http://online-go.com':
         $('#com').prop('checked', true);
         break;

      case 'http://online-go.org':
         $('#org').prop('checked', true);
         break;

      case 'http://www.online-go.com':
      default:
         $('#wwwcom').prop('checked', true);
   }

   // Attach actions to the help '?'s
   $('#update_interval').click(function() { $('#interval-help').toggle(); console.log('hi');} );
   $('#url_help').click( function() { $('#url-help').toggle(); });
   $('#display_help').click( function() { $('#display-help').toggle(); });
   $('#viewed_help').click( function() { $('#viewed-help').toggle(); });

   // top two check boxes
   $('#include_viewed').click(function() { updateViewed(); });
   $('#display_zero').click(  function() { updateDisplayZero(); });

   // site urls
   $('#wwwcom').click(function() { updateURL('http://www.online-go.com'); });
   $('#wwworg').click(function() { updateURL('http://www.online-go.org'); });
   $('#com').click(function()    { updateURL('http://online-go.com'); });
   $('#org').click(function()    { updateURL('http://online-go.org'); });

   // update intervals
   $('#int5').click(function()   { updateInterval(5000); });
   $('#int10').click(function()  { updateInterval(10000); });
   $('#int60').click(function()  { updateInterval(60000); });
}

// update the interval setting
function updateInterval(interval) {
   localStorage['interval'] = interval;

   performUpdate();
}

// update the base url setting
function updateURL(url) {
   localStorage['url'] = url;

   performUpdate();
}

// update the viewed option
function updateViewed() {
   localStorage['include_viewed'] = $('#include_viewed').is(':checked');
   performUpdate();
}

// update the display zeros option
function updateDisplayZero() {
   localStorage['display_zero'] = $('#display_zero').is(':checked');
   performUpdate();
}

function performUpdate() {

   // There's a timer running: invalidate it, so that update() can start a new one
   if (localStorage['timeout-id'] !== '') {
      invalidateCurrentTimer();
   }

   update();
}

window.addEventListener("load", initialize);
