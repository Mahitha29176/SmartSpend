const recurringService = require('../services/recurringService');
const { success } = require('../utils/response');

async function list(req, res, next) {
  try {
    const recurring = await recurringService.list(req.user.id);
    success(res, { recurring });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const recurring = await recurringService.create(req.user.id, req.body);
    success(res, { recurring }, 201);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const recurring = await recurringService.update(req.user.id, req.params.id, req.body);
    success(res, { recurring });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await recurringService.remove(req.user.id, req.params.id);
    success(res, { message: 'Recurring expense deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
