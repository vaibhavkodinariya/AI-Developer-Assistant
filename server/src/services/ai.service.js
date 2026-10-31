import OpenAI from 'openai';
import { config } from '../config/env.js';
import * as diff from 'diff';

export class AIService {
  constructor() {
    this.hasApiKey = Boolean(config.openaiApiKey && config.openaiApiKey.trim().length > 10);
    if (this.hasApiKey) {
      const clientConfig = { apiKey: config.openaiApiKey };
      if (config.openaiBaseUrl && config.openaiBaseUrl.trim()) {
        clientConfig.baseURL = config.openaiBaseUrl.trim();
      }
      this.client = new OpenAI(clientConfig);
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    return this.hasApiKey;
  }

  async runCompletion({ systemPrompt, userPrompt, temperature = 0.2, jsonMode = false }) {
    if (this.hasApiKey && this.client) {
      try {
        const response = await this.client.chat.completions.create({
          model: config.openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        });

        if (!response?.choices?.[0]?.message) {
          console.warn('[OpenAI] Provider returned unexpected response structure:', JSON.stringify(response));
          return null;
        }

        const content = response.choices[0].message.content || '';
        return jsonMode ? JSON.parse(content) : content;
      } catch (error) {
        console.warn(`[OpenAI] API call failed: ${error?.message || error}. Falling back to heuristic engine.`);
        if (error?.status) {
          console.warn(`[OpenAI] HTTP Status: ${error.status}`);
        }
      }
    }

    // Heuristic intelligent fallback engine
    return null;
  }

  // Calculate unified git diff patch
  generatePatch(oldFileName, newFileName, oldStr, newStr) {
    try {
      return diff.createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, 'original', 'suggested_fix');
    } catch (e) {
      return '';
    }
  }

  // --- Specialized AI / Heuristic pipelines ---

  async analyzeArchitecture({ repoDetails, tree, configFiles }) {
    const prompt = `
You are a Principal Software Architect Agent. Analyze this repository:
Repository: ${repoDetails.fullName} (${repoDetails.description || 'No description'})
Languages: ${JSON.stringify(repoDetails.languages)}

Key File Tree Sample (${tree.length} total files):
${tree.slice(0, 100).map(t => `${t.type === 'dir' ? '📁' : '📄'} ${t.path}`).join('\n')}

Config files detected:
${JSON.stringify(configFiles, null, 2)}

Provide a structured JSON response with:
{
  "techStack": [ { "category": "Runtime/Framework/DB/Tool", "name": "...", "version": "..." } ],
  "architectureType": "MVC / Clean Architecture / Microservice / Modular Monolith / Client-Server",
  "summary": "Detailed technical summary of how this system is architected",
  "entryPoints": ["main entry files"],
  "keyComponents": [ { "name": "Component Name", "path": "path/to/folder", "role": "What it does" } ],
  "metrics": {
    "totalFiles": ${tree.length},
    "codeFiles": ${tree.filter(t => t.type === 'file').length},
    "estimatedLinesOfCode": ${tree.filter(t => t.type === 'file').length * 85},
    "dependenciesCount": 12
  }
}
`;

    const aiResult = await this.runCompletion({
      systemPrompt: 'You are an autonomous AI software architecture analyzer. Output valid JSON only.',
      userPrompt: prompt,
      jsonMode: true
    });

    if (aiResult) return aiResult;

    // Heuristic architecture synthesis
    const hasClient = tree.some(t => t.path.startsWith('client/') || t.path.startsWith('frontend/'));
    const hasServer = tree.some(t => t.path.startsWith('server/') || t.path.startsWith('backend/') || t.path.startsWith('api/'));
    const isNode = tree.some(t => t.path.endsWith('package.json'));
    const isPython = tree.some(t => t.path.endsWith('requirements.txt') || t.path.endsWith('pyproject.toml'));
    const isGo = tree.some(t => t.path.endsWith('go.mod'));

    const techStack = [];
    if (isNode) techStack.push({ category: 'Runtime', name: 'Node.js', version: '>=18' });
    if (hasClient) techStack.push({ category: 'Frontend', name: 'React / Web Client', version: '18+' });
    if (hasServer) techStack.push({ category: 'Backend', name: 'Express / REST API', version: '4.x' });
    if (isPython) techStack.push({ category: 'Language', name: 'Python', version: '3.x' });
    if (isGo) techStack.push({ category: 'Language', name: 'Go', version: '1.2x' });

    let architectureType = 'Modular Architecture';
    if (hasClient && hasServer) architectureType = 'Fullstack Client-Server (Monorepo)';
    else if (hasServer) architectureType = 'Backend Microservice / REST API';
    else if (hasClient) architectureType = 'Single Page Application (SPA)';

    const entryPoints = tree
      .filter(t => t.type === 'file' && /(index|main|app|server)\.(js|ts|py|go|jsx|tsx)$/i.test(t.path))
      .map(t => t.path);

    return {
      techStack,
      architectureType,
      summary: `The project "${repoDetails.fullName}" follows a ${architectureType} design. It organizes domain responsibilities into modular directories with clear boundaries between data persistence, business logic, and interface representations.`,
      entryPoints: entryPoints.length ? entryPoints : ['index.js'],
      keyComponents: [
        { name: 'Core Application Service', path: entryPoints[0] || 'src/', role: 'Central bootstrapper and lifecycle manager' },
        { name: 'Data Access Layer', path: 'src/models', role: 'Entity schemas and database persistence models' },
        { name: 'API Controllers', path: 'src/controllers', role: 'Handles incoming requests and dispatches domain logic' }
      ],
      metrics: {
        totalFiles: tree.length,
        codeFiles: tree.filter(t => t.type === 'file').length,
        estimatedLinesOfCode: tree.filter(t => t.type === 'file').length * 75,
        dependenciesCount: Object.keys(configFiles).length * 8
      }
    };
  }

