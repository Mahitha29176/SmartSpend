const ApiError = require('../utils/ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'];
const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

// Never trust the frontend's validation alone -- every one of these runs
// again here before a query touches the database.

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !name.trim()) return next(new ApiError(400, 'Name is required'));
  if (!email || !EMAIL_RE.test(email)) return next(new ApiError(400, 'A valid email is required'));
  if (!password || password.length < 8) return next(new ApiError(400, 'Password must be at least 8 characters'));
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return next(new ApiError(400, 'Email and password are required'));
  next();
}

function validateExpense(req, res, next) {
  const { amount, category, expense_date, payment_method } = req.body;
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return next(new ApiError(400, 'Amount must be a positive number'));
  }
  if (!category || !CATEGORIES.includes(category)) {
    return next(new ApiError(400, `Category must be one of: ${CATEGORIES.join(', ')}`));
  }
  if (!expense_date || isNaN(Date.parse(expense_date))) {
    return next(new ApiError(400, 'A valid expense_date is required'));
  }
  if (!payment_method || !PAYMENT_METHODS.includes(payment_method)) {
    return next(new ApiError(400, `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`));
  }
  if (req.body.description && req.body.description.length > 255) {
    return next(new ApiError(400, 'Description must be under 255 characters'));
  }
  next();
}

function validateBudget(req, res, next) {
  const { category, amount, month, year } = req.body;
  if (!category || !CATEGORIES.includes(category)) {
    return next(new ApiError(400, `Category must be one of: ${CATEGORIES.join(', ')}`));
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return next(new ApiError(400, 'Amount must be a positive number'));
  }
  if (!month || month < 1 || month > 12) return next(new ApiError(400, 'Month must be between 1 and 12'));
  if (!year || year < 2000) return next(new ApiError(400, 'A valid year is required'));
  next();
}

function validateRecurring(req, res, next) {
  const { amount, category, frequency, start_date } = req.body;
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return next(new ApiError(400, 'Amount must be a positive number'));
  }
  if (!category || !CATEGORIES.includes(category)) {
    return next(new ApiError(400, `Category must be one of: ${CATEGORIES.join(', ')}`));
  }
  if (!frequency || !FREQUENCIES.includes(frequency)) {
    return next(new ApiError(400, `Frequency must be one of: ${FREQUENCIES.join(', ')}`));
  }
  if (!start_date || isNaN(Date.parse(start_date))) {
    return next(new ApiError(400, 'A valid start_date is required'));
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateExpense,
  validateBudget,
  validateRecurring,
  CATEGORIES,
  PAYMENT_METHODS,
  FREQUENCIES,
};
