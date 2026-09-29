const { GoogleGenAI } = require('@google/genai');
const Answer = require('../models/Answer');
const PYQ = require('../models/PYQ');
const CurrentAffair = require('../models/CurrentAffair');
const Topic = require('../models/Topic');
const Interlinkage = require('../models/Interlinkage');
const { incrementUsage } = require('../middleware/aiLimits');

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
        message: 'GEMINI_API_KEY is not set. Please add it to your server/.env file (locally) or as an Environment Variable in the Render Dashboard.'
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

    await incrementUsage(req.user.id, 'aiAnswerEvaluations');
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

    await incrementUsage(req.user.id, 'aiQuizGenerated');
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

    await incrementUsage(req.user.id, 'aiQuestionGenerated');
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

    await incrementUsage(req.user.id, 'aiTopicSummaries');
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

    await incrementUsage(req.user.id, 'aiTopicSummaries');
    res.json({ message: 'Topic notes generated successfully', notes: topic.notes });
  } catch (error) {
    console.error('AI Generate Topic Notes Error:', error);
    res.status(500).json({ message: 'Failed to generate topic notes.', error: error.message });
  }
};

exports.generateAnalysisPrompts = async (req, res) => {
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

    // Fetch interlinkage dimensions for this topic
    const links = await Interlinkage.find({
      $or: [{ sourceTopicId: topicId }, { targetTopicId: topicId }]
    }).limit(10);
    const dimensions = [...new Set(links.map(l => l.dimension))];

    const subjectName = topic.subjectId?.name || topic.paper || 'General Studies';

    const prompt = `
    You are an expert UPSC mentor using the SPECTRUM multi-dimensional analysis approach.
    Generate 6 deep analytical questions for the following UPSC syllabus topic. These questions should help an aspirant ANALYSE the topic critically, not just recall facts.

    Topic: "${topic.title}"
    Subject/Paper: "${subjectName}"
    Chapter: "${topic.chapter || 'General'}"
    Connected SPECTRUM Dimensions: ${dimensions.length > 0 ? dimensions.join(', ') : 'Multiple GS papers'}

    Generate questions in these categories:
    1. WHY - Why is this topic important for UPSC? What makes it relevant?
    2. HOW - How does this topic work/function in the real world?
    3. CONNECT - How does this topic connect to other dimensions (${dimensions.slice(0, 3).join(', ') || 'other subjects'})?
    4. CHALLENGE - What are the key challenges, criticisms, or debates around this topic?
    5. SOLUTION - What are the possible solutions, reforms, or way forward?
    6. APPLY - How would you use this knowledge in a UPSC Mains answer or Essay?

    Output format: Return ONLY valid JSON:
    {
      "prompts": [
        { "category": "WHY", "question": "...", "hint": "..." },
        { "category": "HOW", "question": "...", "hint": "..." },
        { "category": "CONNECT", "question": "...", "hint": "..." },
        { "category": "CHALLENGE", "question": "...", "hint": "..." },
        { "category": "SOLUTION", "question": "...", "hint": "..." },
        { "category": "APPLY", "question": "...", "hint": "..." }
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

    const analysisData = JSON.parse(response.text);

    await incrementUsage(req.user.id, 'aiAnalyticPrompts');
    res.json(analysisData);
  } catch (error) {
    console.error('AI Analysis Prompts Error:', error);
    res.status(500).json({ message: 'Failed to generate analysis prompts.', error: error.message });
  }
};

exports.autoLinkCurrentAffairs = async (req, res) => {
  try {
    const articles = await CurrentAffair.find({ $or: [{ relatedTopicIds: { $exists: false } }, { relatedTopicIds: { $size: 0 } }] }).limit(5);

    let processedCount = 0;
    for (const article of articles) {
      if (!article.content && !article.title) continue;

      const prompt = `You are a UPSC expert. Analyze this current affairs article:
Title: ${article.title}
Content: ${article.content ? article.content.substring(0, 1000) : ''}

Generate exactly 3 highly specific UPSC syllabus search keyword phrases (comma-separated, no quotes, no extra text) that best map to this article. Example: Anti-Defection Law, Fundamental Rights, Monetary Policy`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const keywords = response.text.split(',').map(s => s.trim().replace(/['"]/g, ''));

      const foundTopicIds = new Set();
      for (const kw of keywords) {
        if (!kw) continue;
        const topics = await Topic.find({ $text: { $search: kw } }).limit(2).select('_id');
        topics.forEach(t => foundTopicIds.add(t._id.toString()));
      }

      const topicIdsArray = Array.from(foundTopicIds);
      if (topicIdsArray.length > 0) {
        article.relatedTopicIds = topicIdsArray;
        await article.save();
        processedCount++;

        // Auto-create interlinkages between these discovered topics
        for (let i = 0; i < topicIdsArray.length; ++i) {
          for (let j = i + 1; j < topicIdsArray.length; ++j) {
            const exists1 = await Interlinkage.findOne({ sourceTopicId: topicIdsArray[i], targetTopicId: topicIdsArray[j] });
            const exists2 = await Interlinkage.findOne({ sourceTopicId: topicIdsArray[j], targetTopicId: topicIdsArray[i] });
            if (!exists1 && !exists2) {
              await Interlinkage.create({
                sourceTopicId: topicIdsArray[i],
                targetTopicId: topicIdsArray[j],
                dimension: 'Current Affairs Intersect',
                strength: 'Moderate',
                note: `Automatically linked via CA: ${article.title}`
              });
            }
          }
        }
      }
    }

    res.json({ message: 'Auto-linking complete', processed: processedCount, totalUnlinkedRemaining: await CurrentAffair.countDocuments({ $or: [{ relatedTopicIds: { $exists: false } }, { relatedTopicIds: { $size: 0 } }] }) });
  } catch (error) {
    console.error('Error auto-linking current affairs:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.evaluateEssay = async (req, res) => {
  try {
    const { essayId, content } = req.body;
    const EssayTheme = require('../models/EssayTheme');
    const theme = await EssayTheme.findById(essayId);

    if (!theme) return res.status(404).json({ message: 'Essay theme not found' });
    if (!content || content.length < 50) return res.status(400).json({ message: 'Essay is too short to evaluate.' });

    const prompt = `You are a strict UPSC Examiner evaluating a mock essay.
Title: "${theme.title}"
Category: ${theme.category}
Expected SPECTRUM Dimensions: ${theme.spectrumDimensions?.join(', ') || 'Various'}

Student's Essay:
"""
${content}
"""

Evaluate the essay out of 125 marks. Check for multi-dimensional analysis, coherence, structural flow, and depth.
Output strictly in this exact JSON format:
{
  "marks": <integer between 0 and 125>,
  "strengths": ["...", "..."],
  "missingDimensions": ["...", "..."],
  "feedback": "...",
  "modelParagraph": "A sample high-quality introductory or concluding paragraph for this essay."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const evaluation = JSON.parse(response.text);

    await incrementUsage(req.user.id, 'aiEssayEvaluations');
    res.json(evaluation);
  } catch (error) {
    console.error('AI Essay Evaluation Error:', error);
    res.status(500).json({ message: 'Failed to evaluate essay.', error: error.message });
  }
};

