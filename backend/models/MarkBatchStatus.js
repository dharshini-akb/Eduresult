const mongoose = require('mongoose');

const markBatchStatusSchema = mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    semester: { type: Number, required: true },
    internalSubmitted: { type: Boolean, default: false },
    internalSubmittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internalSubmittedAt: Date,
    headNotified: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: Date,
  },
  { timestamps: true }
);

markBatchStatusSchema.index({ subjectId: 1, semester: 1 }, { unique: true });

const MarkBatchStatus = mongoose.model('MarkBatchStatus', markBatchStatusSchema);

module.exports = MarkBatchStatus;
