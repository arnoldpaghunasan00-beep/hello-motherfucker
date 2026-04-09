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

// multer setup
const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// MySQL connection
const db = mysql.createPool(process.env.MYSQL_PUBLIC_URL);

// test connection
db.query("SELECT 1", (err) => {
  if (err) console.log("❌ DB FAILED:", err);
  else console.log("✅ CONNECTED TO MYSQL");
});

// homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// create product
app.post('/create', upload.single('image'), (req, res) => {
  const price = req.body.caption;
  const image = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO posts (image, caption) VALUES (?, ?)",
    [image, price],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }
      res.redirect('/');
    }
  );
});

// get products
app.get('/posts', (req, res) => {
  db.query("SELECT id, image, caption FROM posts", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// delete product (AJAX)
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM posts WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Delete failed");
    }
    res.send("Deleted");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});