import { BaseAgent } from './base.agent.js';
import { BugReport } from '../../models/BugReport.js';
import { Analysis } from '../../models/Analysis.js';
import { aiService } from '../ai.service.js';

export class BugHunterAgent extends BaseAgent {
  constructor(sessionId, repositoryId, githubService, eventEmitter) {
    super('BugHunterAgent', sessionId, repositoryId, eventEmitter);
    this.githubService = githubService;

    this.registerTool('fetch_source_file', 'Fetches file content from GitHub', async ({ owner, repo, path, branch }) => {
      return await this.githubService.getFileContent(owner, repo, path, branch);
    });

    this.registerTool('audit_file_for_bugs', 'Evaluates code for security vulnerabilities, concurrency flaws, and logic bugs', async ({ filePath, content }) => {
      return await aiService.auditCodeForBugs({ filePath, content });
    });
  }

  async run({ owner, repo, branch = 'main', maxFiles = 6 }) {
    await this.log('thinking', `Initiating autonomous security and bug hunt for ${owner}/${repo}...`);

    // 1. Retrieve Analysis to find candidate files
    const analysis = await Analysis.findOne({ repositoryId: this.repositoryId });
    if (!analysis || !analysis.fileTree) {
      throw new Error('Analysis must be run before bug hunting.');
    }

    // Select candidate code files for analysis
    const candidateFiles = analysis.fileTree
      .filter(f => f.type === 'file' && /\.(js|ts|jsx|tsx|py|go|rb|php)$/i.test(f.path))
      .filter(f => !f.path.includes('.test.') && !f.path.includes('.spec.') && !f.path.includes('min.js'))
      .sort((a, b) => {
        // Prioritize core entry files and controllers
        const score = (p) => {
          if (/(index|app|server|main)/i.test(p)) return 10;
          if (/(auth|security|db|api|controller|service)/i.test(p)) return 8;
          return 5;
        };
        return score(b.path) - score(a.path);
      })
      .slice(0, maxFiles);

    await this.log('thinking', `Selected ${candidateFiles.length} candidate source files for deep AST & security inspection.`);

    const foundBugs = [];

    // Clear old un-drafted bugs for fresh run
    await BugReport.deleteMany({ repositoryId: this.repositoryId, status: 'detected' });

    for (const file of candidateFiles) {
      await this.log('thinking', `Auditing "${file.path}" for logic flaws, vulnerabilities, and edge cases...`);

      let fileContent = '';
      try {
        fileContent = await this.executeTool('fetch_source_file', { owner, repo, path: file.path, branch });
      } catch (err) {
        await this.log('error', `Could not fetch "${file.path}": ${err.message}`);
        continue;
      }

      if (!fileContent || fileContent.trim().length === 0) continue;

      const bugs = await this.executeTool('audit_file_for_bugs', {
        filePath: file.path,
        content: fileContent
      });

      if (bugs && bugs.length > 0) {
        for (const bug of bugs) {
          const bugDoc = new BugReport({
            repositoryId: this.repositoryId,
            title: bug.title,
            severity: bug.severity || 'medium',
            category: bug.category || 'logic',
            filePath: file.path,
            lineStart: bug.lineStart || 1,
            lineEnd: bug.lineEnd || bug.lineStart || 1,
            description: bug.description,
            codeSnippet: bug.codeSnippet || '',
            suggestedFix: bug.suggestedFix || '',
            diffPatch: bug.diffPatch || '',
            explanation: bug.explanation || '',
            status: 'detected'
          });
          await bugDoc.save();
          foundBugs.push(bugDoc);
        }
        await this.log('thinking', `Found ${bugs.length} potential issue(s) in "${file.path}" with generated diff fix suggestions.`);
      }
    }

    await this.log('completed', `Bug hunt finished. Identified ${foundBugs.length} total issue(s) across codebase.`, {
      totalIssuesFound: foundBugs.length,
      critical: foundBugs.filter(b => b.severity === 'critical').length,
      high: foundBugs.filter(b => b.severity === 'high').length
    });

    return foundBugs;
  }
}
