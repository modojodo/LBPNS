/*jslint node:true*/

module.exports = {
    cookieSecret: 'fat mountain activity direction',
    mongo: {
        development: {
            connectionString: 'mongodb://localhost:27017/lbpns'
        },
        production: {
            connectionString: 'mongodb://umer:123456@dbh16.mongolab.com:27167/lbpns'
        }
    }
};