import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.local',
  '.config',
  '.upm',
  'dist',
  '.expo',
  '.replit',
  'replit.nix',
  '.breakpoints',
  '*.log',
  'generated-icon.png',
  'snippets'
];

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split('/');
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (filePath.endsWith(ext)) return true;
    } else {
      if (parts.includes(pattern)) return true;
    }
  }
  return false;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative('.', fullPath);
    
    if (shouldIgnore(relativePath)) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(relativePath);
    }
  }

  return arrayOfFiles;
}

async function main() {
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  
  const repoName = 'SpyGuard';
  
  let repoExists = false;
  let isEmpty = false;
  
  try {
    await octokit.repos.get({ owner: user.login, repo: repoName });
    repoExists = true;
    console.log(`Repository ${repoName} already exists`);
    
    try {
      await octokit.repos.getBranch({ owner: user.login, repo: repoName, branch: 'main' });
    } catch (e: any) {
      if (e.status === 404) {
        isEmpty = true;
        console.log('Repository is empty, will initialize...');
      }
    }
  } catch (e: any) {
    if (e.status !== 404) throw e;
  }
  
  if (!repoExists) {
    console.log(`Creating repository ${repoName}...`);
    await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'SpyGuard - Anti-Hacking & Spyware Detector Mobile App',
      private: false,
      auto_init: true
    });
    console.log('Repository created with README!');
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else if (isEmpty) {
    console.log('Initializing empty repository with README...');
    await octokit.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: repoName,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# SpyGuard\n\nAnti-Hacking & Spyware Detector Mobile App').toString('base64')
    });
    console.log('README created!');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('Getting main branch ref...');
  const { data: ref } = await octokit.git.getRef({
    owner: user.login,
    repo: repoName,
    ref: 'heads/main'
  });
  const baseSha = ref.object.sha;
  console.log(`Base commit SHA: ${baseSha}`);
  
  console.log('Collecting files...');
  const files = getAllFiles('.');
  console.log(`Found ${files.length} files to upload`);
  
  const blobs: { path: string; sha: string; mode: string; type: string }[] = [];
  
  for (const filePath of files) {
    const content = fs.readFileSync(filePath);
    const isBinary = filePath.match(/\.(png|jpg|jpeg|gif|ico|mp3|wav|ogg|ttf|otf|woff|woff2|eot|pdf)$/i);
    
    process.stdout.write(`Uploading: ${filePath}... `);
    
    const { data: blob } = await octokit.git.createBlob({
      owner: user.login,
      repo: repoName,
      content: content.toString(isBinary ? 'base64' : 'utf8'),
      encoding: isBinary ? 'base64' : 'utf-8'
    });
    
    console.log('done');
    
    blobs.push({
      path: filePath,
      sha: blob.sha,
      mode: '100644',
      type: 'blob'
    });
  }
  
  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: user.login,
    repo: repoName,
    base_tree: baseSha,
    tree: blobs as any
  });
  
  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner: user.login,
    repo: repoName,
    message: 'SpyGuard App - Complete source code',
    tree: tree.sha,
    parents: [baseSha]
  });
  
  console.log('Updating main branch...');
  await octokit.git.updateRef({
    owner: user.login,
    repo: repoName,
    ref: 'heads/main',
    sha: commit.sha
  });
  
  console.log('\n========================================');
  console.log('SUCCESS! Code pushed to GitHub!');
  console.log(`\nRepository URL: https://github.com/${user.login}/${repoName}`);
  console.log('========================================\n');
}

main().catch(console.error);
