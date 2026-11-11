// Gantt — références figées. Chaque scénario compare le HTML produit à celui
// enregistré depuis la version d'avant la refonte du rendu (v140).
//   node t7-gantt.js            compare
//   node t7-gantt.js --ecrire   réécrit les références (à ne faire qu'en connaissance de cause)
const fs = require('fs'); const path = require('path'); const zlib = require('zlib');
const { monter, rapport, baseMinimale, J } = require('./harnais');
const REF = path.join(__dirname, 'gantt-ref');
const ECRIRE = process.argv.includes('--ecrire');
const MAINTENANT = new Date(2026, 10, 11, 10, 30, 0).getTime();   // mercredi 11 nov. 2026, 10 h 30

function baseGantt() {
  const b = baseMinimale();
  const j = (a, m, d) => Math.floor(new Date(a, m, d).getTime() / 1000);
  const T = (id, o) => Object.assign({ id, Title: 'Tâche ' + id, Description: '', Status: 'todo', Priority: 'medium', Assignee: '', Group_Name: '', Start_Date: null, Due_Date: null, Category: '', Tag: '', Recurrence: 'none', Estimated_Hours: 0, Created_At: 0, Project_Id: 0, Accountable: '', Consulted: '', Informed: '', Extension_Date: null, Auto_Extend: false }, o);
  b.PM_Tasks = [
    T(1, { Title: 'Dans la fenêtre', Start_Date: j(2026, 10, 3), Due_Date: j(2026, 10, 20), Project_Id: 1, Priority: 'high' }),
    T(2, { Title: 'Commencée avant', Start_Date: j(2026, 6, 14), Due_Date: j(2026, 10, 6), Status: 'progress', Project_Id: 2 }),
    T(3, { Title: 'Finit bien après', Start_Date: j(2026, 11, 28), Due_Date: j(2027, 4, 9), Project_Id: 1 }),
    T(4, { Title: 'Échéance seule', Due_Date: j(2026, 10, 13), Status: 'done' }),
    T(5, { Title: 'Début seul', Start_Date: j(2026, 9, 30), Priority: 'low' }),
    T(6, { Title: 'En retard, prolongée d’office', Start_Date: j(2026, 9, 26), Due_Date: j(2026, 10, 4), Auto_Extend: true, Status: 'progress', Project_Id: 2 }),
    T(7, { Title: 'Prolongation fixée', Start_Date: j(2026, 10, 9), Due_Date: j(2026, 10, 16), Extension_Date: j(2026, 11, 3) }),
    T(8, { Title: 'Prolongée le jour même', Start_Date: j(2026, 10, 17), Due_Date: j(2026, 10, 18), Extension_Date: j(2026, 10, 18) }),
    T(9, { Title: 'Loin dans le passé', Start_Date: j(2024, 1, 5), Due_Date: j(2024, 2, 1) }),
    T(10, { Title: 'Sans date' }),
    T(11, { Title: 'À cheval sur deux années <b>', Start_Date: j(2026, 11, 15), Due_Date: j(2027, 0, 20), Project_Id: 1 }),
    T(12, { Title: 'Archivée', Start_Date: j(2026, 10, 2), Due_Date: j(2026, 10, 5), Status: 'archived' })
  ];
  const S = (id, parent, o) => Object.assign({ id, Parent_Task_Id: parent, Title: 'Sous-tâche ' + id, Description: '', Status: 'todo', Priority: 'medium', Assignee: '', Due_Date: null, Start_Date: null, Estimated_Hours: 0, Completed: false, Order: id, Created_At: 0, Blocked_By_Subtask_Id: 0, Recurrence: 'none', Type: 'subtask' }, o);
  b.PM_Subtasks = [
    S(1, 1, { Title: 'Sur une période', Start_Date: j(2026, 10, 5), Due_Date: j(2026, 10, 12) }),
    S(2, 1, { Title: 'Jalon', Due_Date: j(2026, 10, 18), Type: 'milestone' }),
    S(3, 1, { Title: 'Sans date' }),
    S(4, 1, { Title: 'Terminée', Due_Date: j(2026, 10, 7), Completed: true, Status: 'done' }),
    S(5, 2, { Title: 'En retard', Due_Date: j(2026, 9, 2) }),
    S(6, 3, { Title: 'Hors fenêtre', Start_Date: j(2027, 2, 1), Due_Date: j(2027, 2, 15) }),
    S(7, 11, { Title: 'Début après la fin', Start_Date: j(2027, 0, 10), Due_Date: j(2027, 0, 3) })
  ];
  b.PM_Dependencies = [{ id: 1, Task_Id: 1, Depends_On_Task_Id: 2, Created_At: 0 }];
  return b;
}

