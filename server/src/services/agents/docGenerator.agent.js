import { BaseAgent } from './base.agent.js';
import { Documentation } from '../../models/Documentation.js';
import { Repository } from '../../models/Repository.js';
import { Analysis } from '../../models/Analysis.js';
import { aiService } from '../ai.service.js';

export class DocGeneratorAgent extends BaseAgent {
  constructor(sessionId, repositoryId, githubService, eventEmitter) {
    super('DocGeneratorAgent', sessionId, repositoryId, eventEmitter);
    this.githubService = githubService;

    this.registerTool('synthesize_documentation', 'Generates clean developer markdown using AI technical writer', async (params) => {
      return await aiService.generateDocs(params);
    });
  }

  async run({ docType = 'readme', targetPath = 'README.md' }) {
    await this.log('thinking', `Initiating documentation generation for type: "${docType}"...`);

    const repository = await Repository.findById(this.repositoryId);
    const analysis = await Analysis.findOne({ repositoryId: this.repositoryId });

    if (!repository || !analysis) {
      throw new Error('Repository and Analysis are required prior to generating documentation.');
    }

    await this.log('thinking', `Compiling architecture metadata and dependency statistics for "${repository.fullName}"...`);

    const markdown = await this.executeTool('synthesize_documentation', {
      repoDetails: repository,
      analysis,
      type: docType
    });

    // Derive document title
    const docTitles = {
      readme: 'Project Readme & Developer Guide',
      api_reference: 'REST API & Interface Reference',
      architecture: 'System Architecture Specification',
      contributing: 'Contribution Guidelines & Code of Conduct'
    };
    const title = docTitles[docType] || 'Generated Documentation';

    // Upsert documentation record
    let doc = await Documentation.findOne({ repositoryId: this.repositoryId, type: docType });
    if (!doc) {
      doc = new Documentation({
        repositoryId: this.repositoryId,
        type: docType,
        title,
        targetPath,
        markdownContent: markdown
      });
    } else {
      doc.markdownContent = markdown;
      doc.version += 1;
    }
    await doc.save();

    await this.log('completed', `Documentation for "${title}" successfully generated and saved!`, {
      docId: doc._id,
      docType,
      charCount: markdown.length
    });

    return doc;
  }
}
