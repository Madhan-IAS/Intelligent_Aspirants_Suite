const { GoogleGenAI } = require('@google/genai');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const DailyPlan = require('../models/DailyPlan');

// SDK auto-reads GOOGLE_API_KEY from env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });

// Helper: get today's IST date string
function getTodayIST() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`;
}

exports.getDailyQuiz = async (req, res) => {
  try {
    const today = getTodayIST();
    let quiz = await Quiz.findOne({
      userId: req.user.id,
      date: today,
      type: 'Daily'
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily quiz', error: error.message });
  }
};

exports.generateDailyQuiz = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API Key is not set. Please add GEMINI_API_KEY or GOOGLE_API_KEY to your server .env file.' });
    }

    const userId = req.user.id;
    const today = getTodayIST();

    // 1. Get today's Daily Plan to extract the GS topics
    const dailyPlan = await DailyPlan.findOne({ userId, date: today })
      .populate('gsTopicIds', 'title subjectName chapter notes');

    if (!dailyPlan || !dailyPlan.gsTopicIds || dailyPlan.gsTopicIds.length === 0) {
      return res.status(400).json({ message: 'No Daily Plan or GS topics found for today. Please generate your daily plan first.' });
    }

    // 2. Build context from today's GS topics
    const gsTopics = dailyPlan.gsTopicIds;
    let context = `Today's GS Paper: ${dailyPlan.gsPaper}\n\n`;
    gsTopics.forEach((topic, idx) => {
      context += `--- Topic ${idx + 1}: ${topic.title} (${topic.subjectName}) ---\n`;
      if (topic.chapter) context += `Chapter: ${topic.chapter}\n`;
      if (topic.notes?.intro) context += `Intro: ${topic.notes.intro}\n`;
      if (topic.notes?.body) context += `Body: ${topic.notes.body}\n`;
      if (topic.notes?.currentAffairs) context += `Current Affairs Link: ${topic.notes.currentAffairs}\n`;
      context += '\n';
    });

    const topicTitles = gsTopics.map(t => t.title).join(', ');

    // 3. Generate 25 UPSC-style MCQs via Gemini
    const prompt = `
You are UPSC CSE (Civil Services Examination) Senior Paper-Setter for the Preliminary Examination (Paper I – General Studies).

Your task: Generate exactly 25 high-quality, exam-standard MCQs based on the following topics from today's study schedule.

Topics: ${topicTitles}

Context from student's notes:
${context}

STRICT RULES FOR QUESTION FORMAT (follow UPSC Prelims pattern exactly):
1. Use statement-based questions: "Consider the following statements:" followed by numbered statements, then ask "Which of the statements given above is/are correct?" with options like "(a) 1 only (b) 2 and 3 only (c) 1, 2 and 3 (d) None of the above".
2. Use assertion-reason pattern occasionally: "Statement 1:... Statement 2:..." then ask about correctness and relationship.
3. Use "With reference to..." pattern for factual questions.
4. Use "Which of the following..." for list-based elimination questions.
5. Include negative marking awareness — options should be tricky but fair.
6. Cover all provided topics proportionally.
7. Mix difficulty: 8 Easy, 10 Medium, 7 Hard.
8. Each question MUST have exactly 4 options labeled (a), (b), (c), (d).
9. The correctAnswer must be the EXACT full string of the correct option.

Generate output as a JSON array. Do NOT wrap in markdown code blocks. Each object must have:
[
  {
    "questionText": "<Full question with statements>",
    "options": ["(a) ...", "(b) ...", "(c) ...", "(d) ..."],
    "correctAnswer": "<exact string from options array>",
    "explanation": "<detailed explanation referencing the topic>"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const questionsData = JSON.parse(response.text);

    if (!Array.isArray(questionsData)) {
      throw new Error('AI did not return a valid array of questions.');
    }

    // Map topics to questions
    const questions = questionsData.map((q, idx) => ({
      ...q,
      topicId: gsTopics[idx % gsTopics.length]._id
    }));

    const newQuiz = new Quiz({
      userId,
      type: 'Daily',
      date: today,
      questions,
      status: 'Pending'
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate quiz.', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, selectedAnswers } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status: 'Completed', score, selectedAnswers },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};
