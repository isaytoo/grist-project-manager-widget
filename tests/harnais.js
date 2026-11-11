// Harnais jsdom : charge la vraie page et le vrai script, face à un faux document
// Grist tenu en mémoire. Lancer :  cd tests && npm install jsdom && node tout.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const RACINE = process.env.PM || path.join(__dirname, '..');

function fauxGrist(base, refuser) {
  // base : { Table: [ {id, ...}, ... ] } — refuser(action) : vrai pour simuler un refus de droits
  const journal = [];
  const cols = {};
  Object.keys(base).forEach(t => { cols[t] = { id: 1 }; base[t].forEach(r => Object.keys(r).forEach(k => cols[t][k] = 1)); });
  const prochain = t => (base[t].reduce((m, r) => Math.max(m, r.id), 0) + 1);
  function appliquer(a) {
    const [op, t] = a;
    if (refuser && refuser(a)) throw new Error('Blocked by access rules : ' + op + ' ' + t);
    if (op === 'AddTable') { if (!base[t]) { base[t] = []; cols[t] = { id: 1 }; (a[2] || []).forEach(c => cols[t][c.id] = 1); } return null; }
    if (!base[t]) throw new Error('Table inconnue : ' + t);
    if (op === 'AddColumn') { cols[t][a[2]] = 1; return null; }
    if (op === 'ModifyColumn') return null;
    const verifier = rec => Object.keys(rec || {}).forEach(k => { if (!cols[t][k]) throw new Error('KeyError ' + t + '.' + k); });
    if (op === 'AddRecord') { verifier(a[3]); const id = prochain(t); base[t].push(Object.assign({ id }, a[3])); return id; }
    if (op === 'BulkAddRecord') { const ids = []; a[3].forEach(rec => { verifier(rec); const id = prochain(t); base[t].push(Object.assign({ id }, rec)); ids.push(id); }); return ids; }
    if (op === 'UpdateRecord') { verifier(a[3]); const r = base[t].find(x => x.id === a[2]); if (r) Object.assign(r, a[3]); return null; }
    if (op === 'RemoveRecord') { base[t] = base[t].filter(x => x.id !== a[2]); return null; }
    if (op === 'BulkRemoveRecord') { base[t] = base[t].filter(x => a[2].indexOf(x.id) === -1); return null; }
    throw new Error('Action non simulée : ' + op);
  }
  return {
    journal, base, cols,
    api: {
      ready: async () => {}, onRecords: () => {},
      docApi: {
        listTables: async () => Object.keys(base),
        getDocName: async () => 'doc-test',
        fetchTable: async t => {
          if (!base[t]) throw new Error('Table inconnue : ' + t);
          const out = {}; Object.keys(cols[t]).forEach(c => out[c] = base[t].map(r => r[c] === undefined ? '' : r[c]));
          out.id = base[t].map(r => r.id); return out;
        },
        // Comme Grist : un lot est tout ou rien.
        applyUserActions: async actions => {
          const copie = JSON.stringify(base), copieCols = JSON.stringify(cols);
          try { const ret = actions.map(appliquer); journal.push(...actions); return { retValues: ret }; }
          catch (e) {
            const b = JSON.parse(copie), c = JSON.parse(copieCols);
            Object.keys(base).forEach(k => delete base[k]); Object.assign(base, b);
            Object.keys(cols).forEach(k => delete cols[k]); Object.assign(cols, c);
            throw e;
          }
        },
        getAccessToken: async () => ({ baseUrl: 'http://x', token: 't' })
      }
    }
  };
}

async function monter(base, { email = 'said@x.fr', proprietaire = true, refuser = null, stockage = null } = {}) {
  let html = fs.readFileSync(RACINE + '/index.html', 'utf8');
  html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://widget.test/' });
  const w = dom.window;
  if (stockage) Object.keys(stockage).forEach(k => w.localStorage.setItem(k, stockage[k]));
  const g = fauxGrist(base, refuser);
  w.grist = g.api;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = function () {};
  const erreurs = [];
  w.addEventListener('error', e => erreurs.push(e.message));
  const sc = w.document.createElement('script');
  sc.textContent = fs.readFileSync(RACINE + '/widget.js', 'utf8');
  w.document.body.appendChild(sc);
  w.eval('isOwner = ' + (proprietaire ? 'true' : 'false') + '; isEditor = true; currentUserEmail = ' + JSON.stringify(email) + ';');
  const silence = w.console.log; w.console.log = () => {};
  await w.ensureTables();
  await w.loadSettings();
  await w.loadAllData();
  await w.resolveDocKey();
  w.console.log = silence;
  // même enchaînement que l'ouverture réelle du widget
  w.restoreFilters(); w.restoreViewPrefs(); w.renderProjectSelector(); w.refreshAllViews();
  const vue = w.getMyDefaultView(); if (vue) w.applyViewSnapshot(vue); else w.restoreActiveTab();
  const attendre = (ms = 0) => new Promise(r => setTimeout(r, ms));
  return { w, d: w.document, g, erreurs, attendre, dom };
}

