const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Topic = require('../models/Topic');
const UserTopicProgress = require('../models/UserTopicProgress');
const Answer = require('../models/Answer');
const PYQ = require('../models/PYQ');
const Revision = require('../models/Revision');
const FocusSession = require('../models/FocusSession');

router.use(auth);

// GET /api/export/progress — export user progress as CSV
router.get('/progress', async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all user-specific data
        const [progress, answers, revisions, sessions] = await Promise.all([
            UserTopicProgress.find({ userId }).populate('topicId', 'title paper subjectName chapter'),
            Answer.find({ userId }).populate('pyqId', 'question year').select('content wordCount score status createdAt'),
            Revision.find({ userId }).populate('topicId', 'title paper').select('interval status scheduledDate completedDate'),
            FocusSession.find({ userId }).select('subject durationMinutes type date'),
        ]);

        let csv = 'UPSC KMS — Progress Export\n';
        csv += `Generated: ${new Date().toISOString()}\n\n`;

        // Topic Progress
        csv += '=== TOPIC PROGRESS ===\n';
        csv += 'Paper,Subject,Chapter,Topic,Status,Completed At\n';
        progress.forEach(p => {
            const t = p.topicId;
            if (!t) return;
            csv += `"${t.paper || ''}","${t.subjectName || ''}","${t.chapter || ''}","${t.title || ''}","${p.status || ''}","${p.completedAt || ''}"\n`;
        });

        // Answers
        csv += '\n=== ANSWERS ===\n';
        csv += 'Question,Year,Word Count,Score,Status,Date\n';
        answers.forEach(a => {
            const q = a.pyqId?.question || 'Topic Answer';
            const y = a.pyqId?.year || '';
            csv += `"${q}","${y}","${a.wordCount || ''}","${a.score || ''}","${a.status || ''}","${a.createdAt || ''}"\n`;
        });

        // Revisions
        csv += '\n=== REVISIONS ===\n';
        csv += 'Topic,Paper,Interval,Status,Scheduled,Completed\n';
        revisions.forEach(r => {
            csv += `"${r.topicId?.title || ''}","${r.topicId?.paper || ''}","${r.interval}","${r.status}","${r.scheduledDate || ''}","${r.completedDate || ''}"\n`;
        });

        // Focus Sessions
        csv += '\n=== FOCUS SESSIONS ===\n';
        csv += 'Subject,Duration (min),Type,Date\n';
        sessions.forEach(s => {
            csv += `"${s.subject || ''}","${s.durationMinutes}","${s.type}","${s.date || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=upsc-progress-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
