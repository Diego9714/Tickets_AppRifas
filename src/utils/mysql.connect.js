const mysql = require('mysql2/promise')
const dbConfig = require('./db.config')
 
const pool = mysql.createPool(dbConfig)
 
module.exports = pool