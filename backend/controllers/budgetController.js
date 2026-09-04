const budgetService = require('../services/budgetService');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const { month, year } = req.query;
    const budgets = await budgetService.list(req.user.id, Number(month), Number(year));
    success(res, { budgets });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const budget = await budgetService.create(req.user.id, req.body);
    success(res, { budget }, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body);
    success(res, { budget });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await budgetService.remove(req.user.id, req.params.id);
    success(res, { message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
