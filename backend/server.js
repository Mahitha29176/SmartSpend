require('dotenv').config();
const app = require('./app');
const recurringService = require('./services/recurringService');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`SmartSpend API running on http://localhost:${PORT}`);

  // Catch up any recurring expenses that were due while the server was down,
  // then re-check once a day. In a real deployment this would be a proper
  // cron job (e.g. node-cron or an OS-level cron hitting an endpoint).
  try {
    const processed = await recurringService.processDueRecurring();
    if (processed > 0) console.log(`Processed ${processed} due recurring expense(s).`);
  } catch (err) {
    console.error('Failed to process recurring expenses on startup:', err.message);
  }

  setInterval(async () => {
    try {
      await recurringService.processDueRecurring();
    } catch (err) {
      console.error('Recurring expense processing failed:', err.message);
    }
  }, 24 * 60 * 60 * 1000);
});
