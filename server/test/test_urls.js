var request = require('supertest'),
		express = require('express');

var app = require('../../app.js');

describe('get /', function() {
	it('responds with redirect for user not authenticated', function(done) {
		request(app)
			.get('/')
			.expect(302, done);
	});

  it('responds with plain text for get request to login', function(done) {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});		
