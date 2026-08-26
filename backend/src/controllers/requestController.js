const {
  ServiceRequest,
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  PRIORITY_WEIGHTS,
} = require('../models/ServiceRequest');
const User = require('../models/User');

// @desc    Create a new service request
// @route   POST /api/requests
// @access  Private (Authenticated User)
const createRequest = async (req, res, next) => {
  try {
    const { title, description, category, priority = 'Medium' } = req.body;

    const newRequest = await ServiceRequest.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      priorityWeight: PRIORITY_WEIGHTS[priority] || 2,
      status: 'Open', // Forced to Open for newly created requests
      createdBy: req.user._id, // Enforced from authenticated JWT
    });

    const populatedRequest = await ServiceRequest.findById(newRequest._id).populate(
      'createdBy',
      'name email role'
    );

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service requests with search, filter, and sort
// @route   GET /api/requests
// @access  Private (Employee sees own, Admin sees all)
const getRequests = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const baseFilter = {};

    // 1. Role-based scoping
    if (req.user.role === 'employee') {
      baseFilter.createdBy = req.user._id;
    }

    // 2. Exact Filters
    if (status && STATUSES.includes(status)) {
      baseFilter.status = status;
    }

    if (priority && PRIORITIES.includes(priority)) {
      baseFilter.priority = priority;
    }

    if (category && CATEGORIES.includes(category)) {
      baseFilter.category = category;
    }

    // 3. Search handling (by title or requester name)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');

      if (req.user.role === 'admin') {
        // Admins can search by title OR employee name
        const matchingUsers = await User.find({ name: searchRegex }).select('_id');
        const userIds = matchingUsers.map((u) => u._id);

        baseFilter.$or = [
          { title: searchRegex },
          { createdBy: { $in: userIds } },
        ];
      } else {
        // Employees can search by their own request title
        baseFilter.title = searchRegex;
      }
    }

    // 4. Sorting logic
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    let sortOptions = {};

    if (sortBy === 'priority') {
      // Sort by numerical weight for accurate hierarchy (High > Medium > Low)
      sortOptions.priorityWeight = sortOrder;
      sortOptions.createdAt = -1;
    } else if (['createdAt', 'updatedAt', 'title', 'status', 'category'].includes(sortBy)) {
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    // 5. Execute query
    const requests = await ServiceRequest.find(baseFilter)
      .populate('createdBy', 'name email role')
      .sort(sortOptions);

    // 6. Compute statistics scoped to current role view
    const statsFilter = req.user.role === 'employee' ? { createdBy: req.user._id } : {};
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      ServiceRequest.countDocuments(statsFilter),
      ServiceRequest.countDocuments({ ...statsFilter, status: 'Open' }),
      ServiceRequest.countDocuments({ ...statsFilter, status: 'In Progress' }),
      ServiceRequest.countDocuments({ ...statsFilter, status: 'Resolved' }),
      ServiceRequest.countDocuments({ ...statsFilter, status: 'Closed' }),
    ]);

    return res.status(200).json({
      success: true,
      count: requests.length,
      stats: {
        total,
        open,
        inProgress,
        resolved,
        closed,
      },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service request by ID
// @route   GET /api/requests/:id
// @access  Private (Employee sees own, Admin sees any)
const getRequestById = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Service request not found with ID ${req.params.id}`,
      });
    }

    // Check ownership if employee
    if (
      req.user.role === 'employee' &&
      request.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own service requests.',
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request
// @route   PUT /api/requests/:id
// @access  Private (Employee updates own permitted fields; Admin updates any)
const updateRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Service request not found with ID ${req.params.id}`,
      });
    }

    // Check ownership if employee
    const isOwner = request.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own service requests.',
      });
    }

    const { title, description, category, priority, status } = req.body;

    // Disallow employee from updating status
    if (!isAdmin && status !== undefined && status !== request.status) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only administrators can change request status.',
      });
    }

    if (title !== undefined) request.title = title.trim();
    if (description !== undefined) request.description = description.trim();
    if (category !== undefined) request.category = category;
    if (priority !== undefined) {
      request.priority = priority;
      request.priorityWeight = PRIORITY_WEIGHTS[priority] || 2;
    }
    if (isAdmin && status !== undefined) {
      request.status = status;
    }

    await request.save();

    const updatedRequest = await ServiceRequest.findById(request._id).populate(
      'createdBy',
      'name email role'
    );

    return res.status(200).json({
      success: true,
      message: 'Service request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service request
// @route   DELETE /api/requests/:id
// @access  Private (Admin Only)
const deleteRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Service request not found with ID ${req.params.id}`,
      });
    }

    // Authorization check (redundant with route middleware, but ensures defense-in-depth)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete service requests.',
      });
    }

    await ServiceRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Service request deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
};
