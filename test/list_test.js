'use strict';

var spawn = require('child_process').spawn,
  path = require('path'),
  request = require('request'),
  rimraf = require('rimraf'),
  server;

exports.start = function(test) {

  server = spawn(path.join(__dirname, '..', '.bin', 'dev'));

  var listener = function(data) {
    server.stdout.removeListener('data', listener);
    test.done();
  };

  server.stdout.on('data', listener);

};

exports.list = {

  'html': function(test) {

    var url = 'http://localhost:8080/streams';

    test.expect(4);

    request(url, function(err, res, body) {

      test.ok(!err, 'should not error');

      if (err) {
        return test.done();
      }

      test.ok(/^text\/html/.test(res.headers['content-type']), 'content type should be text/html');
      test.equal(res.statusCode, 200, 'status should be 200');
      test.ok(body.match(/class="row stream"/g).length === 2, 'should return two rows');

      test.done();

    });

  },

  'json': function(test) {

    var url = 'http://localhost:8080/streams.json';

    test.expect(4);

    request(url, function(err, res, body) {

      test.ok(!err, 'should not error');

      if (err) {
        return test.done();
      }

      body = JSON.parse(body.trim());

      test.ok(/^application\/json/.test(res.headers['content-type']), 'content type should be application/json');
      test.equal(res.statusCode, 200, 'status should be 200');
      test.ok(body.streams.length === 2, 'should return two rows');

      test.done();

    });

  }

};

exports.cleanup = function(test) {

  rimraf.sync(path.join(__dirname, 'tmp'));

  server.on('exit', function() {
    test.done();
  });

  server.kill();

};
