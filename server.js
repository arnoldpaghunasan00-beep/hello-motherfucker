const express = require('express');
const mysql = require('mysql2');
const path = require('path');
console.log("HOST:", process.env.MYSQLHOST);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ✅ CHANGE: use createPool (more stable)
const db = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 10000
});

// ✅ SIMPLE TEST (replace db.connect)
db.query("SELECT 1", (err) => {
  if (err) {
    console.log("❌ FAILED:", err);
  } else {
    console.log("✅ CONNECTED TO MYSQL");
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/create', (req, res) => {
  let {name, password} = req.body;

    name = name.replace(/[^a-zA-Z0-9_ ]/g, '');
    password = password.replace(/[^a-zA-Z0-9_ ]/g, '');

  if (!name||!password) {
    return res.send("Invalid syntax, please try again");
  }

 

  db.query(
    "INSERT INTO user (username, password) VALUES (?, ?)",
    [name, password],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }
      res.redirect('/');
    }
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});