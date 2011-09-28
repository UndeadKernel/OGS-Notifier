
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
}

