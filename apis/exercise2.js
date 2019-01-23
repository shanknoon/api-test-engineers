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

function getArgOrNull(req, param) {
    if (req) {
        if (req.body && req.body[param]) {
            return req.body[param];
        } else if (req.query && req.query[param]) {
            return req.query[param];
        }
    }
    return null;
}

function sortByRecommend(resultProducts, res) {

    return new Promise(function(resolve) {

    //console.log('sortByRecommend() called');

    //const finalUrl = 'http://dev-wooliesx-recruitment.azurewebsites.net/api/resource/products?token=ABdrF-HEaiQJ40WPRi-Y1txJ84jVfpkN9A%3A1543085147104';
    let finalUrl = process.env.TARGET_URL + '/api/resource/shopperHistory?token=' + process.env.TOKEN;
    
    const options = {
        method: 'GET',
        url: finalUrl,
        timeout: 30000,
        headers: {
            'cache-control': 'no-cache',
            'accept': 'application/json',
            'content-type': 'application/json'
        }
    };

    let decorator = function(arrProduct){

        //console.log('decorator.result = ', arrProduct);
        
        return new Promise(function(resolve){

            let sortProducts = [];

            _.each(arrProduct, function (item) {
                _.each(item.products, function (product) {
                    sortProducts.push(product);
                });
            });
            
            //console.log(sortProducts);

            var formatted_data = _(sortProducts)
                .groupBy('name')
                .map((v, k) => ({
                    name: k,
                    quantity: _.sumBy(v, 'quantity')
                })).value(); 

            sortProducts = [];

            resultProducts.forEach(element => {

                var obj = _.find(formatted_data, function(o) { return o.name === element.name; });
                
                if(obj){
                    element.quantity = obj.quantity;
                }
                    sortProducts.push(element);
            });
            
            sortProducts = _.orderBy(sortProducts, ['quantity'], ['desc']);


            /*sortProducts = _.groupBy(sortProducts, function(product) {
            return product.name;
            });*/

            //console.log(sortProducts);

            resolve(sortProducts);
        });
    };

    console.log('options = ', options);

    request(options)
        .then(function(result){
            //console.log('result123 = ', result);
            return assert200ResponseCode(result, res);
        })
        .then(decorator)
        .then(function(result){
            resolve(result);
        })
        .catch(
            function(error){
                resolve();
            }
        )
        });
}

function assert200ResponseCode(response, res){
    
    return new Promise(function(resolve) {

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

    sortProducts: function sortProducts(req, res, next) {

        //console.log('sortProducts() called');
        
        let sortOption = getArgOrNull(req, 'sortOption');

        if(sortOption)
        {
            sortOption = sortOption.toLowerCase();
            if(!(_.includes(['low', 'high', 'ascending', 'descending', 'recommended'], sortOption)))
            {
                res.status(400).json({
                    code: 'Invalid Request',
                    message: 'valid sortOption would be [Low, High, Ascending, Descending, Recommended]'
                });
            }
        }

        //const finalUrl = 'http://dev-wooliesx-recruitment.azurewebsites.net/api/resource/products?token=ABdrF-HEaiQJ40WPRi-Y1txJ84jVfpkN9A%3A1543085147104';
        let finalUrl = process.env.TARGET_URL + '/api/resource/products?token=' + process.env.TOKEN;
        
        const options = {
            method: 'GET',
            url: finalUrl,
            timeout: 30000,
            headers: {
                'cache-control': 'no-cache',
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        };

        let decorator = function(result){

            //console.log('decorator.result = ', result);
            
            return new Promise(function(resolve){

                let arrProducts = [];

                if(result) {
                    
                    arrProducts = result;

                    if(sortOption === 'low')
                    {
                        arrProducts = _.orderBy(arrProducts, ['price'], ['asc']);
                    } else if(sortOption === 'high')
                    {
                        arrProducts = _.orderBy(arrProducts, ['price'], ['desc']);
                    } else if(sortOption === 'ascending')
                    {
                        arrProducts = _.orderBy(arrProducts, ['name'], ['asc']);
                    } else if(sortOption === 'descending')
                    {
                        arrProducts = _.orderBy(arrProducts, ['name'], ['desc']);
                    }
                }

                resolve(arrProducts);
            });
        };

        //console.log('options = ', options);

        request(options)
            .then(function(result){
                console.log('result123122 = ', result);
                return assert200ResponseCode(result, res);
            })
            .then(decorator)
            .then(function(result){
                if(sortOption === 'recommended')
                {
                    return sortByRecommend(result, res);
                }
                else{
                    return result;
                }
            })
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
