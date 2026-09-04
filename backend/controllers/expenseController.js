const expenseService = require('../services/expenseService');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const expenses = await expenseService.list(req.user.id, req.query);
    success(res, { expenses });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const expense = await expenseService.getById(req.user.id, req.params.id);
    success(res, { expense });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const expense = await expenseService.create(req.user.id, req.body);
    success(res, { expense }, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const expense = await expenseService.update(req.user.id, req.params.id, req.body);
    success(res, { expense });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await expenseService.remove(req.user.id, req.params.id);
    success(res, { message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
