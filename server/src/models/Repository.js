import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    defaultBranch: { type: String, default: 'main' },
    languages: { type: Map, of: Number, default: {} },
    topics: [{ type: String }],
    htmlUrl: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    lastAnalyzedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Repository = mongoose.model('Repository', repositorySchema);