exports.recommendNextTopics = async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).json({ message: 'topicId is required' });

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });
    }

    // Grab 15 other topics from the same paper to choose from
    const candidates = await Topic.find({
      paper: topic.paper,
      _id: { $ne: topic._id }
    }).limit(15).select('title chapter');

    if (candidates.length === 0) {
      return res.json({ recommendations: [] });
    }

    const candidateList = candidates.map(c => `- ID: ${c._id.toString()} | Title: ${c.title} | Chapter: ${c.chapter}`).join('\n');

    const prompt = `You are a UPSC Study Planner AI. The student just completed studying the following topic:
Title: "${topic.title}"
Chapter: "${topic.chapter}"
Paper: "${topic.paper}"

Based on logical progression, syllabus flow, and conceptual prerequisites, select exactly 3 topics from the list below that the student should study next. 

Available Candidates:
${candidateList}

Output strictly in JSON format (do not use markdown blocks):
{
  "recommendations": [
    {
      "topicId": "<id of chosen topic>",
      "reason": "<One short sentence explaining why this is the logical next step>"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text);

    // Attach titles to the response by looking up the candidates
    const finalRecs = (parsed.recommendations || []).map((rec) => {
      const found = candidates.find(c => c._id.toString() === rec.topicId);
      return {
        _id: rec.topicId,
        title: found ? found.title : 'Recommended Topic',
        reason: rec.reason
      };
    }).filter(r => r.title !== 'Recommended Topic').slice(0, 3); // Ensure exactly 3

    await incrementUsage(req.user.id, 'aiRecommendations');
    res.json({ recommendations: finalRecs });
  } catch (error) {
    console.error('AI Topic Recommendation Error:', error);
    res.status(500).json({ message: 'Failed to recommend next topics.', error: error.message });
  }
};

// ===== NEW AI FEATURES (Topper Tier) =====

// Feature 1: AI Answer Improver — Generates a model answer for comparison
exports.improveAnswer = async (req, res) => {
  try {
    const { answerId } = req.body;
    const answer = await Answer.findById(answerId).populate('pyqId');
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });

    const pyq = answer.pyqId;
    const wordLimit = pyq.wordLimit || 150;

    const prompt = `
    You are an expert UPSC Civil Services Mains examiner and top-rank answer writer.

    Question: ${pyq.question}
    Directive: ${pyq.directive || 'Discuss'}
    Year: ${pyq.year}
    Marks: ${pyq.marks || 10}
    Word Limit: ${wordLimit}

    Student's Answer:
    "${answer.content}"

    Your tasks:
    1. Write an IDEAL model answer for this question within ${wordLimit} words. This should be a top-rank quality answer with proper introduction, structured body with subheadings, relevant examples/data/committees/articles, and a forward-looking conclusion.
    2. List 5 key points/facts/keywords the student missed in their answer.
    3. List important keywords, constitutional articles, committee names, or data points that should be included.

    Output strictly in JSON format:
    {
      "modelAnswer": "<The complete model answer text with proper structure>",
      "missedPoints": ["<point 1>", "<point 2>", "<point 3>", "<point 4>", "<point 5>"],
      "keywordsToInclude": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    await incrementUsage(req.user.id, 'aiAnswerEvaluations');
    res.json(result);
  } catch (error) {
    console.error('AI Improve Answer Error:', error);
    res.status(500).json({ message: 'Failed to generate model answer.', error: error.message });
  }
};

