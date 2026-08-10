const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { runScraper } = require('./workers/currentAffairsScraper');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Intelligent Aspirant\'s Suite API is running...');
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'running',
    database: states[dbStatus] || 'unknown',
    uri_configured: !!process.env.MONGO_URI
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const subjectsRoutes = require('./routes/subjects');
const topicsRoutes = require('./routes/topics');
const revisionsRoutes = require('./routes/revisions');
const currentAffairsRoutes = require('./routes/currentAffairs');
const pyqsRoutes = require('./routes/pyqs');
const answersRoutes = require('./routes/answers');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const aiRoutes = require('./routes/ai');
const quizRoutes = require('./routes/quiz');
const tasksRoutes = require('./routes/tasks');
const focusRoutes = require('./routes/focus');
const flashcardsRoutes = require('./routes/flashcards');
const analyticsRoutes = require('./routes/analytics');
const timetableRoutes = require('./routes/timetable');
const directivesRoutes = require('./routes/directives');
const quotesRoutes = require('./routes/quotes');
const notificationsRoutes = require('./routes/notifications');
const dailyPlanRoutes = require('./routes/dailyPlan');
const interlinkagesRoutes = require('./routes/interlinkages');
const essaysRoutes = require('./routes/essays');

app.use('/api/subjects', subjectsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/pyqs', pyqsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/directives', directivesRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/backup', require('./routes/backup'));
app.use('/api/notifications', notificationsRoutes);
app.use('/api/daily-plan', dailyPlanRoutes);
app.use('/api/interlinkages', interlinkagesRoutes);
app.use('/api/essays', essaysRoutes);
app.use('/api/answers/gallery', require('./routes/answerGallery'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');

      // Schedule Scraper at 6:00 AM IST (= 00:30 UTC) every day
      cron.schedule('30 0 * * *', async () => {
        console.log('[CRON] Running daily Current Affairs scraper at 6:00 AM IST...');
        try {
          const result = await runScraper();

          // Create notifications from scraper results
          if (result && result.sourceResults && result.sourceResults.length > 0) {
            for (const sr of result.sourceResults) {
              if (sr.count > 0) {
                await Notification.create({
                  type: 'current_affairs',
                  title: `📰 ${sr.count} new article${sr.count > 1 ? 's' : ''} from ${sr.source}`,
                  message: `Topics: ${sr.tags.slice(0, 5).join(', ')}`,
                  metadata: {
                    source: sr.source,
                    articleCount: sr.count,
                    tags: sr.tags
                  }
                });
              }
            }
            console.log(`[CRON] Created ${result.sourceResults.filter(s => s.count > 0).length} notification(s).`);
          }
        } catch (err) {
          console.error('[CRON] Scraper failed:', err.message);
        }
      });
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err.message);
    });
} else {
  console.warn('Warning: MONGO_URI environment variable is not defined.');
}
