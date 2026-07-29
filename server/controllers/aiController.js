const { GoogleGenAI } = require('@google/genai');
const Answer = require('../models/Answer');
const PYQ = require('../models/PYQ');
const CurrentAffair = require('../models/CurrentAffair');
const Topic = require('../models/Topic');

const ai = new GoogleGenAI({}); // Automatically uses GEMINI_API_KEY from env

exports.evaluateAnswer = async (req, res) => {
  try {
    const { answerId } = req.body;
    const answer = await Answer.findById(answerId).populate('pyqId');

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        message: 'GEMINI_API_KEY is not set in the server/.env file. Please add your key to enable AI evaluation.' 
      });
    }

    const pyq = answer.pyqId;
    const totalMarks = pyq.marks || 10;
    const wordLimit = pyq.wordLimit || 150;

    const prompt = `
    You are an expert UPSC Civil Services Mains examiner. Evaluate the following student answer to a Previous Year Question (PYQ).

    Question: ${pyq.question}
    Directive (e.g., Discuss, Analyze): ${pyq.directive || 'None provided'}
    Year: ${pyq.year}
    Total Marks: ${totalMarks}
    Word Limit: ${wordLimit}

    Student's Answer:
    "${answer.content}"

    Evaluate the answer based on standard UPSC criteria:
    1. Introduction (Context, Definition, Data)
    2. Body (Addressing all parts of the question, arguments, examples)
    3. Conclusion (Forward-looking, balanced)
    4. Adherence to the directive.
    5. Adherence to the word limit (${wordLimit} words).

    Provide your evaluation in the following JSON format ONLY, do not wrap in markdown blocks like \`\`\`json:
    {
      "score": <number out of ${totalMarks}>,
      "feedback": "<A concise paragraph providing overall feedback on the structure and quality of the answer>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"],
      "suggestedPoints": ["<point 1 that was missed>", "<point 2 that was missed>"],
      "rubricBreakdown": {
        "contentAndConcepts": { "score": <number out of ${totalMarks * 0.35}>, "max": ${totalMarks * 0.35} },
        "structureAndPresentation": { "score": <number out of ${totalMarks * 0.25}>, "max": ${totalMarks * 0.25} },
        "directiveAdherence": { "score": <number out of ${totalMarks * 0.20}>, "max": ${totalMarks * 0.20} },
        "valueAddition": { "score": <number out of ${totalMarks * 0.20}>, "max": ${totalMarks * 0.20} }
      }
    }

    Ensure that the sum of the scores in the four rubricBreakdown dimensions equals the overall "score".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const evaluationText = response.text;
    const evaluation = JSON.parse(evaluationText);

    answer.aiEvaluation = evaluation;
    answer.score = evaluation.score;
    answer.status = 'Evaluated';
    await answer.save();

    res.json(answer);
  } catch (error) {
    console.error('AI Evaluation Error:', error);
    res.status(500).json({ message: 'Failed to evaluate answer. Ensure your API key is valid.', error: error.message });
  }
};

exports.generateDailyQuiz = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    // Get recent current affairs (last 7 days) to form the context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCA = await CurrentAffair.find({ date: { $gte: sevenDaysAgo } }).limit(10);
    let contextText = recentCA.map(ca => `Title: ${ca.title}\nContent: ${ca.content}`).join('\n\n');
    
    if (!contextText.trim()) {
      contextText = "General UPSC Syllabus (Polity, History, Geography, Economy, Environment)";
    }

    const prompt = `
    You are an expert UPSC Prelims examiner. Generate 5 multiple-choice questions (MCQs) of UPSC Prelims standard based on the following context, or general UPSC syllabus if context is generic.
    
    Context:
    ${contextText}

    The questions should be conceptual, statement-based (like "Consider the following statements..."), or matching type. 
    Provide your output in the following JSON format ONLY, without any markdown blocks:
    {
      "questions": [
        {
          "questionText": "<The question>",
          "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
          "correctAnswerIndex": <0, 1, 2, or 3>,
          "explanation": "<Detailed explanation of why this is correct and others are wrong>"
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const quizData = JSON.parse(response.text);
    res.json(quizData);
  } catch (error) {
    console.error('AI Quiz Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate quiz.', error: error.message });
  }
};

