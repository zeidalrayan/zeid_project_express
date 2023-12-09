const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "db_ekommers",
  password: "",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connect Database");
});

module.exports = connection;
