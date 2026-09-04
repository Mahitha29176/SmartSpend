const dashboardService = require('../services/dashboardService');
const insightsService = require('../services/insightsService');
const { success } = require('../utils/response');

async function summary(req, res, next) {
  try {
    const data = await dashboardService.summary(req.user.id);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

async function categorySummary(req, res, next) {
  try {
    const categories = await dashboardService.categorySummary(req.user.id);
    success(res, { categories });
  } catch (err) {
    next(err);
  }
}

async function monthlySummary(req, res, next) {
  try {
    const months = await dashboardService.monthlySummary(req.user.id);
    success(res, { months });
  } catch (err) {
    next(err);
  }
}

async function insights(req, res, next) {
  try {
    const messages = await insightsService.insights(req.user.id);
    success(res, { insights: messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, categorySummary, monthlySummary, insights };
