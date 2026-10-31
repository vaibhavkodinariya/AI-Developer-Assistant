import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'medium',
      index: true
    },
    category: {
      type: String,
      enum: ['security', 'logic', 'performance', 'error_handling', 'concurrency', 'syntax', 'best_practice'],
      default: 'logic'
    },
    filePath: { type: String, required: true },
    lineStart: { type: Number, default: 1 },
    lineEnd: { type: Number, default: 1 },
    description: { type: String, required: true },
    codeSnippet: { type: String, default: '' },
    suggestedFix: { type: String, default: '' },
    diffPatch: { type: String, default: '' },
    explanation: { type: String, default: '' },
    status: {
      type: String,
      enum: ['detected', 'fix_drafted', 'pr_created', 'ignored'],
      default: 'detected'
    }
  },
  { timestamps: true }
);

export const BugReport = mongoose.model('BugReport', bugReportSchema);
