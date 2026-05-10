import { readFileSync } from 'node:fs';

const js = readFileSync('dist/inex-ge.user.js', 'utf8');

const checks = [
  [js.includes('--inex-bg'), 'dark CSS is missing from build'],
  [!js.match(/export default[^;]+--inex-bg/s), 'dark CSS was emitted as module text'],
];

for (const [ok, message] of checks) {
  if (ok) continue;
  console.error(message);
  process.exitCode = 1;
}
