const mongoose = require('mongoose');

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const PRIORITY_WEIGHTS = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4, // Extensible for future priority expansion
};

const serviceRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Request description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters long'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: PRIORITIES,
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    priorityWeight: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy user reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically compute priorityWeight for fast database sorting
serviceRequestSchema.pre('save', function (next) {
  if (this.isModified('priority') || this.priorityWeight === undefined) {
    this.priorityWeight = PRIORITY_WEIGHTS[this.priority] || 2;
  }
  next();
});

// Indexing for search, filtering, and sorting performance
serviceRequestSchema.index({ title: 'text' });
serviceRequestSchema.index({ status: 1, priorityWeight: -1, createdAt: -1 });
serviceRequestSchema.index({ createdBy: 1, createdAt: -1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = {
  ServiceRequest,
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  PRIORITY_WEIGHTS,
};
