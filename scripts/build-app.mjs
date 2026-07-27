import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Next.js evaluates server routes while collecting page data. A fresh SQLite
// file keeps parallel build workers from competing with a developer database.
// An explicitly supplied SQLITE_PATH still wins for PostgreSQL or CI setups.
const buildDir = join(process.cwd(), '.build');
mkdirSync(buildDir, { recursive: true });

const command = process.platform === 'win32' ? 'next.cmd' : 'next';
const result = spawnSync(command, ['build'], {
  env: {
    ...process.env,
    ZHICE_BUILD: 'true',
    SQLITE_PATH: process.env.SQLITE_PATH || join(buildDir, 'build.sqlite'),
  },
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