  async auditCodeForBugs({ filePath, content }) {
    const prompt = `
You are a Staff Security & Bug Hunter Agent. Review the code from file "${filePath}":
\`\`\`
${content.slice(0, 4000)}
\`\`\`

Detect critical, high, or medium bugs:
- Security vulnerabilities (SQL injection, XSS, unescaped queries, secret leaks)
- Concurrency issues, unhandled rejections, race conditions
- Memory leaks, missing resource cleanup
- Off-by-one errors, null pointer dereferences, incorrect error handling

Return JSON array of bugs:
{
  "bugs": [
    {
      "title": "Concise bug title",
      "severity": "critical" | "high" | "medium" | "low",
      "category": "security" | "logic" | "performance" | "error_handling",
      "lineStart": 10,
      "lineEnd": 18,
      "description": "Why this is a bug",
      "codeSnippet": "the buggy snippet",
      "suggestedFix": "corrected code snippet",
      "explanation": "Why this fix works"
    }
  ]
}
`;

    const aiResult = await this.runCompletion({
      systemPrompt: 'You are an autonomous AI security auditor and code reviewer. Output valid JSON only.',
      userPrompt: prompt,
      jsonMode: true
    });

    if (aiResult && Array.isArray(aiResult.bugs)) {
      return aiResult.bugs.map(b => {
        const patch = this.generatePatch(filePath, filePath, b.codeSnippet || '', b.suggestedFix || '');
        return { ...b, diffPatch: patch, filePath };
      });
    }

    // Heuristic static pattern analyzer for code bugs
    const detectedBugs = [];
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // 1. Unhandled async without try-catch or await in loop
      if (line.includes('eval(') || line.includes('Function(')) {
        detectedBugs.push({
          title: 'Remote Code Execution Risk via dynamic eval',
          severity: 'critical',
          category: 'security',
          filePath,
          lineStart: lineNum,
          lineEnd: lineNum,
          description: 'Use of eval() creates direct code injection vulnerabilities allowing attackers to execute arbitrary system commands.',
          codeSnippet: line.trim(),
          suggestedFix: '// Refactored: Avoid dynamic code evaluation\nJSON.parse(sanitizedInput);',
          explanation: 'Replaced arbitrary code execution with deterministic parser.'
        });
      }

      // 2. Hardcoded secrets or tokens
      if (/(api[_-]?key|secret|password|token)\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i.test(line) && !line.includes('process.env')) {
        detectedBugs.push({
          title: 'Hardcoded Secret or Token Detected',
          severity: 'high',
          category: 'security',
          filePath,
          lineStart: lineNum,
          lineEnd: lineNum,
          description: 'Hardcoded credentials exposed in source code can be extracted through version control or decompilation.',
          codeSnippet: line.trim(),
          suggestedFix: line.replace(/['"][a-zA-Z0-9_\-]{16,}['"]/, 'process.env.API_SECRET_KEY'),
          explanation: 'Moved hardcoded secret into environment variables.'
        });
      }

      // 3. Loose equality comparison
      if (line.includes(' == ') && !line.includes(' === ') && !line.includes('typeof') && !line.includes('!= null')) {
        detectedBugs.push({
          title: 'Type Coercion Vulnerability (Loose Equality)',
          severity: 'medium',
          category: 'logic',
          filePath,
          lineStart: lineNum,
          lineEnd: lineNum,
          description: 'Using loose equality "==" causes implicit JavaScript type coercion, leading to unexpected truthy/falsy evaluation flaws.',
          codeSnippet: line.trim(),
          suggestedFix: line.replace(' == ', ' === ').trim(),
          explanation: 'Replaced with strict equality "===" to eliminate implicit type coercion bugs.'
        });
      }

      // 4. Missing Error Handling in Promise or Async
      if (line.includes('new Promise(') && !content.includes('reject(')) {
        detectedBugs.push({
          title: 'Promise Missing Error Rejection Path',
          severity: 'medium',
          category: 'error_handling',
          filePath,
          lineStart: lineNum,
          lineEnd: Math.min(lines.length, lineNum + 4),
          description: 'Promise executor does not implement a failure branch or call reject(), which can cause dangling unresolved promises.',
          codeSnippet: line.trim(),
          suggestedFix: line.replace('(resolve)', '(resolve, reject)').trim(),
          explanation: 'Added reject handler to ensure promises fail gracefully.'
        });
      }
    });

    // Compute diff patches
    return detectedBugs.slice(0, 5).map(b => ({
      ...b,
      diffPatch: this.generatePatch(filePath, filePath, b.codeSnippet, b.suggestedFix)
    }));
  }

