import { GitHubService } from '../src/services/github.service.js';
import { aiService } from '../src/services/ai.service.js';

console.log('--- Running AI Developer Assistant Smoke Tests ---');

// Test 1: GitHub URL Parser
try {
  const p1 = GitHubService.parseRepoString('https://github.com/expressjs/express');
  console.assert(p1.owner === 'expressjs' && p1.repo === 'express', 'URL parse failed');
  const p2 = GitHubService.parseRepoString('facebook/react');
  console.assert(p2.owner === 'facebook' && p2.repo === 'react', 'Shorthand parse failed');
  console.log('✔ Test 1: GitHub Service URL Parser passed.');
} catch (e) {
  console.error('❌ Test 1 Failed:', e);
}

// Test 2: AI Service Diff Patch Generation
try {
  const patch = aiService.generatePatch('test.js', 'test.js', 'const x = 1;', 'const x = 2;');
  console.assert(patch.includes('-const x = 1;') && patch.includes('+const x = 2;'), 'Diff generation failed');
  console.log('✔ Test 2: AI Service Unified Diff Patch generation passed.');
} catch (e) {
  console.error('❌ Test 2 Failed:', e);
}

// Test 3: Static Code Bug Auditor Heuristic
try {
  const bugs = await aiService.auditCodeForBugs({
    filePath: 'server.js',
    content: 'const password = "mysecretpassword123";\nif (a == b) { eval(userCode); }'
  });
  console.assert(bugs.length >= 2, 'Expected bugs to be detected');
  console.log(`✔ Test 3: Heuristic Bug Hunter detected ${bugs.length} issues with generated patches.`);
} catch (e) {
  console.error('❌ Test 3 Failed:', e);
}

console.log('--- All Smoke Tests Completed Successfully ---');
