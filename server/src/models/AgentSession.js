import mongoose from 'mongoose';

const agentLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  agent: { type: String, required: true }, // e.g., 'RepoAnalyzerAgent', 'BugHunterAgent', 'DocGeneratorAgent', 'PRDrafterAgent'
  stage: { type: String, default: 'thinking' }, // 'thinking', 'tool_call', 'tool_result', 'completed', 'error'
  toolName: { type: String, default: null },
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const agentSessionSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    taskType: {
      type: String,
      enum: ['full_analysis', 'bug_hunt', 'generate_docs', 'draft_pr'],
      required: true
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running'
    },
    logs: [agentLogSchema],
    resultSummary: { type: String, default: '' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const AgentSession = mongoose.model('AgentSession', agentSessionSchema);
