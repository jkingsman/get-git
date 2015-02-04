Get Git
=============

Get Git is a Chrome extension that lets you know when you're on a site with a misconfigured, web accessible .git directory.

[![Image of Chrome Store Badge](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_340x96.png)](https://chrome.google.com/webstore/detail/agddmammmnpdglmincfngjfnehmopoln)

What It Is
=============
Inspired by [this set of slides by Vlatko Kostujak](http://www.slideshare.net/kost/ripping-web-accessible-git-files), I wondered how many websites I browsed each day that had misconfigured Git repos with a web accessible `.git` -- meaning I had full access to their source code, past and present.

I wasn't interested in nmapping every site I browsed, but what I didn't mind was a few exta 404's on the sites I visited - thus Get Git was born.

Get Git combs websites that you browse, looking for exposed `.git` directories. By looking for the files that should be *in* a `.git` directory, and not the directory itself, it can find repos even if directory listing is turned off. If it finds one, it optionally alerts the user and saves the URL for later viewing (visible on the extension's Options page). If, for some reason, you happen to browse extremely high volumes of vulnerable sites, Get Git supports exporting the list of sites in JSON for processing by other utilities.

This extension was built to run quietly in the background, but on the recursive option, it does traverse websites from the current URL all the way back to the web root, potentially leading to a number of 404's and background XHR requests. If this isn't okay with you, you can disable the recursive searching (or, if you're in a metered data usage environment, disable the extension easily throgh the options page or the popup window).

Criteria for a Repo
=============
For an URL to be entered as a repo, it must meet all of the following criteria:

* an HTTP 200 response to a request for `.git/HEAD`
* the presence of the string "ref: " in that response
* an HTTP 200 response to a request for `.git/config`
* the presence of the string "[core]" in that response

License
=============
MIT