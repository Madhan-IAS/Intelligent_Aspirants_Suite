/**
 * Seed Indian Society Syllabus Exactly As Is
 * Run: node seedSocietyAsIs.js
 */
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

const RAW_SOCIETY_TEXT = `
INDIAN SOCIETY
  Salient features of Indian society
 Features of Indian society 
 Changes within Indian society and   
their repercussions
 Causes of changes 
 Indian Society today 
 Diversity of India
 What is diversity? 
 Types of diversities in India 
 Can diversity be equated with   
difference?
 The unity in diversity- a reality or a   
chimera
 Manner of reconciliation 
 Role of women’s organizations
 Women’s organizations in Indian   
history
 Types of women’s organizations 
 Level of penetration 
 Problems faced by women’s   
organizations
 Is a larger vocal role possible and   
ways to achieve the same
 Role of SHGs, Micro finance   
Institutions
  Poverty and Development Issues
 Poverty 
 Concept of development 
 Sen vs Bhagwati model 
 Crisis of development 
 Certain case studies 
 Government’s initiatives and the   
five year plans
 Role of civil society organizations 
 Effects of globalization on Indian 
society
 What is the meaning of globalization 
 Kinds of impact of globalization –   
economic, political, developmental and 
socio-cultural
 Is the impact solely positive or   
negative
 Social empowerment
 Meaning and concept of social   
empowerment
 Why do we need social empowerment? 
 Social empowerment through the five   
year plans
 Government’s initiatives for   
empowerment
 Empowerment in reality and India’s   
experience
 Other approaches/players/tools for   
social empowerment and some case  
studies on the same
 Communalism
 Meaning and concept of communalism 
 Historicity of communalism 
 Recent incidents 
 Role of third parties in inciting/  
perpetrating communalism
 Communalism under the law 
 Can communalism eradicated from   
the Indian society completely
INDIAN SOCIETY
www.iasscore.in
Secularism
Meaning and concept of secularism 

Secularism through the vantage point   
of Indian Constitution
Comparisons of models Indian &  
Western
Gandhiji on religion 
Indian philosophy on secularism 
Threats on the secular spirit 
Is the Indian democracy mature  
enough to handle the gravity of  
secularism 
 
CONTEMPORARY ISSUES
UPSC SYLLABUS 2024-25
29
Regionalism
Meaning and concept of regionalism 
Theories on regionalism 
Regionalism in its various  
manifestations
Role of various players 
Recent incidents causing a wave of  
flurry
Possible ways to tackle the same
`;

async function main() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find GS I Subject
    const subject = await Subject.findOne({ name: 'GS I' });
    if (!subject) {
      console.error('❌ Subject GS I not found.');
      process.exit(1);
    }

    console.log('Asking Gemini to clean up split lines and list all society subtopics as a JSON array of strings...');
    const ai = new GoogleGenAI({});
    const prompt = `
    Here is a raw text list of UPSC Indian Society topics.
    Some lines have been split across lines during copy-pasting (e.g. "Changes within Indian society and" and then "their repercussions" should be "Changes within Indian society and their repercussions").
    Also, remove headers/footers like "INDIAN SOCIETY www.iasscore.in" and "UPSC SYLLABUS 2024-25 29".
    Do not summarize, do not skip, and do not omit any single subtopic. Keep all of them!
    Return a JSON array of strings, where each string is a complete topic or subtopic from the list.

    Raw Text:
    ${RAW_SOCIETY_TEXT}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const topicsArray = JSON.parse(response.text);
    console.log(`Gemini cleaned up ${topicsArray.length} total Indian Society topics.`);

    const topicsToInsert = topicsArray.map(title => ({
      title: title.trim(),
      tags: ["Society"],
      difficulty: "Medium",
      subjectId: subject._id,
      status: 'Pending',
      notes: {
        theory: '',
        definitions: '',
        examples: '',
        caseStudies: '',
        statistics: '',
        committeeReports: '',
        supremeCourtCases: '',
        governmentSchemes: '',
        wayForward: '',
        diagrams: '',
        mindMaps: '',
        currentAffairs: '',
        pyqs: '',
        valueAddition: ''
      }
    }));

    const inserted = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Successfully appended all ${inserted.length} Indian Society topics exactly as is!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
