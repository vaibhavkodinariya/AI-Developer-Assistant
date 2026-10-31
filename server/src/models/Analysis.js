import mongoose from 'mongoose';

const fileNodeSchema = new mongoose.Schema({
  path: { type: String, required: true },
  type: { type: String, enum: ['file', 'dir'], required: true },
  size: { type: Number, default: 0 },
  extension: { type: String, default: '' },
  importance: { type: String, enum: ['core', 'config', 'test', 'doc', 'asset', 'standard'], default: 'standard' }
}, { _id: false });

const analysisSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    techStack: [{
      category: { type: String }, // e.g., 'Runtime', 'Framework', 'Database', 'Styling'
      name: { type: String },
      version: { type: String, default: '' }
    }],
    architectureType: { type: String, default: 'Layered Modular' }, // e.g. 'MVC', 'Client-Server', 'Microservice', 'Monorepo'
    summary: { type: String, default: '' },
    entryPoints: [{ type: String }],
    keyComponents: [{
      name: { type: String },
      path: { type: String },
      role: { type: String }
    }],
    metrics: {
      totalFiles: { type: Number, default: 0 },
      codeFiles: { type: Number, default: 0 },
      estimatedLinesOfCode: { type: Number, default: 0 },
      dependenciesCount: { type: Number, default: 0 }
    },
    fileTree: [fileNodeSchema]
  },
  { timestamps: true }
);

export const Analysis = mongoose.model('Analysis', analysisSchema);
