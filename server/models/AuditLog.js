const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['APPROVE', 'REJECT', 'REVOKE', 'UPDATE', 'DELETE', 'BROADCAST'], required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: Object }
}, { timestamps: true });

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
