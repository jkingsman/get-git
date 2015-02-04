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
			"seenSites":0,
            "ggStatus": 1,
        });
    }
});

setInterval(function (){
	var newCount;
	chrome.storage.sync.get(null, function (data) {
		//compare the number of sites we saw last time we checked vs now. if greater; show a badge.
		newCount = data.sites.length - data.seenSites;
		if(newCount > 0){
			chrome.browserAction.setBadgeText({text: newCount.toString()});
		}
		else{
			chrome.browserAction.setBadgeText({text: ""});
		}
	});
}, 2000);

