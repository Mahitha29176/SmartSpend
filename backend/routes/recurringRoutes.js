const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const requireAuth = require('../middleware/auth');
const { validateRecurring } = require('../middleware/validate');

router.use(requireAuth);

router.get('/', recurringController.list);
router.post('/', validateRecurring, recurringController.create);
router.put('/:id', validateRecurring, recurringController.update);
router.delete('/:id', recurringController.remove);

module.exports = router;
