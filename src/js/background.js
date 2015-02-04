//just to make sure we're all initialized on first run
chrome.storage.sync.get(null, function (data) {
    if (typeof data.config === "undefined" || typeof data.sites === "undefined" || typeof data.ggStatus === "undefined") {
        //default config
        config = {
            recursive:  true,
            dingFound:  true,
            alertFound: true,
        };

        //default site list (empty)
        sites = [];

        //store the defaults
        chrome.storage.sync.set({
            "config":   config,
            "sites":    sites,
            "ggStatus": 1
        });
    }
});