const BASE_URL = '/api';

export const api = {
  // Repositories
  async ingestRepo(repoUrl, token = '') {
    const res = await fetch(`${BASE_URL}/repos/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, token })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to ingest repository');
    }
    return res.json();
  },

  async listRepos() {
    const res = await fetch(`${BASE_URL}/repos`);
    if (!res.ok) throw new Error('Failed to load repositories');
    return res.json();
  },

  async getRepo(id) {
    const res = await fetch(`${BASE_URL}/repos/${id}`);
    if (!res.ok) throw new Error('Failed to get repository details');
    return res.json();
  },

  async getFileContent(repoId, path) {
    const res = await fetch(`${BASE_URL}/repos/${repoId}/file?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error('Failed to fetch file content');
    return res.json();
  },

  async seedDemo() {
    const res = await fetch(`${BASE_URL}/repos/demo-seed`);
    if (!res.ok) throw new Error('Failed to seed demo repo');
    return res.json();
  },

  // Analysis
  async getAnalysis(repoId) {
    const res = await fetch(`${BASE_URL}/analysis/${repoId}`);
    if (!res.ok) return null;
    return res.json();
  },

  async triggerAnalysis(repoId, token = '') {
    const res = await fetch(`${BASE_URL}/analysis/${repoId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!res.ok) throw new Error('Failed to trigger analysis');
    return res.json();
  },

  // Bug Hunter
  async getBugs(repoId) {
    const res = await fetch(`${BASE_URL}/bugs/${repoId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async triggerBugScan(repoId, token = '') {
    const res = await fetch(`${BASE_URL}/bugs/${repoId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!res.ok) throw new Error('Failed to scan for bugs');
    return res.json();
  },

  async updateBugStatus(id, status) {
    const res = await fetch(`${BASE_URL}/bugs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update bug status');
    return res.json();
  },

  // Documentation
  async getDocs(repoId) {
    const res = await fetch(`${BASE_URL}/docs/${repoId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async generateDoc(repoId, type, token = '') {
    const res = await fetch(`${BASE_URL}/docs/${repoId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, token })
    });
    if (!res.ok) throw new Error('Failed to generate documentation');
    return res.json();
  },

  async updateDoc(id, data) {
    const res = await fetch(`${BASE_URL}/docs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update documentation');
    return res.json();
  },

  // Pull Requests
  async getPRs(repoId) {
    const res = await fetch(`${BASE_URL}/prs/${repoId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async createPRDraft(repoId, payload) {
    const res = await fetch(`${BASE_URL}/prs/${repoId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create PR draft');
    }
    return res.json();
  },

  // Agent Sessions
  async getSessions(repoId) {
    const res = await fetch(`${BASE_URL}/agent/sessions/${repoId}`);
    if (!res.ok) return [];
    return res.json();
  }
};
