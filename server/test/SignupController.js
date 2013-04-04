// tests for SignupController
// to run, type 'mocha SignupController' in test directory
//
var express = require('express'),
    request = require('supertest'),
    assert = require('assert'),
    should = require('should'),
    app = require('../app.js');


describe('route', function() 
{

  it('should return json with success false and appropriate message if invalid operation specified', function(done) 
  {
   request(app)
    .get('/v1/signup/abc')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(/success.*false.*\n.*message/, done);
  })

  it('should return json with success false if no operation specified', function(done) 
  {
    request(app)
    .get('/v1/signup/')
    .end(function(err, res) {
      res.headers.should.have.property('content-type', 'application/json; charset=utf-8');
      res.should.be.json;
      res.text.should.match(/success.*false/);
      res.statusCode.should.equal(200);
      done();
    });
  })

  it('should return jason with success true if add operation specified', function(done)
  {
    request(app)
    .post('/v1/signup/add')
    .send({
      'givenName': 'Frank',
      'familyName': 'Roccio',
      'email': 'frankie@example.com',
      'password': 'xww'
    })
    .expect(200)
    .expect(/success.*true/, done);
  })
})

