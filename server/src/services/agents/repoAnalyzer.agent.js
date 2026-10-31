import { BaseAgent } from './base.agent.js';
import { Analysis } from '../../models/Analysis.js';
import { Repository } from '../../models/Repository.js';
import { aiService } from '../ai.service.js';

export class RepoAnalyzerAgent extends BaseAgent {
  constructor(sessionId, repositoryId, githubService, eventEmitter) {
    super('RepoAnalyzerAgent', sessionId, repositoryId, eventEmitter);
    this.githubService = githubService;

    this.registerTool('fetch_git_tree', 'Recursively retrieves repository directory tree', async ({ owner, repo, branch }) => {
      return await this.githubService.getRepoTree(owner, repo, branch);
    });

    this.registerTool('read_manifest_files', 'Extracts package.json, requirements.txt, or docker files', async ({ owner, repo, tree, branch }) => {
      const manifests = {};
      const targetFiles = [
        'package.json',
        'requirements.txt',
        'go.mod',
        'Cargo.toml',
        'Dockerfile',
        'docker-compose.yml',
        'tsconfig.json',
        'vite.config.js'
      ];

      for (const item of tree) {
        const fileName = item.path.split('/').pop();
        if (targetFiles.includes(fileName)) {
          try {
            const content = await this.githubService.getFileContent(owner, repo, item.path, branch);
            manifests[item.path] = content.slice(0, 3000);
          } catch (e) {
            // non-fatal
          }
        }
      }
      return manifests;
    });

    this.registerTool('synthesize_architecture', 'Invokes AI model to analyze architectural patterns', async (params) => {
      return await aiService.analyzeArchitecture(params);
    });
  }

  async run({ owner, repo, branch = 'main' }) {
    await this.log('thinking', `Starting project structure analysis for ${owner}/${repo}...`);

    // 1. Fetch Repository Record
    const repository = await Repository.findById(this.repositoryId);
    if (!repository) {
      throw new Error(`Repository record not found: ${this.repositoryId}`);
    }

    // 2. Fetch Git Tree
    await this.log('thinking', 'Querying GitHub git tree recursively...');
    const rawTree = await this.executeTool('fetch_git_tree', { owner, repo, branch });
    await this.log('thinking', `Discovered ${rawTree.length} paths in repository tree.`);

    // Categorize importance of tree files
    const fileTree = rawTree.map(item => {
      const ext = item.path.split('.').pop().toLowerCase();
      let importance = 'standard';
      if (item.type === 'dir') importance = 'standard';
      else if (/(package\.json|dockerfile|requirements|tsconfig|env)/i.test(item.path)) importance = 'config';
      else if (/(test|spec|__tests__)/i.test(item.path)) importance = 'test';
      else if (/(readme|contributing|license|\.md)/i.test(item.path)) importance = 'doc';
      else if (/(index|main|app|server)/i.test(item.path)) importance = 'core';
      else if (/(png|jpg|svg|ico|gif)/i.test(item.path)) importance = 'asset';

      return {
        path: item.path,
        type: item.type,
        size: item.size,
        extension: ext,
        importance
      };
    });

    // 3. Inspect Manifests
    await this.log('thinking', 'Inspecting package and configuration manifests...');
    const configFiles = await this.executeTool('read_manifest_files', { owner, repo, tree: rawTree, branch });

    // 4. Synthesize Architecture via AI
    await this.log('thinking', 'Synthesizing architecture overview and tech stack with AI model...');
    const architectureData = await this.executeTool('synthesize_architecture', {
      repoDetails: repository,
      tree: fileTree,
      configFiles
    });

    // 5. Upsert Analysis in MongoDB
    await this.log('thinking', 'Saving complete analysis and architectural diagram mapping to database...');
    let analysis = await Analysis.findOne({ repositoryId: this.repositoryId });
    if (!analysis) {
      analysis = new Analysis({
        repositoryId: this.repositoryId,
        ...architectureData,
        fileTree
      });
    } else {
      Object.assign(analysis, architectureData, { fileTree });
    }
    await analysis.save();

    // Update repository last analyzed timestamp
    repository.lastAnalyzedAt = new Date();
    await repository.save();

    await this.log('completed', `Architecture analysis completed successfully for ${owner}/${repo}!`, {
      totalFiles: fileTree.length,
      architectureType: analysis.architectureType,
      techStackCount: analysis.techStack.length
    });

    return analysis;
  }
}
