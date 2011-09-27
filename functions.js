
function invalidateCurrentTimer()
{
    // DEBUG:
    if (window.debug == 1) {
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

        // DEBUG
        if (window.debug == 1) {
            localStorage['count'] ++;
        }

        // if we're not logged in, stop checking
        if (response == -1) {
            response = "err";
            localStorage['logged-in'] = 'false';
            invalidateCurrentTimer();

        } else {

            // wait for at least 20 seconds and reload the function
            var wait = Math.max(20000, localStorage['interval']);

            localStorage['timeout-id'] = setTimeout(update, wait);

            // DEBUG:
            if (window.debug == 1) {
                console.log("Started new timer " + localStorage['timeout-id'] + ", waiting "+ (wait / 1000) + " seconds");
            }

            localStorage['logged-in']   = 'true';
        }

        // DEBUG:
        if (window.debug == 1) {
            console.log("Timer " + localStorage['timeout-id'] + " reported \""+ response + "\" ");
        }

        // update the numerical overlay
        chrome.browserAction.setBadgeText({text:response});
    }
    });
}

