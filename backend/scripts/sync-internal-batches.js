require('dotenv').config();
const mongoose = require('mongoose');
const Result = require('../models/Result');
const Subject = require('../models/Subject');
const MarkBatchStatus = require('../models/MarkBatchStatus');
const { recalculateResult, ensureInternalSubmitted } = require('../utils/markWorkflowUtils');
const { getDepartmentQuery } = require('../utils/departmentUtils');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const results = await Result.find({});
  for (const r of results) {
    recalculateResult(r);
    await r.save();
  }
  console.log(`Updated ${results.length} results (internalStatus + grades)`);

  const subjects = await Subject.find({});
  for (const sub of subjects) {
    const sem = sub.semester;
    const query = {
      semester: sem,
      department: { $in: getDepartmentQuery(sub.department) },
    };
    const { batch, allInternalComplete } = await ensureInternalSubmitted(sub, sem, query, {
      notify: false,
    });
    if (allInternalComplete) {
      console.log(`✓ ${sub.subjectName} (Sem ${sem}) — internal ready`);
    }
  }

  const pending = await MarkBatchStatus.find({ internalSubmitted: true, published: false });
  console.log(`\n${pending.length} subject(s) awaiting external marks / publish`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
