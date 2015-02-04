/*
** file: js/main.js
** description: javascript code for "html/main.html" page
*/

var syncRules;

function init_main() {
    //get the current enabled state and rule list
    chrome.storage.sync.get('ggStatus', function (data) {
        if (typeof data.ggStatus === "undefined") {
            //this is first use; enable by default and save
            chrome.storage.sync.set({
                "ggStatus": 1
            });
            var isEnabled = 1;
        }
        else {
            var isEnabled = parseInt(data.ggStatus);
        }

        //make the switch reflect our current state
        if (isEnabled) {
            $('#ggStatus').bootstrapSwitch('state', true);
        }
        else {
            $('#ggStatus').bootstrapSwitch('state', false);
        }
    });

    //init our switch
    $('#ggStatus').bootstrapSwitch();

    //build options link
    $("#ggOptLink").attr("href", chrome.extension.getURL("html/options.html"));

    //show the menu
    $('html').hide().fadeIn('slow');
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);

//handle enabling or disabling or the extension
$('#ggStatus').on('switchChange.bootstrapSwitch', function (event, state) {
    if (state) {
        chrome.storage.sync.set({
            "ggStatus": 1
        });
    }
    else {
        chrome.storage.sync.set({
            "ggStatus": 0
        });
    }
});