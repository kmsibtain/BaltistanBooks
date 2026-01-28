const { db } = require('../src/config/firebase');
const bcrypt = require('bcryptjs');

// Create an initial admin user manually
const seedAdmin = async () => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', 'admin@baltistanbooks.com').get();

        if (!snapshot.empty) {
            console.log('Admin user already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await usersRef.add({
            name: 'Admin User',
            email: 'admin@baltistanbooks.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString()
        });

        console.log('Admin user created successfully.');
        console.log('Email: admin@baltistanbooks.com');
        console.log('Password: admin123'); // Simple default password
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

seedAdmin();
