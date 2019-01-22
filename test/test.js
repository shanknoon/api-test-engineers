var expect  = require('chai').expect;
var request = require('request');

it('Main page content', function(done) {
    request('http://localhost:8080' , function(error, response, body) {
        expect(body).to.equal('Hello World');
        done();
    });
});

it('returns status 200', function(done) {
    request('http://localhost:8080' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
    });
});

it('returns 404 not found', function(done) {
    request('http://localhost:8080/user123' , function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
    });
});