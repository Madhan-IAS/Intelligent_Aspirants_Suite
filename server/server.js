const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { runScraper } = require('./workers/currentAffairsScraper');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();

// Startup env check
console.log('[ENV] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('[ENV] GOOGLE_API_KEY present:', !!process.env.GOOGLE_API_KEY);
console.log('[ENV] MONGO_URI present:', !!process.env.MONGO_URI);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://upsc-kms.onrender.com')
    : '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

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

  const memoryInfo = process.memoryUsage();

  res.json({
    status: 'running',
    database: states[dbStatus] || 'unknown',
    uri_configured: !!process.env.MONGO_URI,
    uptime_seconds: process.uptime(),
    system_uptime: os.uptime(),
    timestamp: new Date(),
    memory: {
      rss: `${Math.round(memoryInfo.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryInfo.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryInfo.heapUsed / 1024 / 1024)} MB`
    },
    system: {
      totalMem: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      freeMem: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      cpus: os.cpus().length,
      loadAvg: os.loadavg()
    }
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
const mindMapsRoutes = require('./routes/mindMaps');
const subscriptionRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/admin');
const rateLimit = require('express-rate-limit');

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests from this IP, please try again in 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts, please try again later' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'AI request limit reached for this IP. Please try again in an hour.' }
});

app.use(globalLimiter);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/pyqs', pyqsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
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
app.use('/api/mind-maps', mindMapsRoutes);
app.use('/api/answers/gallery', require('./routes/answerGallery'));
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/export', require('./routes/export'));

// Global Error Handler
app.use((err, req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}\n${err.stack}\n\n`;
  console.error(logMessage);
  fs.appendFile(path.join(__dirname, 'error.log'), logMessage, (fsErr) => {
    if (fsErr) console.error('Failed to write to error log:', fsErr);
  });
  const status = err.status || 500;
  res.status(status).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

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
                  isBroadcast: true,
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

      // Schedule Subscription Auto-Expire at midnight IST (= 18:30 UTC)
      cron.schedule('30 18 * * *', async () => {
        console.log('[CRON] Running subscription auto-expire check...');
        try {
          const User = require('./models/User');
          const result = await User.updateMany(
            { subscriptionStatus: 'active', subscriptionExpiry: { $lte: new Date() }, role: { $ne: 'admin' } },
            { $set: { subscriptionStatus: 'expired', subscriptionTier: 'foundation' } }
          );
          if (result.modifiedCount > 0) {
            console.log(`[CRON] Expired ${result.modifiedCount} subscription(s).`);
          }
        } catch (err) {
          console.error('[CRON] Subscription auto-expire failed:', err.message);
        }
      });
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err.message);
    });
} else {
  console.warn('Warning: MONGO_URI environment variable is not defined.');
}