function rapport(res) {
  let ko = 0;
  res.forEach(([n, ok, d]) => { if (!ok) ko++; console.log(`  ${ok ? '✓' : '✗'}  ${n}${d !== undefined && d !== '' ? '  → ' + d : ''}`); });
  console.log(ko ? `\n${ko} échec(s) sur ${res.length}.` : `\nTout passe — ${res.length} contrôles.`);
  process.exit(ko ? 1 : 0);
}

function baseMinimale() {
  const J = 86400, t0 = Math.floor(new Date(2026, 10, 9).getTime() / 1000); // lundi 9 nov. 2026
  const dejaLa = { Accountable: '', Consulted: '', Informed: '', Extension_Date: null, Auto_Extend: false };
  const base = {
    PM_Tasks: [
      { id: 1, Title: 'Dossier de consultation', Description: '', Status: 'todo', Priority: 'high', Assignee: 'ana@x.fr', Group_Name: 'Travaux', Start_Date: t0, Due_Date: t0 + 2 * J, Category: 'Études', Tag: 'Urgent, Budget', Recurrence: 'none', Estimated_Hours: 0, Created_At: t0, Project_Id: 1 },
      { id: 2, Title: 'Visite de chantier', Description: '', Status: 'progress', Priority: 'medium', Assignee: 'Bob', Group_Name: '', Start_Date: t0 + J, Due_Date: t0 + J, Category: 'Terrain', Tag: 'Budget', Recurrence: 'none', Estimated_Hours: 0, Created_At: t0, Project_Id: 2 },
      { id: 3, Title: 'Compte rendu', Description: '', Status: 'done', Priority: 'low', Assignee: '', Group_Name: 'Juridique', Start_Date: null, Due_Date: null, Category: '', Tag: '', Recurrence: 'none', Estimated_Hours: 0, Created_At: t0, Project_Id: 0 }
    ],
    PM_Users: [
      { id: 1, Name: 'Ana', Email: 'ana@x.fr', Role: 'admin', Group_Name: 'Travaux' },
      { id: 2, Name: 'Bob', Email: 'bob@x.fr', Role: 'member', Group_Name: 'Juridique' },
      { id: 3, Name: 'Said', Email: 'said@x.fr', Role: 'admin', Group_Name: '' }
    ],
    PM_Groups: [{ id: 1, Name: 'Travaux', Description: '' }, { id: 2, Name: 'Juridique', Description: '' }],
    PM_Tags: [{ id: 1, Name: 'Urgent', Color: '#ef4444' }, { id: 2, Name: 'Budget', Color: '#3b82f6' }, { id: 3, Name: 'Archive', Color: '#94a3b8' }],
    PM_Categories: [{ id: 1, Name: 'Études', Color: '#6366f1' }, { id: 2, Name: 'Terrain', Color: '#22c55e' }],
    PM_Projects: [{ id: 1, Name: 'Réhabilitation', Color: '#6366f1', Description: '', Lead: '', CreatedBy: '' }, { id: 2, Name: 'Voirie', Color: '#f59e0b', Description: '', Lead: '', CreatedBy: '' }],
    PM_Subtasks: [
      { id: 1, Parent_Task_Id: 1, Title: 'Rédiger le CCTP', Description: '', Status: 'todo', Priority: 'medium', Assignee: '', Due_Date: t0 + J, Start_Date: null, Estimated_Hours: 0, Completed: false, Order: 1, Created_At: t0, Blocked_By_Subtask_Id: 0, Recurrence: 'none', Type: 'subtask' },
      { id: 2, Parent_Task_Id: 1, Title: 'Publier', Description: '', Status: 'done', Priority: 'medium', Assignee: '', Due_Date: t0 + 4 * J, Start_Date: null, Estimated_Hours: 0, Completed: true, Order: 2, Created_At: t0, Blocked_By_Subtask_Id: 0, Recurrence: 'none', Type: 'subtask' }
    ],
    PM_CustomFields: [{ id: 1, Name: 'Lot', Type: 'select', Options: 'Gros œuvre,Second œuvre', Order: 1, Created_At: t0 }, { id: 2, Name: 'Validé', Type: 'checkbox', Options: '', Order: 2, Created_At: t0 }],
    PM_CustomFieldValues: [{ id: 1, Task_Id: 1, Field_Id: 1, Value: 'Gros œuvre' }, { id: 2, Task_Id: 2, Field_Id: 1, Value: 'Second œuvre' }, { id: 3, Task_Id: 2, Field_Id: 2, Value: 'true' }]
  };
  base.PM_Tasks.forEach(t => Object.assign(t, dejaLa));
  return base;
}
module.exports = { monter, rapport, baseMinimale, J: 86400 };
