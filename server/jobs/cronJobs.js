const cron = require('node-cron');
const Question = require('../models/Question');
const { generateMoreContent } = require('../services/contentGenerator');

function initCronJobs() {
  console.log('🕒 Initializing cron jobs...');

  // Run on the 1st of every month at midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('🔄 Running monthly content check...');
    
    const games = ['truth', 'dare', 'wyr', 'quiz', 'personalqa'];
    const modes = ['sweet', 'playful', 'mysterious', 'deeptalk'];

    for (const game of games) {
      for (const mode of modes) {
        try {
          const count = await Question.countDocuments({ game, mode, coupleId: null });
          // If we have fewer than 100 global questions for this combo, generate more
          if (count < 100) {
            console.log(`⚠️ Pool low for [${game}] - [${mode}] (${count} items). Generating more...`);
            await generateMoreContent(game, mode);
            
            // Artificial delay to prevent rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } catch (error) {
          console.error(`Error checking content count for ${game}-${mode}:`, error);
        }
      }
    }
    console.log('✅ Monthly content check complete.');
  });
}

module.exports = { initCronJobs };
