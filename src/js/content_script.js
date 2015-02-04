//the meat of the content script
chrome.storage.sync.get(null, function (data) {
    if (data.ggStatus) {
        //the extension is enabled
        var currentScanUrl = stripTrailingSlash(window.location.href);
        if (data.config.recursive) {
            //keep processing URLs, including the current one and all parents, until we can't anymore
            while (currentScanUrl != -1) {
                checkForGit(currentScanUrl);
                currentScanUrl = nextParent(currentScanUrl);
            }
        } else {
            //not recursing; just test the current location
            checkForGit(currentScanUrl);
        }
    }
});

//checks if there's a git repo; adds it to storage if it does


function checkForGit(url) {
    var headURL = stripTrailingSlash(url) + "/.git/HEAD";
    var configURL = stripTrailingSlash(url) + "/.git/config";
    var gitURL = stripTrailingSlash(url) + "/.git";

    var headReq = new XMLHttpRequest();
    headReq.open('GET', headURL, false);
    headReq.send();

    //check that we got both a HTTP200 and something that looks like a HEAD file.
    if (headReq.status == 200 && headReq.responseText.indexOf("ref: ") > -1) {
        //heyyyy we found a git repo (probably). Let's test config file sanity
        //I hate these nested ifs but it's good not to run more requests than we have to
        var configReq = new XMLHttpRequest();
        configReq.open('GET', configURL, false);
        configReq.send();

        if (configReq.status == 200 && configReq.responseText.indexOf("[core]") > -1) {
            //now we're talking. This is highly likely to be a repo
            //Time to test the .git visibility
            var gitReq = new XMLHttpRequest();
            gitReq.open('GET', gitURL, false);
            gitReq.send();

            if (gitReq.status == 200) {
                //the .git folder is visible too! Jackpot!!
                addSite(gitURL, 1);
            } else {
                //aw no publically browsable git... gotta use a utility
                addSite(gitURL, 0);
            }
        }
    }
}

//returns the next parent URL, or -1 if there is none
//e.g. nextParent("http://exmaple.com/dir/file.html") returns "http://exmaple.com/dir".
//e.g. nextParent("http://exmaple.com/") returns -1.


function nextParent(url) {
    //sanitize so that the last occurence of the slash isn't a terminating slash
    stripTrailingSlash(url);

    //grab from the beginning of the URL to the last occurence of the slash
    url = url.substr(0, url.lastIndexOf("/"));

    //the downside is that this trimming will mangle the URL if we're already at root
    //usually we're left with 'http:/' or 'https:/'; we'll assume we need at least 8 chars to be valid
    if (url.length < 9) {
        return -1;
    } else {
        return url;
    }
}

function addSite(url, webAccessible) {
	var sites, config; 
    //pull our site list out of storage
    chrome.storage.sync.get(null, function (data) {
        sites = data.sites;
		config = data.config;
		

        //make sure we're not duplicating; bug out if we are.
        for (var i = 0; i < sites.length; i++) {
            var site = sites[i];
            if (site.url == url && site.webAccessible == webAccessible) {
                return;
            }
        }

        //push the current URL onto the array
        sites.push({
            "url": url,
            "webAccessible": webAccessible
        });

        //send it to the great gig in the sky
        chrome.storage.sync.set({
            'sites': sites
        });
		
		//alert the user
		if(config.dingFound){
			var audio = new Audio(chrome.extension.getURL('/audio/alert.mp3'));
			audio.play();
		}
		
		if(config.alertFound){
			//the timeout is here due to some weird issue where, without a timeout, alert dismissal is required before the audio plays
			//I'm guessing it's some issue with async processes getting blocked but who knows. this seems to fix it.
			setTimeout(function(){alert("Get Git found a Git repo at " + url)}, 500);
		}
    });
}

//strip the trailing slash if there is one


function stripTrailingSlash(url) {
    if (url.substr(-1) == '/') {
        return url.substr(0, url.length - 1);
    }

    return url;
}