// Feature 2: AI Current Affairs UPSC Mapper
exports.analyzeCurrentAffair = async (req, res) => {
  try {
    const { articleId, title, summary } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });

    let articleTitle = title || '';
    let articleContent = summary || '';

    if (articleId) {
      const article = await CurrentAffair.findById(articleId);
      if (article) {
        articleTitle = article.title || articleTitle;
        articleContent = article.content || article.summary || articleContent;
      }
    }

    if (!articleTitle && !articleContent) {
      return res.status(400).json({ message: 'Article title or content is required.' });
    }

    const prompt = `
    You are an expert UPSC Current Affairs analyst. Analyze the following news article for UPSC Civil Services Examination relevance.

    Title: "${articleTitle}"
    Content: "${articleContent.substring(0, 2000)}"

    Provide a comprehensive UPSC-oriented analysis:
    1. Rate UPSC relevance from 1-10
    2. Map to specific GS Paper(s) and syllabus topic(s)
    3. Write a concise mains-ready note (60-80 words) that an aspirant can directly use in answers
    4. Generate a probable Mains question from this news
    5. Extract 5 key facts/data points to remember

    Output strictly in JSON format:
    {
      "relevanceScore": <1-10>,
      "gsPaper": "<GS I / GS II / GS III / GS IV or multiple>",
      "topicMapping": "<Specific syllabus topic this maps to>",
      "mainsNote": "<60-80 word mains-ready note>",
      "probableQuestion": "<A probable UPSC Mains question from this news>",
      "keyFacts": ["<fact 1>", "<fact 2>", "<fact 3>", "<fact 4>", "<fact 5>"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    await incrementUsage(req.user.id, 'aiTopicSummaries');
    res.json(result);
  } catch (error) {
    console.error('AI Current Affair Analysis Error:', error);
    res.status(500).json({ message: 'Failed to analyze current affair.', error: error.message });
  }
};

// Feature 3: AI Weakness Analyzer
exports.analyzeWeaknesses = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });

    const userId = req.user.id;
    const UserTopicProgress = require('../models/UserTopicProgress');
    const Quiz = require('../models/Quiz');

    // Aggregate user data
    const completedProgress = await UserTopicProgress.find({ userId, completed: true }).populate('topicId', 'title paper chapter subjectName');
    const pendingProgress = await UserTopicProgress.find({ userId, completed: false }).populate('topicId', 'title paper chapter subjectName');
    const recentAnswers = await Answer.find({ userId }).sort({ createdAt: -1 }).limit(10).populate('pyqId', 'question subject');
    const recentQuizzes = await Quiz.find({ userId }).sort({ createdAt: -1 }).limit(10);

    const completedTopics = completedProgress.filter(p => p.topicId).map(p => `${p.topicId.title} (${p.topicId.paper || 'GS'})`);
    const pendingTopics = pendingProgress.filter(p => p.topicId).map(p => `${p.topicId.title} (${p.topicId.paper || 'GS'})`);

    const answerScores = recentAnswers.map(a => ({
      question: a.pyqId?.question?.substring(0, 80) || 'Unknown',
      score: a.score || 0,
      maxScore: 10
    }));

    const quizScores = recentQuizzes.map(q => ({
      score: q.score || 0,
      total: q.totalQuestions || 5,
      percentage: q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : 0
    }));

    const prompt = `
    You are a UPSC preparation coach. Analyze this aspirant's data and identify their weak areas.

    COMPLETED TOPICS (${completedTopics.length}): ${completedTopics.slice(0, 20).join(', ') || 'None yet'}
    PENDING TOPICS (${pendingTopics.length}): ${pendingTopics.slice(0, 20).join(', ') || 'None'}
    
    RECENT ANSWER SCORES: ${JSON.stringify(answerScores)}
    RECENT QUIZ SCORES: ${JSON.stringify(quizScores)}

    Based on this data:
    1. Identify their top 5 weak areas (subjects/topics needing attention)
    2. For each weak area, explain WHY it's weak and assign a priority
    3. Recommend what to focus on this week
    4. Give an overall exam readiness assessment

    Output strictly in JSON format:
    {
      "weakAreas": [
        { "topic": "<topic/subject name>", "reason": "<why this is weak>", "priority": "<High/Medium/Low>" }
      ],
      "weeklyFocus": "<2-3 sentence recommendation for this week>",
      "overallReadiness": "<1-2 sentence honest assessment of exam readiness>",
      "completionRate": "${completedTopics.length} of ${completedTopics.length + pendingTopics.length} topics"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    await incrementUsage(req.user.id, 'aiRecommendations');
    res.json(result);
  } catch (error) {
    console.error('AI Weakness Analysis Error:', error);
    res.status(500).json({ message: 'Failed to analyze weaknesses.', error: error.message });
  }
};

