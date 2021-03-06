var fs = require('fs'),
	path = require('path');
var binding;

// Seed random numbers [gh-82]
Math.random();

// Look for binary for this platform
var nodeV = 'node-' + /[0-9]+\.[0-9]+/.exec(process.versions.node)[0];
var modPath = path.join(__dirname, 'bin', process.platform + '-' + process.arch + '-' + nodeV, 'deasync');
try {
	fs.statSync(modPath + '.node');
	binding = require(modPath);
}
catch (ex) {
	binding = require('bindings')('deasync');
}



function deasync(fn) {
	return function() {
		var done = false;
		var args = Array.prototype.slice.apply(arguments).concat(cb);
		var err;
		var res;

		fn.apply(this, args);
		module.exports.loopWhile(function(){return !done;});
		if (err)
			throw err;

		return res;

		function cb(e, r) {
			err = e;
			res = r;
			done = true;
		}
	}
}

module.exports = deasync;

module.exports.sleep = deasync(function(timeout, done) {
	setTimeout(done, timeout);
});

module.exports.runLoopOnce = function(){
	process._tickDomainCallback();
	binding.run();
};

module.exports.loopWhile = function(pred){
  while(pred()){
	process._tickDomainCallback();
	if(pred()) binding.run();
  }
};