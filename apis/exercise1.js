module.exports = {

    getUserInfo: function getUserInfo(req, res, next) {

        console.log('getUserInfo() called');

        let userInfo = {
            name: process.env.NAME,
            token: process.env.TOKEN
        };
        
        res.json(userInfo);
    }
};