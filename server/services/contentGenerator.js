const { GoogleGenAI, Type, Schema } = require('@google/genai');
const Question = require('../models/Question');
require('dotenv').config();

// The generator handles creating new content when a pool runs low.
// Ensure GEMINI_API_KEY is in your environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMoreContent(game, mode) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found. Skipping content generation.');
    return;
  }

  console.log(`🤖 Triggering AI content generation for [${game}] in mode [${mode}]...`);

  try {
    let schema;
    let prompt;

    // Define the expected output format based on the game
    if (game === 'wyr') {
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            optionA: { type: Type.STRING },
            optionB: { type: Type.STRING }
          },
          required: ["optionA", "optionB"]
        }
      };
      prompt = `Generate 10 "Would You Rather" scenarios for a couple. The tone should be "${mode}". 
      Keep it warm, witty, and flirty. No explicit or graphic content.`;
    } else if (game === 'quiz') {
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            choices: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER }
          },
          required: ["text", "choices", "correctAnswer"]
        }
      };
      prompt = `Generate 10 trivia/memory questions for a couple to test how well they know each other. 
      The tone should be "${mode}". Four choices each, correctAnswer is the index (0-3). No explicit content.`;
    } else {
      // Truth or dare, personal QA
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING }
          },
          required: ["text"]
        }
      };
      prompt = `Generate 10 creative prompts for the game "${game}" for a couple. The tone should be "${mode}". 
      Make them warm, thoughtful, and flirty. No explicit content.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const newItems = JSON.parse(response.text);

    // Insert into DB
    const questionsToInsert = newItems.map(item => ({
      game,
      mode,
      coupleId: null, // Global pool
      ...item
    }));

    await Question.insertMany(questionsToInsert);
    console.log(`✅ Successfully generated and inserted ${questionsToInsert.length} new items for [${game}] - [${mode}].`);

  } catch (error) {
    console.error(`❌ Failed to generate content for [${game}] - [${mode}]:`, error);
  }
}

module.exports = {
  generateMoreContent
};
