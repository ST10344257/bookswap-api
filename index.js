// 1. Import all the necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// 2. --- THIS IS THE FIX ---
// Use the port Render provides via environment variables, or default to 3000
const PORT = process.env.PORT || 3000;

// 3. Set up middleware
app.use(cors());
app.use(bodyParser.json());

// --- In-Memory Database ---
const users = [];

// --- API Endpoints ---

// ... (The rest of your API code for /register and /login remains exactly the same) ...

// A simple test route to make sure the server is working
app.get('/', (req, res) => {
    res.send('Welcome to the BookSwap API!');
});

/**
 * [POST] /register
 * The endpoint for creating a new user account.
 */
app.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password." });
        }
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            name,
            surname,
            email,
            password: hashedPassword
        };
        users.push(newUser);
        console.log('User registered:', newUser);
        res.status(201).json({ message: "User registered successfully!", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: "An error occurred on the server." });
    }
});

/**
 * [POST] /login
 * The endpoint for logging a user in.
 */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred on the server." });
    }
});

// 5. Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```


    