// Feature 4: AI Interlinkage Generator
exports.generateInterlinkages = async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!topicId) return res.status(400).json({ message: 'topicId is required' });

    const topic = await Topic.findById(topicId).populate('subjectId');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });

    const subjectName = topic.subjectId?.name || topic.paper || 'General Studies';

    const prompt = `
    You are an expert UPSC mentor specializing in multi-dimensional answer writing.
    
    Topic: "${topic.title}"
    Subject/Paper: "${subjectName}"
    Chapter: "${topic.chapter || 'General'}"

    Generate cross-paper interlinkages showing how this topic connects across the entire UPSC syllabus. For each GS paper, Optional, Ethics, and Current Affairs, explain the specific connection and its exam relevance.

    Output strictly in JSON format:
    {
      "interlinkages": [
        { "paper": "GS I (History, Society, Geography)", "connection": "<How this topic connects to GS I>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<A specific angle for mains answer>" },
        { "paper": "GS II (Polity, Governance, IR)", "connection": "<How this topic connects to GS II>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<A specific angle>" },
        { "paper": "GS III (Economy, Environment, S&T)", "connection": "<How this topic connects to GS III>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<A specific angle>" },
        { "paper": "GS IV (Ethics, Integrity)", "connection": "<How this topic connects to Ethics>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<An ethical dimension>" },
        { "paper": "Essay", "connection": "<How this topic can be used in essays>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<Essay theme suggestion>" },
        { "paper": "Current Affairs", "connection": "<Recent news/developments related to this topic>", "examRelevance": "<High/Medium/Low>", "sampleAngle": "<Current affair connection>" }
      ],
      "topperTip": "<One practical tip on how toppers use interlinkages in their answers>"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    await incrementUsage(req.user.id, 'aiTopicSummaries');
    res.json(result);
  } catch (error) {
    console.error('AI Interlinkage Error:', error);
    res.status(500).json({ message: 'Failed to generate interlinkages.', error: error.message });
  }
};

// Feature 5: AI Smart Planner
exports.generateSmartPlan = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY is not set.' });

    const userId = req.user.id;
    const user = await require('../models/User').findById(userId);
    const UserTopicProgress = require('../models/UserTopicProgress');
    const Revision = require('../models/Revision');

    const dailyHours = user?.dailyTargetHours || 10;
    const optionalSubject = user?.optionalSubject || 'Sociology';

    // Aggregate progress data
    const allProgress = await UserTopicProgress.find({ userId }).populate('topicId', 'title paper chapter subjectName');
    const completedCount = allProgress.filter(p => p.completed).length;
    const pendingCount = allProgress.filter(p => !p.completed).length;

    const pendingByPaper = {};
    allProgress.filter(p => !p.completed && p.topicId).forEach(p => {
      const paper = p.topicId.paper || 'GS';
      pendingByPaper[paper] = (pendingByPaper[paper] || 0) + 1;
    });

    // Pending revisions
    const pendingRevisions = await Revision.countDocuments({ userId, status: 'Pending', scheduledDate: { $lte: new Date() } });

    const prompt = `
    You are a UPSC preparation strategist. Create a personalized 7-day study plan for this aspirant.

    ASPIRANT PROFILE:
    - Daily study hours: ${dailyHours}
    - Optional Subject: ${optionalSubject}
    - Topics Completed: ${completedCount}
    - Topics Remaining: ${pendingCount}
    - Pending Revisions: ${pendingRevisions}
    - Paper-wise Pending: ${JSON.stringify(pendingByPaper)}

    Create a balanced 7-day plan covering GS papers, Optional, Current Affairs, Answer Writing, and Revision. Each day should have morning, afternoon, and evening blocks.

    Output strictly in JSON format:
    {
      "weeklyPlan": [
        {
          "day": "Day 1 (Monday)",
          "morning": "<What to study in morning session>",
          "afternoon": "<Afternoon session plan>",
          "evening": "<Evening session plan>",
          "revision": "<What to revise>"
        }
      ],
      "focusAreas": ["<Top 3 areas to prioritize this week>"],
      "motivationalNote": "<A short encouraging message for the aspirant>"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    await incrementUsage(req.user.id, 'aiRecommendations');
    res.json(result);
  } catch (error) {
    console.error('AI Smart Plan Error:', error);
    res.status(500).json({ message: 'Failed to generate smart plan.', error: error.message });
  }
};

