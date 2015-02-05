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
	url = stripTrailingSlash(url);
	
	//big ole list
	var gitURL = url + "/.git";
    var headURL = url + "/.git/HEAD";
    var configURL = url + "/.git/config";
	var ignoreURL = url + "/.gitignore";
	var excludeURL = url + "/.git/info/exclude";
	var descriptionURL = url + "/.git/description";
	var commitMsgURL = url + "/.git/COMMIT_EDITMSG";
    

    //check that we got both a HTTP200 and something that looks like a HEAD file.
    if (upAndHas(headURL, "ref: ")) {
        //heyyyy we found a git repo (probably). Let's test config file sanity
        //I hate these nested ifs but it's good not to run more requests than we have to
        if (upAndHas(configURL, "[core]")) {
            //now we're talking. This is highly likely to be a repo
			//add the repo, and us upAndHas to tell us whether it's publically browsable
            addSite(gitURL, upAndHas(gitURL, ""), getOrNone(ignoreURL), getOrNone(commitMsgURL), getOrNone(configURL), getOrNone(descriptionURL), getOrNone(excludeURL));
        }
    }
}

function addSite(url, webAccessible, gitIgnore, commitMsg, gitConfig, gitDescription, gitExclude) {
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
			"uid": Math.floor(Math.random()*16777215).toString(16), //random hex id
            "url": url,
            "webAccessible": webAccessible,
			"gitIgnore": gitIgnore,
			"commitMsg": commitMsg,
			"gitConfig": gitConfig,
			"gitDescription": gitDescription,
			"gitExclude": gitExclude
        });

        //send it to the great gig in the sky
        chrome.storage.sync.set({
            'sites': sites
        });
		
		//alert the user
		if(config.soundFound){
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

//returns true if the url responds 200 and the responsebody contains string
//use to just check for 200 
function upAndHas(url, string){
	var req = new XMLHttpRequest();
	req.open('GET', url, false);
	req.send();
	
	if(req.status == 200){
		if(req.responseText.indexOf(string) > -1){
			return true;
		}
	}
	
	return false;
}

//returns the first 300 characters of the responseBody from url, or "(none)" if it can't
function getOrNone(url){
	var req = new XMLHttpRequest();
	var trimmedText;
	
	req.open('GET', url, false);
	req.send();
	
	if(req.status == 200) {
		if(req.responseText.length > 300) {
			return (req.responseText.substring(0, 288) + " [truncated]");
		} else {
			return req.responseText;
		}
	} else{
		return "(none)";
	}
}

function stripTrailingSlash(url) {
    if (url.substr(-1) == '/') {
        return url.substr(0, url.length - 1);
    }

    return url;
}