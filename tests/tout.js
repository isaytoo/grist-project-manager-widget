// Lance toutes les suites. Sortie non nulle si l'une échoue.
const { spawnSync } = require('child_process');
const fs = require('fs');
let ko = 0, total = 0;
fs.readdirSync(__dirname).filter(f => /^t\d.*\.js$/.test(f)).sort().forEach(f => {
  const r = spawnSync(process.execPath, [f], { cwd: __dirname, encoding: 'utf8' });
  const fin = (r.stdout.trim().split('\n').pop() || '').trim();
  const m = fin.match(/(\d+) contrôles/); if (m) total += +m[1];
  if (r.status !== 0) { ko++; console.log(r.stdout.split('\n').filter(l => /✗/.test(l)).join('\n')); if (!/✗/.test(r.stdout)) console.log(r.stderr.slice(-600)); }
  console.log((r.status === 0 ? '✓ ' : '✗ ') + f.padEnd(26) + fin);
});
console.log(ko ? `\n${ko} suite(s) en échec.` : `\nToutes les suites passent — ${total} contrôles.`);
process.exit(ko ? 1 : 0);
