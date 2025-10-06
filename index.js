// 1. Import all the necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// 2. Create an instance of the Express app
const app = express();
const PORT = 3000; // The port our server will run on

// 3. Set up middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Allow the app to understand JSON

// --- In-Memory Database ---
// For this example, we'll store users in a simple array.
// In a real app, this would be a real database (like MongoDB or PostgreSQL).
const users = [];

// --- API Endpoints ---

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
        // Get user data from the request body sent by the Android app
        const { name, surname, email, password } = req.body;

        // --- Validation ---
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password." });
        }

        // Check if the user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        // --- Password Hashing ---
        // Securely hash the password before storing it. 10 is the "salt round".
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user object
        const newUser = {
            id: users.length + 1, // Simple ID generation
            name,
            surname,
            email,
            password: hashedPassword // Store the HASHED password
        };

        // "Save" the user to our in-memory array
        users.push(newUser);

        console.log('User registered:', newUser);
        console.log('All users:', users);

        // Send a success response back to the Android app
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

        // Find the user by their email in our "database"
        const user = users.find(u => u.email === email);

        // If user is not found, or if password does not match, send an error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // If login is successful
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
    console.log(`Server is running on http://localhost:${PORT}`);
});
