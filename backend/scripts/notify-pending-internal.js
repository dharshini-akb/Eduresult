require('dotenv').config();
const mongoose = require('mongoose');
const MarkBatchStatus = require('../models/MarkBatchStatus');
require('../models/Subject');
const { notifyHeadsInternalSubmitted } = require('../utils/notifyUtils');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const batches = await MarkBatchStatus.find({
    internalSubmitted: true,
    headNotified: { $ne: true },
  }).populate('subjectId');

  for (const b of batches) {
    if (b.subjectId) {
      await notifyHeadsInternalSubmitted(b.subjectId, b.semester, { name: 'Teacher' });
    }
    b.headNotified = true;
    await b.save();
  }

  console.log(`Sent notifications for ${batches.length} subject(s)`);
  process.exit(0);
});
