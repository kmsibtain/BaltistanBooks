const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase'); // Assuming this export exists, checking below
const User = db.collection('users');

const generateToken = (id, role, name) => {
    return jwt.sign({ id, role, name }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const snapshot = await User.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Should only be one user with this email
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        if (userData && (await bcrypt.compare(password, userData.password))) {
            res.json({
                id: userId,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                token: generateToken(userId, userData.role, userData.name),
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Register a new user (Admin only or Initial Setup)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.where('email', '==', email).get();

        if (!userExists.empty) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: role || 'cashier', // Default to cashier
            createdAt: new Date().toISOString(),
        };

        const docRef = await User.add(newUser);

        if (docRef.id) {
            res.status(201).json({
                id: docRef.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(docRef.id, newUser.role, newUser.name),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by authMiddleware
    res.status(200).json(req.user);
};

module.exports = {
    loginUser,
    registerUser,
    getMe,
};
