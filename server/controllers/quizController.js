const { GoogleGenAI } = require('@google/genai');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');

const ai = new GoogleGenAI({}); 

exports.getDailyQuiz = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let quiz = await Quiz.findOne({ 
      userId: req.user.id,
      date: { $gte: startOfDay }, 
      type: 'Daily' 
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily quiz', error: error.message });
  }
};

exports.generateDailyQuiz = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    // 1. Get 1 or 2 recent topics to base the quiz on
    const recentTopics = await Topic.find().sort({ updatedAt: -1 }).limit(2);
    
    if (recentTopics.length === 0) {
      return res.status(400).json({ message: 'No topics available to generate a quiz from.' });
    }

    // Aggregate some context from these topics
    let context = '';
    recentTopics.forEach(topic => {
      context += `Topic: ${topic.title}\n`;
      if (topic.notes.intro) context += `Intro: ${topic.notes.intro}\n`;
      if (topic.notes.body) context += `Body: ${topic.notes.body}\n`;
      if (topic.notes.currentAffairs) context += `Current Affairs: ${topic.notes.currentAffairs}\n`;
    });

    const prompt = `
    You are an expert UPSC examiner creating a daily practice quiz.
    Based on the following student notes, generate 3 high-quality, statement-based Multiple Choice Questions (MCQs) in the exact style of the UPSC Civil Services Preliminary Examination (e.g., "Consider the following statements... Which of the above are correct?").

    Student Notes:
    ${context}

    Generate the output strictly as a JSON array of objects. Do not use markdown blocks like \`\`\`json. Each object must have this exact structure:
    [
      {
        "questionText": "<The full question including the statements>",
        "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
        "correctAnswer": "<The exact string of the correct option from the options array>",
        "explanation": "<A detailed explanation of why this option is correct and why others are wrong, linking back to the topic>"
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const questionsData = JSON.parse(response.text);

    // Ensure we have an array
    if (!Array.isArray(questionsData)) {
      throw new Error("AI did not return an array.");
    }

    // Append topicId to questions (just mapping to the first topic for simplicity)
    const questions = questionsData.map(q => ({
      ...q,
      topicId: recentTopics[0]._id
    }));

    const newQuiz = new Quiz({
      userId: req.user.id,
      type: 'Daily',
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
    const { score } = req.body;
    
    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, userId: req.user.id }, 
      { status: 'Completed', score }, 
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};
