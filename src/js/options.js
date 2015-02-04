function init_main() {
    //set up our options and site list
    buildPage();

    //show the menu
    $('html').hide().fadeIn('slow');
}

//main function that populates option boxes and the site list

function buildPage() {
    var config, sites, enabled;

    chrome.storage.sync.get(null, function (data) {
        config = data.config;
        sites = data.sites;
        enabled = data.ggStatus;


        //set our checkboxes to what's in storage
        $("#enabled").prop("checked", enabled);
        $("#recursive").prop("checked", config.recursive);
        $("#dingFound").prop("checked", config.dingFound);
        $("#alertFound").prop("checked", config.alertFound);

        //be loud if it's disabled
        if (!enabled) {
            showNotification("alert-danger", "Get Git is currently disabled.", 0)
        }

        //let the user knwo if we don't have any sites stored
        if (sites.length < 1) {
            $('#siteTableBody').append('<tr><td colspan=2>No sites collected yet!</td></tr>');
        }

        //populate the table
        for (var i = 0; i < sites.length; i++) {
            var site = sites[i];
            var webAccessibleTD;

            //handle different states of web accessibilty
            if (site.webAccessible == 1) {
                webAccessibleTD = '<td class="success">Yes</td>';
            } else if (site.webAccessible == 0) {
                webAccessibleTD = '<td class="danger">No</td>';
            } else {
                webAccessibleTD = '<td class="warning">Unknown</td>';
            }

            //append the URL to the table
            $('#siteTableBody').append('<tr><td>' + site.url + '</td>' + webAccessibleTD + '</tr>');
        }
    });
}

//show notifications
//type is a bootstrap alert class
//message is the message to display
//time is the amount of time it should be visible in seconds; set 0 for indefinitely

function showNotification(type, message, seconds) {
    //build a random ID
    var uniqueID = Math.floor((Math.random() * 10000) + 1);

    //push the notification
    $("#notifications").append('<div id="alertBox' + uniqueID + '" class="alert ' + type + '" role="alert">' + message + '</div>');

    if (seconds > 0) {
        //the gave an actual timeout; 
        setTimeout(function () {
            $("#alertBox" + uniqueID).fadeOut();
        }, seconds * 1000)
    }
}

/*
 * Begin Event Listeners
 */

//handle config save
$("#getGitConfig").submit(function (e) {
    e.preventDefault();

    //build out an array of config options
    var config = {
        recursive: $("#recursive").prop("checked"),
        dingFound: $("#dingFound").prop("checked"),
        alertFound: $("#alertFound").prop("checked"),
    };

    //store config
    chrome.storage.sync.set({
        'config': config,
        'ggStatus': $("#enabled").prop("checked")
    });

    //notify
    showNotification("alert-success", "Configuration updated.", 3);
});


//play the ding for the user
$("#demoDing").click(function () {
    var audio = new Audio('../audio/alert.mp3');
    audio.play();
});

//show what the alert looks like
$("#demoAlert").click(function () {
    alert("This site has a publically accessible Git repo.");
});

//erase sites from the table and from storage
$("#clearSites").click(function () {
    var confirmed = confirm("This will delete all stored vulnerable Git repos.");
    if (confirmed == true) {
        chrome.storage.sync.set({
            "sites": []
        });
        $("#siteTableBody").empty();
		$('#siteTableBody').append('<tr><td colspan=2>No sites collected yet!</td></tr>');
        showNotification("alert-success", "Site list cleared.", 3);
    }
});

//pops up a modal with the JSON of the vulnerable sites in it
$("#exportSites").click(function () {
    chrome.storage.sync.get(null, function (data) {
        sites = data.sites;
		$("#exportBox").val(JSON.stringify(sites));
		$('#exportDataModal').modal('show') 
	});
});

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);