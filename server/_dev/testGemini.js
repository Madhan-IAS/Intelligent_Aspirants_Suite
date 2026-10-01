require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log("Calling Gemini...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Hi, respond with a JSON array containing one object with a 'hello' key.",
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log("Response Text:", response.text);
        console.log("Response Type:", typeof response.text);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testGemini();
