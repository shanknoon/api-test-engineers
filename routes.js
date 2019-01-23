/* jshint strict: true */
/* global console, require, module, process */
"use strict";

const router = require('express').Router(),
    exercise1 = require('./apis/exercise1'),
    exercise2 = require('./apis/exercise2'),
    exercise3 = require('./apis/exercise3');


// Get Basic Response from the route
router.get('/user', exercise1.getUserInfo);
// Sort the products by sortOption 
router.get('/sort', exercise2.sortProducts);
//Calculate Trolley total
router.post('/trolleyTotal', exercise3.trolleyCalculator);

router.use((req, res, next) => {
    //let error = new Error();
	let error = {};
    error.statusCode = 404;
    error.message = 'Invalid API Endpoint';
    console.error('Caught exception: ' + error);
    //console.error(error);
    //next(error);
	res.status(404).json(error);
});

//router.use(errorHandler);
module.exports = router;
