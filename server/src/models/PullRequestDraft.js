import mongoose from 'mongoose';

const pullRequestDraftSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    title: { type: String, required: true },
    branchName: { type: String, required: true },
    baseBranch: { type: String, default: 'main' },
    body: { type: String, required: true },
    changes: [{
      filePath: { type: String, required: true },
      action: { type: String, enum: ['modify', 'create', 'delete'], default: 'modify' },
      content: { type: String, required: true },
      diffPatch: { type: String, default: '' }
    }],
    relatedBugIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BugReport' }],
    status: {
      type: String,
      enum: ['draft', 'submitting', 'created_on_github', 'failed'],
      default: 'draft'
    },
    githubPrNumber: { type: Number, default: null },
    githubPrUrl: { type: String, default: null },
    errorMessage: { type: String, default: null }
  },
  { timestamps: true }
);

export const PullRequestDraft = mongoose.model('PullRequestDraft', pullRequestDraftSchema);
