const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const requireAuth = require('../middleware/auth');
const { validateBudget } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', budgetController.list);
router.post('/', validateBudget, budgetController.create);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.remove);

module.exports = router;
