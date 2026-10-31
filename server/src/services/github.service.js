import { Octokit } from '@octokit/rest';
import { config } from '../config/env.js';

export class GitHubService {
  constructor(customToken = null) {
    const token = customToken || config.githubToken;
    this.octokit = new Octokit({
      auth: token || undefined,
      userAgent: 'AI-Developer-Assistant/1.0.0'
    });
  }

  static parseRepoString(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid repository input');
    }

    const cleanInput = input.trim().replace(/\/+$/, '');

    // Pattern 1: https://github.com/owner/repo or git@github.com:owner/repo
    const urlMatch = cleanInput.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?/i);
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2] };
    }

    // Pattern 2: owner/repo
    const parts = cleanInput.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/i, '') };
    }

    throw new Error(`Cannot parse GitHub repository from "${input}". Expected format: owner/repo or https://github.com/owner/repo`);
  }

  async getRepoDetails(owner, repo) {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      
      let languages = {};
      try {
        const langRes = await this.octokit.repos.listLanguages({ owner, repo });
        languages = langRes.data || {};
      } catch (err) {
        console.warn(`[GitHub] Could not fetch languages for ${owner}/${repo}:`, err.message);
      }

      return {
        owner: data.owner.login,
        name: data.name,
        fullName: data.full_name,
        description: data.description || '',
        stars: data.stargazers_count,
        forks: data.forks_count,
        defaultBranch: data.default_branch || 'main',
        htmlUrl: data.html_url,
        isPrivate: data.private,
        topics: data.topics || [],
        languages
      };
    } catch (error) {
      console.error(`[GitHub] Error fetching repo details for ${owner}/${repo}:`, error.message);
      throw new Error(`GitHub API Error: ${error.message}`);
    }
  }

  async getRepoTree(owner, repo, branch = 'main') {
    try {
      // 1. Get branch commit sha
      const branchRef = await this.octokit.repos.getBranch({
        owner,
        repo,
        branch
      });
      const commitSha = branchRef.data.commit.sha;

      // 2. Fetch recursive git tree
      const { data } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: commitSha,
        recursive: '1'
      });

      // Filter out git internals and huge binary assets
      const items = (data.tree || []).filter(item => {
        if (!item.path) return false;
        if (item.path.startsWith('.git/')) return false;
        if (item.path.includes('node_modules/') || item.path.includes('vendor/')) return false;
        return true;
      });

      return items.map(item => ({
        path: item.path,
        type: item.type === 'tree' ? 'dir' : 'file',
        size: item.size || 0,
        sha: item.sha
      }));
    } catch (error) {
      console.error(`[GitHub] Error getting git tree for ${owner}/${repo}@${branch}:`, error.message);
      throw error;
    }
  }

  async getFileContent(owner, repo, path, branch = 'main') {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      if (Array.isArray(data)) {
        throw new Error(`Path ${path} is a directory, not a file.`);
      }

      if (data.encoding === 'base64' && data.content) {
        const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
        return decoded;
      }

      if (data.download_url) {
        const response = await fetch(data.download_url);
        return await response.text();
      }

      return data.content || '';
    } catch (error) {
      console.error(`[GitHub] Error fetching file content for ${owner}/${repo}/${path}:`, error.message);
      throw error;
    }
  }

  async createBranch(owner, repo, newBranch, baseBranch = 'main') {
    try {
      // Get base branch sha
      const { data: baseRef } = await this.octokit.repos.getBranch({
        owner,
        repo,
        branch: baseBranch
      });
      const sha = baseRef.commit.sha;

      // Create new reference
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${newBranch}`,
        sha
      });

      return { success: true, branch: newBranch, sha };
    } catch (error) {
      console.error(`[GitHub] Error creating branch ${newBranch}:`, error.message);
      throw error;
    }
  }

  async createOrUpdateFile(owner, repo, path, content, message, branch) {
    try {
      let sha = null;
      try {
        const { data: existing } = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        if (existing && !Array.isArray(existing)) {
          sha = existing.sha;
        }
      } catch (e) {
        // File doesn't exist yet, proceed with sha = null
      }

      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        branch,
        sha: sha || undefined
      });

      return data;
    } catch (error) {
      console.error(`[GitHub] Error committing file ${path} on branch ${branch}:`, error.message);
      throw error;
    }
  }

  async createPullRequest(owner, repo, title, body, head, base = 'main') {
    try {
      const { data } = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base
      });

      return {
        number: data.number,
        htmlUrl: data.html_url,
        state: data.state,
        title: data.title
      };
    } catch (error) {
      console.error(`[GitHub] Error creating PR on ${owner}/${repo}:`, error.message);
      throw error;
    }
  }
}
