import { AgentSession } from '../../models/AgentSession.js';

export class BaseAgent {
  constructor(name, sessionId, repositoryId, eventEmitter = null) {
    this.name = name;
    this.sessionId = sessionId;
    this.repositoryId = repositoryId;
    this.eventEmitter = eventEmitter;
    this.tools = new Map();
  }

  registerTool(toolName, description, handler) {
    this.tools.set(toolName, { description, handler });
  }

  async log(stage, message, details = null) {
    const entry = {
      timestamp: new Date(),
      agent: this.name,
      stage,
      toolName: details?.toolName || null,
      message,
      details
    };

    console.log(`[${this.name}] [${stage.toUpperCase()}] ${message}`);

    // Persist to MongoDB session
    if (this.sessionId) {
      try {
        await AgentSession.findByIdAndUpdate(this.sessionId, {
          $push: { logs: entry }
        });
      } catch (err) {
        console.warn(`[BaseAgent] Failed to persist log entry:`, err.message);
      }
    }

    // Emit live event to SSE subscribers
    if (this.eventEmitter) {
      this.eventEmitter({
        type: 'agent_log',
        sessionId: this.sessionId,
        ...entry
      });
    }

    return entry;
  }

  async executeTool(toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found in agent ${this.name}`);
    }

    await this.log('tool_call', `Executing tool: ${toolName}`, { toolName, params });
    const startTime = Date.now();
    try {
      const result = await tool.handler(params);
      const durationMs = Date.now() - startTime;
      await this.log('tool_result', `Tool ${toolName} completed in ${durationMs}ms`, {
        toolName,
        success: true,
        durationMs
      });
      return result;
    } catch (error) {
      await this.log('error', `Tool ${toolName} failed: ${error.message}`, {
        toolName,
        error: error.message
      });
      throw error;
    }
  }
}