// nom, réglages appliqués avant le rendu
const SCENARIOS = [
  ['jours',                 w => { w.ganttMode = 'days'; }],
  ['jours-replie',          w => { w.ganttMode = 'days'; w.expandedGanttTasks = {}; }],
  ['jours-autre-mois',      w => { w.ganttMode = 'days'; w.ganttYear = 2027; w.ganttMonth = 0; }],
  ['semaines',              w => { w.ganttMode = 'weeks'; }],
  ['semaines-janvier',      w => { w.ganttMode = 'weeks'; w.ganttYear = 2027; w.ganttMonth = 0; }],
  ['mois',                  w => { w.ganttMode = 'months'; }],
  ['mois-2027',             w => { w.ganttMode = 'months'; w.ganttYear = 2027; }],
  ['annee',                 w => { w.ganttMode = 'year'; }],
  ['annee-2027',            w => { w.ganttMode = 'year'; w.ganttYear = 2027; }],
  ['deux-ans',              w => { w.ganttMode = 'twoyears'; }],
  ['personnalise',          w => { w.ganttMode = 'custom'; w.ganttCustomStart = '2026-10-20'; w.ganttCustomEnd = '2026-12-05'; }],
  ['personnalise-invalide', w => { w.ganttMode = 'custom'; w.ganttCustomStart = '2026-12-05'; w.ganttCustomEnd = '2026-10-20'; }],
  ['personnalise-borne',    w => { w.ganttMode = 'custom'; w.ganttCustomStart = '2026-01-01'; w.ganttCustomEnd = '2028-06-30'; }],
  ['jours-tri-alpha',       w => { w.ganttMode = 'days'; w.ganttSort = 'alpha'; }],
  ['mois-tri-projet',       w => { w.ganttMode = 'months'; w.ganttSort = 'project'; }],
  ['semaines-anglais',      w => { w.ganttMode = 'weeks'; w.currentLang = 'en'; }],
  ['jours-filtre',          w => { w.ganttMode = 'days'; w.currentProjectId = 1; }],
  ['mois-archives',         w => { w.ganttMode = 'months'; w.showArchivedTasks = true; }]
];

(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  if (ECRIRE && !fs.existsSync(REF)) fs.mkdirSync(REF);
  for (const [nom, regler] of SCENARIOS) {
    const { w, d, erreurs } = await monter(baseGantt(), { maintenant: MAINTENANT });
    w.ganttYear = 2026; w.ganttMonth = 10; w.ganttSort = 'default'; w.ganttCustomStart = ''; w.ganttCustomEnd = '';
    w.expandedGanttTasks = {}; w.tasks.forEach(t => { w.expandedGanttTasks[t.id] = true; });
    regler(w);
    w.switchTab('gantt');
    const html = d.getElementById('gantt-view').innerHTML;
    const fichier = path.join(REF, nom + '.html.gz');
    if (ECRIRE) { fs.writeFileSync(fichier, zlib.gzipSync(html, { level: 9 })); v('référence écrite : ' + nom, erreurs.length === 0, (html.length / 1024).toFixed(0) + ' Ko'); continue; }
    if (!fs.existsSync(fichier)) { v(nom, false, 'référence absente'); continue; }
    const attendu = zlib.gunzipSync(fs.readFileSync(fichier)).toString('utf8');
    let detail = '';
    if (html !== attendu) {
      let i = 0; while (i < html.length && html[i] === attendu[i]) i++;
      detail = 'premier écart au caractère ' + i + ' — attendu « …' + attendu.slice(Math.max(0, i - 60), i + 80).replace(/\n/g, ' ') + '… » obtenu « …' + html.slice(Math.max(0, i - 60), i + 80).replace(/\n/g, ' ') + '… »';
    }
    v(nom + ' : rendu identique à la référence', html === attendu && erreurs.length === 0, detail || erreurs.join('|'));
  }
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
