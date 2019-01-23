const expect  = require('chai').expect;
const request = require('request');

const appUrl = process.env.URL || 'http://localhost:8080'

it('Exercise 1: returns status 200 for', function(done) {
    request(appUrl + '/user' , function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
    });
});

it('Exercise 1: Check Exercise1 content', function(done) {
    request(appUrl + '/user' , function(error, response, body) {
        if(body && typeof body === 'string')
            body = JSON.parse(body);
        expect(body.name).to.equal('Sankara Narayanan');
        done();
    });
});

it('Exercise 2: Check sortOption returns array or not', function(done) {
    request(appUrl + '/sort?sortOption=Low' , function(error, response, body) {
        if(body && typeof body === 'string')
            body = JSON.parse(body);
        expect(Array.isArray(body)).to.equal(true);
        done();
    });
});

it('Exercise 2: should return 400 if invalid sortOption passed', function(done) {
    request(appUrl + '/sort?sortOption=quantity' , function(error, response, body) {
        expect(response.statusCode).to.equal(400);
        done();
    });
});

it('Exercise 3: should return 404 not found for GET request', function(done) {
    request(appUrl + '/trolleyTotal' , function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
    });
});

it('Exercise 3: should return 400 id request body is empty or null', function(done) {
    let products = {};
    var options = {
        method: 'POST',
        url: appUrl + '/trolleyTotal',
        timeout: 30000,
        body: products,
        json: true,
        headers: {
            'cache-control': 'no-cache',
            'accept': 'application/json',
            'content-type': 'application/json'
        }
    };
    request(options , function(error, response, body) {
        expect(response.statusCode).to.equal(400);
        done();
    });
});

it('Exercise 3: should return integer', function(done) {
    let products = {
        "products": [
          {
            "name": "Test Product A",
            "price": 3
          }
        ],
        "specials": [
          {
            "quantities": [
              {
                "name": "Test Product A",
                "quantity": 1
              }
            ],
            "total": 3
          }
        ],
        "quantities": [
          {
            "name": "Test Product A",
            "quantity": 1
          }
        ]
      };
    var options = {
        method: 'POST',
        url: appUrl + '/trolleyTotal',
        timeout: 30000,
        body: products,
        json: true,
        headers: {
            'cache-control': 'no-cache',
            'accept': 'application/json',
            'content-type': 'application/json'
        }
    };
    request(options , function(error, response, body) {
        expect(body).to.equal(3);
        done();
    });
});