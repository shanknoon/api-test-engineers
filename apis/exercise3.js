/* jshint strict: true */
/* global console, require, module, process */
"use strict";

const http = require('http');
http.globalAgent.maxSockets = 50;

const https = require('https');
https.globalAgent.maxSockets = 50;

const Promise     = require('bluebird'),
    request     = Promise.promisify(require("request")),
    _           = require('lodash');

function assert200ResponseCode(response, res){
    
    return new Promise(function(resolve) {
            
        console.log('assert200ResponseCode.response[0].statusCode = ', response[0].statusCode);
        console.log('assert200ResponseCode.response[1] = ', response[1]);

        let result;

        if (!(response && response[0] && response[0].statusCode)) {
            return res.status(503).json({
                code: 'Target Error',
                message: 'Service Unavailable'
            });
        } else if (response[0].statusCode !== 200){
            return res.status(response[0].statusCode).json({
                code: http.STATUS_CODES[response[0].statusCode],
                message: response[1]
            });
        } else{
            if(response[1]){
                result = (typeof response[1] === 'object') ? response[1] : JSON.parse(response[1]);
            } else if (response[0].body){
                result = (typeof response[0].body === 'object') ? response[0].body : JSON.parse(response[0].body);
            }
        }

        resolve(result);
    });
}

module.exports = {

	trolleyCalculator: function trolleyCalculator(req, res, next) {

        console.log('trolleyCalculator() called');

        if(!req.body){
            res.status(400).json({
                code: 'Invalid Request',
                message: 'List is empty. Please provide lists of prices, specials and quantities for calculation'
            });
        }

		//const finalUrl = 'http://dev-wooliesx-recruitment.azurewebsites.net/api/resource/trolleyCalculator?token=ABdrF-HEaiQJ40WPRi-Y1txJ84jVfpkN9A%3A1543085147104';
        const finalUrl = process.env.TARGET_URL + '/api/resource/trolleyCalculator?token=' + process.env.TOKEN;
        
        const options = {
            method: 'POST',
            url: finalUrl,
            timeout: 30000,
            body: req.body, 
            headers: {
                'cache-control': 'no-cache',
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        };

        let decorator = function(result){

            //console.log('decorator.result = ', result);
            
            return new Promise(function(resolve){

                resolve(result);

            });
        };

        console.log('options = ', options);

        request(options)
            .then(function(result){
                return assert200ResponseCode(result, res);
            })
            .then(decorator)
            .then(function(result){
                res.status(200).json(result);
            })
            .catch(
                function(error){
                    console.log('Error: ', error);
                    next(error);
                }
            )
    }
};
