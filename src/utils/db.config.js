const {PG_HOST , PG_NAME , PG_PASS , PG_USER} = require("../global/_var");

module.exports = {
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASS,
    database: PG_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };