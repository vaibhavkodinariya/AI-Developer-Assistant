import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    type: {
      type: String,
      enum: ['readme', 'api_reference', 'architecture', 'contributing'],
      default: 'readme',
      index: true
    },
    title: { type: String, required: true },
    targetPath: { type: String, default: 'README.md' },
    markdownContent: { type: String, required: true },
    sections: [{
      title: { type: String },
      content: { type: String }
    }],
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Documentation = mongoose.model('Documentation', documentationSchema);
