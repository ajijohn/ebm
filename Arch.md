# Architecture

[![N|Solid](https://cdn.rawgit.com/ajijohn/ebm/e2fc2f2698798a1d1594196b1b4c0846134c2f86/public/images/flow-ebs.png)]()

microclim.org is a cloud-enabled, responsive, ExpressJS powered HTML5 Micro Climate Export site.

You can :
  - Clip the region of interest
  - Select the variables, and timeframe
  - Request Export as CSV, netCDF and JSON


### Components

microclim uses below products:

* [S3] - For storage, and depository for user requests
* [MongoDB] - To store user requests
* [SES] - For emailing user with instructions to download
* [EC2] - For running the Web and Batch Process App
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [Travis CI] - the streaming build system

And microclim.org itself is open source with a [public repository][ebm]
on GitHub.

### Installation

Follow the readme on the github

### Future directions

 - AWS Lambda


License
----

Apache


**Thanks!**

   [ebm]: <https://github.com/ajijohn/ebm>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [keymaster.js]: <https://github.com/madrobby/keymaster>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
