const { db } = require('../config/firebase');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('storeConfig').get();

        if (!doc.exists) {
            // Return default settings if none exist
            return res.status(200).json({
                storeName: 'Baltistan Book Depot',
                address: 'Skardu, Pakistan',
                phone: '0000-0000000',
                email: 'info@baltistanbooks.com'
            });
        }

        res.status(200).json(doc.data());
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { storeName, address, phone, email } = req.body;

        const settings = {
            storeName,
            address,
            phone,
            email,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user.id
        };

        await db.collection('settings').doc('storeConfig').set(settings, { merge: true });

        const { logAction } = require('../utils/auditLogger');
        await logAction(req.user.id, req.user.name, 'UPDATE', 'SETTINGS', 'storeConfig', settings);

        res.status(200).json(settings);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
