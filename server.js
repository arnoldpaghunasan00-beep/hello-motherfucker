const express = require('express');
const mysql = require('mysql2');
const path  =require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.post('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});