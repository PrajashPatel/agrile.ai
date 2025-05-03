// signup.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../users.json');

router.post('/signup', (req, res) => {
  const { firstName, email, password } = req.body;

  let users = [];

  if (fs.existsSync(dataPath)) {
    users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    return res.send('User already exists. Please login.');
  }

  const newUser = { firstName, email, password };
  users.push(newUser);

  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

  // Instead of res.send('Signup successful!'), do this:
  res.redirect('/login');
});

export default router;
