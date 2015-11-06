var dns = require('dns');
var ping = require("net-ping");
var util = require('util');

var baudio = require('baudio');
var tau = 2 * Math.PI;

var n = 0;
var b = baudio(function (t) {
  var freq = 500;
  return 0.03*Math.sin(tau * t * freq);
});

var domain = process.argv[2] || 'google.com';

dns.lookup(domain, function onLookup(err, addresses, family) {
  var session = ping.createSession({ retries: 0, timeout: 350 });
  var i = 0;
  var failedCount = 0;
  var host = domain == addresses ? domain : util.format("%s->%s", domain, addresses);
  setInterval(function() {
    i += 1;
    var label = util.format("%s: icmp_sec=%d", host, i);
    console.time(label);
    session.pingHost(addresses, function(error, target) {
      if (error) {
        if (error instanceof ping.RequestTimedOutError) {
          failedCount += 1;
          b.play();
          console.error("%s: Request timeout (%d)", label, failedCount);
        } else {
          console.error("%s: %s", label, error.toString());
        }
      } else {
        if (failedCount > 0)
          failedCount = 0;
        console.timeEnd(label);
      }
    });
  }, 1000);
});

