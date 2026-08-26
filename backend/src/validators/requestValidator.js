const { CATEGORIES, PRIORITIES, STATUSES } = require('../models/ServiceRequest');

const validateCreateRequest = (req, res, next) => {
  const { title, description, category, priority } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title is required and must be at least 3 characters.' });
  } else if (title.trim().length > 150) {
    errors.push({ field: 'title', message: 'Title cannot exceed 150 characters.' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.push({ field: 'description', message: 'Description is required and must be at least 5 characters.' });
  } else if (description.trim().length > 3000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 3000 characters.' });
  }

  if (!category || !CATEGORIES.includes(category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  if (priority && !PRIORITIES.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${PRIORITIES.join(', ')}`,
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateUpdateRequest = (req, res, next) => {
  const { title, description, category, priority, status } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters long.' });
    } else if (title.trim().length > 150) {
      errors.push({ field: 'title', message: 'Title cannot exceed 150 characters.' });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 5) {
      errors.push({ field: 'description', message: 'Description must be at least 5 characters long.' });
    } else if (description.trim().length > 3000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 3000 characters.' });
    }
  }

  if (category !== undefined && !CATEGORIES.includes(category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${PRIORITIES.join(', ')}`,
    });
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${STATUSES.join(', ')}`,
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateCreateRequest,
  validateUpdateRequest,
};