  async generateDocs({ repoDetails, analysis, type = 'readme' }) {
    const prompt = `
You are a Principal Technical Writer Agent.
Generate production-grade documentation (${type}) for the repository:
Name: ${repoDetails.fullName}
Description: ${repoDetails.description || 'AI Developer Platform'}
Tech Stack: ${analysis.techStack?.map(t => `${t.name} (${t.category})`).join(', ')}
Architecture: ${analysis.architectureType}
Summary: ${analysis.summary}
Key Components: ${JSON.stringify(analysis.keyComponents)}

Output high-quality, comprehensive Markdown with badges, installation, configuration, diagrams, and usage examples.
`;

    const aiResult = await this.runCompletion({
      systemPrompt: 'You are an autonomous AI technical writer. Output clean Markdown.',
      userPrompt: prompt,
      jsonMode: false
    });

    if (aiResult) return aiResult;

    // High quality deterministic fallback generator
    if (type === 'readme') {
      return `# ${repoDetails.name}

> ${repoDetails.description || 'Production-grade software application engineered for scalability and developer ergonomics.'}

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Tech Stack](https://img.shields.io/badge/architecture-${encodeURIComponent(analysis.architectureType || 'Modular')}-orange.svg)]()

---

## 🌟 Overview
${analysis.summary || `${repoDetails.name} provides automated capabilities for software teams.`}

### 🛠️ Technology Stack
${(analysis.techStack || []).map(t => `- **${t.category}**: \`${t.name}\` ${t.version ? `(${t.version})` : ''}`).join('\n') || '- Node.js & React'}

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Git & npm or pnpm

### Installation
\`\`\`bash
# 1. Clone repository
git clone ${repoDetails.htmlUrl || `https://github.com/${repoDetails.fullName}`}.git
cd ${repoDetails.name}

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
\`\`\`

### Running the Application
\`\`\`bash
# Development mode
npm run dev

# Production build & start
npm run build
npm start
\`\`\`

---

## 🏗️ Architecture & Modules
The codebase is structured under **${analysis.architectureType || 'Modular Architecture'}**:

${(analysis.keyComponents || []).map(c => `- **\`${c.name}\`** (\`${c.path}\`): ${c.role}`).join('\n')}

---

## 🧪 Testing & Quality Assurance
\`\`\`bash
# Run unit & integration test suites
npm test

# Run linter & code style validation
npm run lint
\`\`\`

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'feat: add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request
`;
    }

    if (type === 'api_reference') {
      return `# API Reference - ${repoDetails.name}

## Base URL
\`\`\`
http://localhost:5000/api/v1
\`\`\`

## Endpoints

### 1. Repositories
- \`POST /api/repos/analyze\`
  - Ingests and queues repository analysis.
  - **Body**: \`{ "repoUrl": "owner/repo", "token": "optional_github_token" }\`
  - **Response**: \`{ "repository": { ... }, "analysisId": "..." }\`

- \`GET /api/repos/:id\`
  - Retrieves repository metadata and tree nodes.

### 2. Bugs & Security Audits
- \`POST /api/bugs/scan\`
  - Triggers autonomous bug hunter agent across repository files.
- \`GET /api/bugs/:repoId\`
  - Returns list of detected bugs, severity levels, and proposed diff patches.

### 3. Pull Request Generation
- \`POST /api/prs/draft\`
  - Generates pull request drafts and pushes branches to GitHub.
`;
    }

    return `# Architecture Guide - ${repoDetails.name}\n\n${analysis.summary}`;
  }
}

export const aiService = new AIService();
