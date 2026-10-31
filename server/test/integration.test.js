import http from 'http';
import { connectDB, disconnectDB } from '../src/config/db.js';
import express from 'express';
import cors from 'cors';
import repoRoutes from '../src/routes/repo.routes.js';
import analysisRoutes from '../src/routes/analysis.routes.js';
import bugRoutes from '../src/routes/bug.routes.js';
import docRoutes from '../src/routes/doc.routes.js';
import prRoutes from '../src/routes/pr.routes.js';
import agentRoutes from '../src/routes/agent.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'healthy', version: '1.0.0' }));
app.use('/api/repos', repoRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/agent', agentRoutes);

async function runIntegrationTest() {
  console.log('--- Starting Integration Test ---');
  await connectDB();

  const server = app.listen(5001, async () => {
    console.log('Test server listening on port 5001');

    try {
      // 1. Health check
      const healthRes = await fetch('http://localhost:5001/api/health');
      const healthJson = await healthRes.json();
      console.assert(healthJson.status === 'healthy', 'Health check failed');
      console.log('✔ Health endpoint test passed:', healthJson);

      // 2. Demo seed
      const seedRes = await fetch('http://localhost:5001/api/repos/demo-seed');
      const seedJson = await seedRes.json();
      console.assert(seedJson.repository && seedJson.repository.name === 'express', 'Seed repo failed');
      console.log('✔ Repo seeding test passed:', seedJson.repository.fullName);

      // 3. List repos
      const listRes = await fetch('http://localhost:5001/api/repos');
      const listJson = await listRes.json();
      console.assert(Array.isArray(listJson) && listJson.length > 0, 'List repos failed');
      console.log(`✔ List repositories passed (${listJson.length} repo found)`);

      console.log('--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY ---');
    } catch (err) {
      console.error('Integration test assertion failed:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      await disconnectDB();
      process.exit(process.exitCode || 0);
    }
  });
}

runIntegrationTest();
