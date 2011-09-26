
function invalidateCurrentTimer()
{
    // DEBUG:
    console.log("Clearing old timer: " + localStorage['interval-id']);
    if (localStorage['interval-id'] !== '') {
        clearInterval(localStorage['interval-id']);
        localStorage['interval-id'] = '';
    }
}

/*
 * Update the game count by polling
 * IMPORTANT: DO NOT CALL update() FROM ANYWHERE BUT background.html
 * you will start _many_ timers 
 */
function update() {
    chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});

    var root = localStorage['url']; 
    var view = localStorage['include_viewed'] == 'true' ? "" : "?only_unviewed=true";

    $.ajax({
        url: root + "/includes/functions/ajax/gameCount.php" + view,
    context: document.body,
    success: function(response){

        // DEBUG
        localStorage['count'] ++;


        // if we're not logged in, stop checking
        if (response == -1) {
            response = "err";
            localStorage['logged-in'] = 'false';
            invalidateCurrentTimer();

        } else {
           
            // Check if we need to start a timer
            if (localStorage['interval-id'] === '') {

                // wait for at least 10 seconds and reload the function
                // TODO: change min => max, 1000 => 10000
                var wait = Math.min(1000, localStorage['interval']);
                localStorage['interval-id'] = setInterval(update, wait);

                // DEBUG:
                console.log("Started new timer " + localStorage['interval-id'] + ", waiting "+ (wait / 1000) + " seconds");
            }

            localStorage['logged-in']   = 'true';
        }

        // update the numerical overlay
        chrome.browserAction.setBadgeText({text:response});
    }
    });
}

