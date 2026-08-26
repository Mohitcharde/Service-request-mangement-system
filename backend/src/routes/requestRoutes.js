const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateCreateRequest,
  validateUpdateRequest,
} = require('../validators/requestValidator');

// All request routes require valid authentication
router.use(authenticate);

router
  .route('/')
  .post(validateCreateRequest, createRequest)
  .get(getRequests);

router
  .route('/:id')
  .get(getRequestById)
  .put(validateUpdateRequest, updateRequest)
  .delete(authorize('admin'), deleteRequest);

module.exports = router;
