const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// ✅ multer setup (image upload)
const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ MySQL connection (Railway)
const db = mysql.createPool({
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// test connection
db.query("SELECT 1", (err) => {
  if (err) {
    console.log("❌ DB FAILED:", err);
  } else {
    console.log("✅ CONNECTED TO MYSQL");
  }
});

// serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ create post (image + caption)
app.post('/create', upload.single('image'), (req, res) => {
  const caption = req.body.caption;
  const image = req.file.filename;


  db.query("INSERT INTO posts (image, caption) VALUES (?, ?)", [image, caption], (err) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }
      res.redirect('/');
    }
  );
});

// ✅ get all posts
app.get('/posts', (req, res) => {
  db.query("SELECT id, image, caption FROM posts", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


// ✅ delete post
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM posts WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Delete failed", err);
    }
    res.redirect('/');
  });
});

// server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});