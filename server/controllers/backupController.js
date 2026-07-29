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
