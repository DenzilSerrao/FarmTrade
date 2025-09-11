import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        'general',
        'technical',
        'billing',
        'account',
        'bug_report',
        'feature_request',
      ],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    responses: [
      {
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        responderId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
messageSchema.index({ userId: 1, status: 1 });
messageSchema.index({ category: 1, status: 1 });
messageSchema.index({ priority: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

export default model('Message', messageSchema);
