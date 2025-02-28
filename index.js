require('dotenv').config();
const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3010;

app.use(express.json());
app.use(express.static('static'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});


const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
   
  
    const hashedPassword = await bcrypt.hash(password,10);
    
    // Create new user with hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    // Save user to database
    await newUser.save();
    
    // Send success response
    res.status(201).json({ success: true, message: 'User registered successfully' });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

app.listen(port, () => {
  console.log(`Server is runnning at http://localhost:${port}`);
});