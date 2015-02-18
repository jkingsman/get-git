function init_main() {
    //get the current enabled state and rule list
    chrome.storage.sync.get('status', function (data) {
        if (data.status) {
            $("#status").html('<span class="bg-success">Enabled</span>');
        } else {
            $("#status").html('<span class="bg-danger">Disabled</span>');
        }
    });

    //build options link
    $("#optLink").attr("href", chrome.extension.getURL("html/options.html"));

    //show the menu
    $('html').hide().fadeIn('slow');
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);