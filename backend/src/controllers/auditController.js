const { db } = require('../config/firebase');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
const getLogs = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const snapshot = await db.collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(Number(limit))
            .get();

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(logs);
    } catch (error) {
        console.error('Get Audit Logs Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getLogs
};
