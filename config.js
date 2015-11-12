/*jslint node:true*/

module.exports = {
    cookieSecret: 'fat mountain activity direction',
    mongo: {
        development: {
            connectionString: 'mongodb://localhost:27017/lbpns'
        },
        production: {
            connectionString: 'localhost'
        }
    }
};