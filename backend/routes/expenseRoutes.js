const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const requireAuth = require('../middleware/auth');
const { validateExpense } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', expenseController.list);
router.get('/:id', expenseController.getOne);
router.post('/', validateExpense, expenseController.create);
router.put('/:id', validateExpense, expenseController.update);
router.delete('/:id', expenseController.remove);

module.exports = router;
