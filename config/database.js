const mysql = require("mysql");

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connect Database");
});

module.exports = connection;
