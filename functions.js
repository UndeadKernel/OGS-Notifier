

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

        // if we're not logged in, stop checking
        if (response == -1) {
            response = "";
            localStorage['logged-in'] = 'false';
            localStorage['timeout-id'] = 0;

        } else {
            // wait for 10 seconds and reload the function
           
            var wait = Math.min(30000, localStorage['interval']);

            localStorage['timeout-id'] = setTimeout(update, wait);
            localStorage['logged-in']  = 'true';

            console.log("Started new timer " + localStorage['timeout-id'] + ", waiting "+ (wait / 1000) + " seconds");
        }

        chrome.browserAction.setBadgeText({text:response});
    }
    });
}

