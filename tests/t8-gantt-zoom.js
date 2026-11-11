// Gantt — vue 10 ans, et zoom de la vue Personnalisé.
const { monter, rapport } = require('./harnais');
const { baseGantt, MAINTENANT } = require('./t7-gantt');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const { w, d, erreurs } = await monter(baseGantt(), { maintenant: MAINTENANT });
  w.ganttYear = 2026; w.ganttMonth = 10; w.expandedGanttTasks = {}; w.tasks.forEach(t => { w.expandedGanttTasks[t.id] = true; });
  const vue = () => d.getElementById('gantt-view');
  const entetes = () => [...vue().querySelectorAll('thead tr:nth-child(2) th')];
  const groupes = () => [...vue().querySelectorAll('thead tr:first-child th.gantt-group')].map(th => th.textContent + '×' + th.colSpan);
  const barre = titre => [...vue().querySelectorAll('.gantt-bar:not(.gantt-bar-subtask)')].find(b => b.textContent === titre);
  // position absolue d'une barre dans la grille, en pixels depuis la première colonne
  const px = (el, colW) => { const td = el.parentNode; const idx = [...td.parentNode.children].indexOf(td) - 1; return { debut: idx * colW + parseFloat(el.style.left), largeur: parseFloat(el.style.width) }; };
  const colW = () => parseFloat(entetes()[0].style.minWidth);
  const jours = (a, b) => Math.round((b - a) / 86400000);

  // ───────── vue 10 ans ─────────
  w.switchTab('gantt'); w.setGanttMode('year');
  v('aucune erreur', erreurs.length === 0, erreurs.join('|'));
  v('le bouton s’appelle « 10 ans »', d.querySelector('[data-gantt-mode="year"]').textContent === '10 ans', d.querySelector('[data-gantt-mode="year"]').textContent);
  v('dix années, l’année choisie au milieu', groupes().join(' ') === [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031].map(a => a + '×12').join(' '), groupes().join(' '));
  v('120 colonnes, une par mois', entetes().length === 120, entetes().length);
  v('initiales des mois, nom complet en infobulle', entetes().slice(0, 3).map(th => th.textContent).join('') === 'JFM' && entetes()[10].title === 'novembre 2022', entetes()[10].title);
  const auj = entetes().findIndex(th => th.id === 'gantt-today-col');
  v('la colonne du jour est novembre 2026', auj === 4 * 12 + 10, auj);
  v('le trait du jour est posé, au tiers du mois', vue().querySelector('td.today-col div[style*="#ef4444"]').style.left === '33%', vue().querySelector('td.today-col div[style*="#ef4444"]').style.left);
  v('un repère marque chaque début d’année', vue().querySelectorAll('thead tr:nth-child(2) th.gantt-mark').length === 10);

  // géométrie au jour près : « Finit bien après », du 28 déc. 2026 au 9 mai 2027
  const W = colW();
  const b3 = px(barre('Finit bien après'), W);
  const attenduDebut = (4 * 12 + 11) * W + (27 / 31) * W;                      // 28 déc. = 27 jours écoulés sur 31
  v('une barre commence au bon jour, pas au début du mois', Math.abs(b3.debut - attenduDebut) < 0.6, b3.debut.toFixed(1) + ' px pour ' + attenduDebut.toFixed(1));
  const attenduFin = (5 * 12 + 4) * W + (9 / 31) * W;                          // fin du 9 mai
  v('… et finit au bon jour', Math.abs(b3.debut + b3.largeur - attenduFin) < 0.6, (b3.debut + b3.largeur).toFixed(1) + ' px pour ' + attenduFin.toFixed(1));
  v('une tâche d’un jour reste cliquable', px(barre('Échéance seule'), W).largeur >= 4, px(barre('Échéance seule'), W).largeur);
  v('une tâche de 2024 apparaît, qu’aucune autre vue ne montrait en 2026', !!barre('Loin dans le passé'));
  v('les sous-tâches ont leur ligne', vue().querySelectorAll('tr.gantt-subtask-row').length === 6, vue().querySelectorAll('tr.gantt-subtask-row').length);
  v('prolongations dessinées', vue().querySelectorAll('.gantt-bar-extension').length >= 2, vue().querySelectorAll('.gantt-bar-extension').length);
  w.ganttNav(1);
  v('▶ avance d’un an', groupes()[0] === '2023×12' && groupes()[9] === '2032×12', groupes()[0] + ' … ' + groupes()[9]);
  w.ganttToday();
  v('« Aujourd’hui » revient sur 2026', groupes()[4] === '2026×12');

  // ───────── vue Personnalisé : l'échelle suit la période ─────────
  const regler = (a, b) => { w.ganttMode = 'custom'; w.ganttCustomStart = a; w.ganttCustomEnd = b; w.setGanttMode('custom'); };
  const echelle = () => d.getElementById('gantt-scale-label').textContent;
  regler('2026-10-20', '2026-12-05');
  v('47 jours : colonnes-jours', echelle() === 'Échelle : jours' && entetes().length === 47, echelle() + ' / ' + entetes().length);
  regler('2026-01-01', '2027-06-30');
  v('18 mois : semaines', echelle() === 'Échelle : semaines' && /^S\d+$/.test(entetes()[0].textContent), echelle() + ' / ' + entetes()[0].textContent);
  v('… toute la période est couverte (elle était coupée à 400 jours)', entetes().length >= 78, entetes().length + ' semaines');
  regler('2024-01-01', '2029-12-31');
  v('6 ans : mois', echelle() === 'Échelle : mois' && entetes().length === 72, echelle() + ' / ' + entetes().length);
  regler('2015-01-01', '2032-12-31');
  v('18 ans : trimestres', echelle() === 'Échelle : trimestres' && entetes().length === 72 && entetes()[0].textContent === 'T1', echelle() + ' / ' + entetes().length);
  regler('2026-12-05', '2026-10-20');
  v('période inversée : repli sur la fenêtre par défaut, sans erreur', entetes().length > 80 && erreurs.length === 0 && echelle() === '', entetes().length + ' / « ' + echelle() + ' »');

  // période saisie au-delà de 20 ans
  d.getElementById('gantt-custom-start').value = '2000-01-01'; d.getElementById('gantt-custom-end').value = '2040-01-01';
  w.setGanttCustomRange();
  v('plus de 20 ans : ramenée à 20, et le champ le montre', d.getElementById('gantt-custom-end').value === '2019-12-31' && w.ganttCustomRange().days === 7305, d.getElementById('gantt-custom-end').value);

  // ───────── zoom ─────────
  regler('2026-10-01', '2026-12-31');     // 92 jours
  const etat = () => w.ganttCustomRange().days + ' j, ' + echelle().replace('Échelle : ', '');
  const milieu = () => { const r = w.ganttCustomRange(); return new Date(r.start.getTime() + (r.end - r.start) / 2); };
  const m0 = milieu();
  const pas = [];
  for (let i = 0; i < 9; i++) { w.ganttZoom(-1); pas.push(etat()); }
  v('zoom arrière : 6 mois, 1, 2, 5, 10, 20 ans, puis butée', pas.join(' | ') === '183 j, semaines | 365 j, semaines | 730 j, semaines | 1826 j, mois | 3652 j, mois | 7305 j, trimestres | 7305 j, trimestres | 7305 j, trimestres | 7305 j, trimestres', pas.join(' | '));
  v('à 20 ans le bouton − est désactivé', d.getElementById('gantt-zoom-out').disabled === true && d.getElementById('gantt-zoom-in').disabled === false);
  v('le zoom garde le milieu de la période', Math.abs(jours(m0, milieu())) <= 1, jours(m0, milieu()) + ' jour(s) d’écart');
  const retour = [];
  for (let i = 0; i < 9; i++) { w.ganttZoom(1); retour.push(w.ganttCustomRange().days); }
  v('zoom avant : jusqu’à 6 semaines, puis butée', retour.join() === '3652,1826,730,365,183,92,42,42,42', retour.join());
  v('à 6 semaines le bouton + est désactivé', d.getElementById('gantt-zoom-in').disabled === true && echelle() === 'Échelle : jours');
  v('… et l’aller-retour ramène au jour près', Math.abs(jours(m0, milieu())) <= 1, jours(m0, milieu()) + ' jour(s)');
  v('les champs de date suivent le zoom', d.getElementById('gantt-custom-start').value === w.ganttCustomStart && d.getElementById('gantt-custom-end').value === w.ganttCustomEnd);

  regler('2026-10-01', '2026-12-31');
  w.ganttZoom(-1); w.ganttZoom(-1); w.ganttZoom(-1); w.ganttZoom(1); w.ganttZoom(1); w.ganttZoom(1);
  v('trois crans arrière puis trois crans avant : exactement la période de départ', w.ganttCustomStart === '2026-10-01' && w.ganttCustomEnd === '2026-12-31', w.ganttCustomStart + ' → ' + w.ganttCustomEnd);

  // ───────── flèches et « Aujourd'hui » ─────────
  regler('2026-01-01', '2026-12-31');
  w.ganttNav(1);
  v('▶ décale d’une demi-période', w.ganttCustomStart === '2026-07-03' && w.ganttCustomRange().days === 365, w.ganttCustomStart + ' → ' + w.ganttCustomEnd);
  w.ganttNav(-1); w.ganttNav(-1);
  v('◀ revient puis recule', w.ganttCustomStart === '2025-07-02', w.ganttCustomStart);
  regler('2030-01-01', '2030-03-31');
  w.ganttToday();
  const r = w.ganttCustomRange();
  v('« Aujourd’hui » recentre la période, sans changer sa durée', r.days === 90 && r.start <= new Date(2026, 10, 11) && r.end >= new Date(2026, 10, 11) && !!d.getElementById('gantt-today-col'), w.ganttCustomStart + ' → ' + w.ganttCustomEnd);

  // ───────── les autres vues n'affichent pas les commandes de zoom ─────────
  w.setGanttMode('months');
  v('hors Personnalisé, la barre de dates est masquée', d.getElementById('gantt-custom-range').style.display === 'none');
  w.setLang('en'); w.setGanttMode('custom'); regler('2024-01-01', '2029-12-31');
  v('en anglais', echelle() === 'Scale: months' && d.querySelector('[data-gantt-mode="year"]').textContent === '10 years', echelle());
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
