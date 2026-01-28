const { db } = require('../config/firebase');

/**
 * Log an audit action
 * @param {string} userId - ID of the user performing action
 * @param {string} userName - Name of the user
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entity - Entity affected (PRODUCT, SALE, SETTINGS, etc.)
 * @param {string} entityId - ID of the entity
 * @param {object} details - Additional details/metadata
 */
const logAction = async (userId, userName, action, entity, entityId, details = {}) => {
    try {
        await db.collection('audit_logs').add({
            userId,
            userName,
            action,
            entity,
            entityId,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
        // Don't throw error to avoid blocking main operation
    }
};

module.exports = { logAction };
