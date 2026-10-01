const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const PYQ = require('../models/PYQ');
const Answer = require('../models/Answer');
const Revision = require('../models/Revision');
const CurrentAffair = require('../models/CurrentAffair');
const Directive = require('../models/Directive');
const Quote = require('../models/Quote');
const Flashcard = require('../models/Flashcard');
const FocusSession = require('../models/FocusSession');
const Task = require('../models/Task');
const TimetableSlot = require('../models/TimetableSlot');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

exports.exportAllData = async (req, res) => {
  try {
    const [
      topics, subjects, pyqs, answers, revisions, currentAffairs,
      directives, quotes, flashcards, focusSessions, tasks, timetableSlots, quizzes, users
    ] = await Promise.all([
      Topic.find(),
      Subject.find(),
      PYQ.find(),
      Answer.find(),
      Revision.find(),
      CurrentAffair.find(),
      Directive.find(),
      Quote.find(),
      Flashcard.find(),
      FocusSession.find(),
      Task.find(),
      TimetableSlot.find(),
      Quiz.find(),
      User.find({}, '-passwordHash')
    ]);

    const backupPayload = {
      exportedAt: new Date().toISOString(),
      appName: "IAS - Intelligent Aspirant's Suite",
      version: "1.0",
      counts: {
        topics: topics.length,
        subjects: subjects.length,
        pyqs: pyqs.length,
        answers: answers.length,
        revisions: revisions.length,
        currentAffairs: currentAffairs.length,
        directives: directives.length,
        quotes: quotes.length,
        flashcards: flashcards.length,
        focusSessions: focusSessions.length,
        tasks: tasks.length,
        timetableSlots: timetableSlots.length,
        quizzes: quizzes.length,
        users: users.length
      },
      data: {
        topics, subjects, pyqs, answers, revisions, currentAffairs,
        directives, quotes, flashcards, focusSessions, tasks, timetableSlots, quizzes, users
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ias_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupPayload);
  } catch (error) {
    console.error('Export backup error:', error);
    res.status(500).json({ message: 'Failed to generate database backup', error: error.message });
  }
};

exports.restoreAllData = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: 'Invalid backup format: data field missing' });

    console.log('--- STARTING BULK RESTORE ---');

    // To prevent total disaster if someone uploads an empty object, do some checks
    if (!data.users || !data.topics) {
      return res.status(400).json({ message: 'Backup missing critical collections (users/topics).' });
    }

    // 1. CLEAR existing data
    await Promise.all([
      Topic.deleteMany({}), Subject.deleteMany({}), PYQ.deleteMany({}), Answer.deleteMany({}),
      Revision.deleteMany({}), CurrentAffair.deleteMany({}), Directive.deleteMany({}), Quote.deleteMany({}),
      Flashcard.deleteMany({}), FocusSession.deleteMany({}), Task.deleteMany({}), TimetableSlot.deleteMany({}),
      Quiz.deleteMany({}), User.deleteMany({})
    ]);

    // 2. INSERT exported data
    if (data.users?.length) await User.insertMany(data.users);
    if (data.subjects?.length) await Subject.insertMany(data.subjects);
    if (data.topics?.length) await Topic.insertMany(data.topics);
    if (data.pyqs?.length) await PYQ.insertMany(data.pyqs);
    if (data.answers?.length) await Answer.insertMany(data.answers);
    if (data.revisions?.length) await Revision.insertMany(data.revisions);
    if (data.currentAffairs?.length) await CurrentAffair.insertMany(data.currentAffairs);
    if (data.directives?.length) await Directive.insertMany(data.directives);
    if (data.quotes?.length) await Quote.insertMany(data.quotes);
    if (data.flashcards?.length) await Flashcard.insertMany(data.flashcards);
    if (data.focusSessions?.length) await FocusSession.insertMany(data.focusSessions);
    if (data.tasks?.length) await Task.insertMany(data.tasks);
    if (data.timetableSlots?.length) await TimetableSlot.insertMany(data.timetableSlots);
    if (data.quizzes?.length) await Quiz.insertMany(data.quizzes);

    console.log('--- BULK RESTORE COMPLETE ---');

    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Backup restore error:', error);
    res.status(500).json({ message: 'Failed to restore database from backup', error: error.message });
  }
};