exports.generateDailyQuestion = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    // Pick a random pending or in progress topic
    const topics = await Topic.find({ status: { $in: ['Pending', 'In Progress'] } }).populate('subjectId');
    let topicName = "Current Affairs";
    let subjectName = "General Studies";
    
    if (topics.length > 0) {
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      topicName = randomTopic.title;
      if (randomTopic.subjectId) {
         subjectName = randomTopic.subjectId.name;
      }
    }

    const prompt = `
    You are an expert UPSC Mains examiner. Generate 1 Mains-level subjective question (10 marks, 150 words OR 15 marks, 250 words) based on the following Topic and Subject.
    
    Subject: ${subjectName}
    Topic: ${topicName}

    The question should test analytical skills and application of knowledge. Provide a directive (e.g. Discuss, Critically Analyze).
    Provide your output in the following JSON format ONLY, without any markdown blocks:
    {
      "question": "<The full question text>",
      "directive": "<The directive word used>",
      "marks": <10 or 15>,
      "words": <150 or 250>,
      "hints": ["<Hint 1>", "<Hint 2>"]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const questionData = JSON.parse(response.text);
    res.json(questionData);
  } catch (error) {
    console.error('AI Question Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate question.', error: error.message });
  }
};

exports.generateModelOutline = async (req, res) => {
  try {
    const { pyqId } = req.body;
    const pyq = await PYQ.findById(pyqId).populate('subjectId');
    if (!pyq) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    const totalMarks = pyq.marks || 10;
    const wordLimit = pyq.wordLimit || 150;
    const directive = pyq.directive || 'N/A';
    const subject = pyq.subjectId ? pyq.subjectId.name : 'General Studies';

    const prompt = `
    You are an expert UPSC Civil Services Mains examiner and mentor. Create a high-quality model answer outline (blueprint) for the following practice question.

    Question: ${pyq.question}
    Subject: ${subject}
    Directive: ${directive}
    Total Marks: ${totalMarks}
    Word Limit: ${wordLimit}

    Create a comprehensive outline of how to write the perfect answer. Provide your response in the following JSON format ONLY, do not wrap in markdown blocks like \`\`\`json:
    {
      "introductionOutline": ["<Bullet point for definition/context/background>", "<Key data or starting fact to quote>"],
      "bodyOutline": [
        {
          "heading": "<Subheading name for Section 1 (e.g. Constitutional Provisions, Key Arguments)>",
          "points": ["<Key point 1>", "<Key point 2>"]
        },
        {
          "heading": "<Subheading name for Section 2 (e.g. Critical Gaps, Challenges)>",
          "points": ["<Key point 1>", "<Key point 2>"]
        }
      ],
      "conclusionOutline": ["<Way Forward / Balanced, constructive ending statement>", "<Linkage to future vision / constitutional principles>"],
      "valueAdds": ["<Key articles, committee reports, Supreme Court judgments, or SDGs to explicitly reference in the answer>"]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const outline = JSON.parse(response.text);
    res.json(outline);
  } catch (error) {
    console.error('AI Model Outline Error:', error);
    res.status(500).json({ message: 'Failed to generate model outline.', error: error.message });
  }
};

exports.generateTopicNotes = async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) {
      return res.status(400).json({ message: 'topicId is required' });
    }

    const topic = await Topic.findById(topicId).populate('subjectId');
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    const subjectName = topic.subjectId?.name || 'General Studies';

    const prompt = `
    You are an elite UPSC Civil Services mentor. Generate high-yield, structured exam notes for the syllabus topic:
    Topic Title: "${topic.title}"
    Subject/Paper: "${subjectName}"

    Generate bulleted, precise markdown text for the following note fields. Keep content concise, authoritative, and tailored for UPSC Mains answer writing:
    - theory: Core conceptual breakdown and explanation.
    - definitions: Key technical terms and formal definitions.
    - examples: Real-world, recent Indian/global examples.
    - caseStudies: Concrete case study examples.
    - statistics: Latest government data, reports, or census figures.
    - committeeReports: Relevant committee recommendations (e.g. Punchhi, ARC, Economic Survey).
    - supremeCourtCases: Landmark judgments or constitutional articles.
    - governmentSchemes: Key schemes, policies, or flagship programs.
    - wayForward: Actionable, forward-looking recommendations.
    - valueAddition: Quotes, SDG connections, or diagrams/keywords.

    Output format: Return ONLY valid JSON with these keys:
    {
      "theory": "...",
      "definitions": "...",
      "examples": "...",
      "caseStudies": "...",
      "statistics": "...",
      "committeeReports": "...",
      "supremeCourtCases": "...",
      "governmentSchemes": "...",
      "wayForward": "...",
      "valueAddition": "..."
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const aiNotes = JSON.parse(response.text);

    // Merge notes: only populate fields that are currently empty string to preserve user notes
    if (!topic.notes) topic.notes = {};
    
    Object.keys(aiNotes).forEach(key => {
      if (!topic.notes[key] || topic.notes[key].trim() === '') {
        topic.notes[key] = aiNotes[key];
      }
    });

    await topic.save();
    res.json({ message: 'Topic notes generated successfully', notes: topic.notes });
  } catch (error) {
    console.error('AI Generate Topic Notes Error:', error);
    res.status(500).json({ message: 'Failed to generate topic notes.', error: error.message });
  }
};
