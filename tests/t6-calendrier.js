// Sous-tâches dans le calendrier : une tâche apparaît le jour où tombe l'une de
// ses sous-tâches, et se déplie pour les montrer.
const { monter, rapport, baseMinimale, J } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const base = baseMinimale();
  const t0 = base.PM_Tasks[0].Start_Date;               // lundi 9 nov. 2026
  // tâche 1 : lun→mer ; sous-tâche 1 due mardi ; sous-tâche 2 due vendredi (hors de la tâche)
  // tâche 3 : sans date, avec un jalon jeudi et une sous-tâche sur une période sam→dim
  base.PM_Subtasks.push(
    { id: 3, Parent_Task_Id: 3, Title: 'Signature', Description: '', Status: 'todo', Priority: 'medium', Assignee: '', Due_Date: t0 + 3 * J, Start_Date: null, Estimated_Hours: 0, Completed: false, Order: 1, Created_At: t0, Blocked_By_Subtask_Id: 0, Recurrence: 'none', Type: 'milestone' },
    { id: 4, Parent_Task_Id: 3, Title: 'Relecture', Description: '', Status: 'todo', Priority: 'medium', Assignee: '', Due_Date: t0 + 6 * J, Start_Date: t0 + 5 * J, Estimated_Hours: 0, Completed: false, Order: 2, Created_At: t0, Blocked_By_Subtask_Id: 0, Recurrence: 'none', Type: 'subtask' });
  const { w, d, g, erreurs } = await monter(base);
  const jour = n => new Date(2026, 10, 9 + n);
  const entrees = n => w.getCalendarEntriesForDate(jour(n)).map(e => e.task.id + (e.own ? '' : '*') + (e.subs.length ? '[' + e.subs.map(s => s.id).join('+') + ']' : '')).join(' ');
  v('aucune erreur', erreurs.length === 0, erreurs.join('|'));

  v('lundi : la tâche 1 seule', entrees(0) === '1', entrees(0));
  v('mardi : tâche 1 avec sa sous-tâche du jour, et tâche 2', entrees(1) === '1[1] 2', entrees(1));
  v('jeudi : tâche 3 présente par son seul jalon', entrees(3) === '3*[3]', entrees(3));
  v('vendredi : tâche 1 revient par sa sous-tâche, hors de ses propres dates', entrees(4) === '1*[2]', entrees(4));
  v('samedi et dimanche : une sous-tâche étalée couvre les deux jours', entrees(5) === '3*[4]' && entrees(6) === '3*[4]', entrees(5) + ' / ' + entrees(6));

  // --- rendu, vue Semaine (la date du jour importe peu : on force la semaine du 9) ---
  const lundiCourant = (() => { const n = new Date(); const dow = n.getDay(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + (dow === 0 ? -6 : 1 - dow)); })();
  w.calendarWeekOffset = Math.round((jour(0) - lundiCourant) / (7 * J * 1000));
  w.calendarMode = 'week'; w.switchTab('calendar');
  const cases = () => [...d.querySelectorAll('#calendar-days .calendar-day')];
  v('sept jours dessinés', cases().length === 7, cases().length);
  const mardi = () => cases()[1], vendredi = () => cases()[4], jeudi = () => cases()[3];
  v('mardi : pastille « 1 sous-tâche » sur la tâche 1', mardi().querySelector('.day-task-toggle') && mardi().querySelector('.day-task-toggle').textContent === '▸1', mardi().querySelector('.day-task-toggle') && mardi().querySelector('.day-task-toggle').textContent);
  v('repliée par défaut', d.querySelectorAll('.day-subtask').length === 0);
  v('vendredi : tâche en pointillé, là pour sa sous-tâche', !!vendredi().querySelector('.day-task.via-subtask'));
  v('… et non déplaçable', !vendredi().querySelector('.day-task.via-subtask').hasAttribute('draggable'));
  v('lundi : tâche ordinaire déplaçable', cases()[0].querySelector('.day-task').getAttribute('draggable') === 'true');

  mardi().querySelector('.day-task-toggle').click();
  v('déplier montre la sous-tâche du jour', mardi().querySelectorAll('.day-subtask').length === 1 && mardi().querySelector('.day-subtask').textContent.includes('Rédiger le CCTP'), mardi().querySelector('.day-subtask') && mardi().querySelector('.day-subtask').textContent);
  v('… et celle de vendredi, la tâche étant dépliée partout', vendredi().querySelector('.day-subtask') && vendredi().querySelector('.day-subtask').classList.contains('done'));
  v('… pas la sous-tâche de vendredi dans la case de mardi', !mardi().textContent.includes('Publier'));
  v('la flèche a tourné', mardi().querySelector('.day-task-toggle').textContent === '▾1');
  jeudi().querySelector('.day-task-toggle').click();
  v('un jalon est marqué d’un losange', jeudi().querySelector('.day-subtask.milestone') && jeudi().querySelector('.day-subtask.milestone').textContent.startsWith('◆'));
  mardi().querySelector('.day-task-toggle').click();
  v('replier', mardi().querySelectorAll('.day-subtask').length === 0);

  // --- les filtres de la tâche s'appliquent à ses sous-tâches ---
  w.toggleFilterValue('tag', 'Budget');   // la tâche 3 n'a pas ce tag
  v('une tâche filtrée n’apparaît pas par ses sous-tâches', entrees(3) === '' && entrees(4) === '1*[2]', entrees(3) + ' / ' + entrees(4));
  w.resetFilters();

  // --- une sous-tâche archivée quitte le calendrier ---
  await w.archiveSubtask(2, 1, true); w.closeModalForce();
  v('sous-tâche archivée : la tâche ne revient plus vendredi', entrees(4) === '', entrees(4));

  // --- vue Mois ---
  w.calendarMode = 'month'; w.calendarYear = 2026; w.calendarMonth = 10; w.renderCalendarView();
  const caseDu = n => [...d.querySelectorAll('#calendar-days .calendar-day:not(.other-month)')][n - 1];
  v('vue Mois : le 12 porte la tâche 3 par son jalon', !!caseDu(12).querySelector('.day-task.via-subtask') && caseDu(12).textContent.includes('Compte rendu'));
  v('vue Mois : le 10 porte deux tâches', caseDu(10).querySelectorAll('.day-task').length === 2);

  // --- vue Jour ---
  w.calendarMode = 'day'; w.calendarDayOffset = Math.round((jour(3) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / (J * 1000));
  w.renderCalendarView();
  const texteJour = d.getElementById('calendar-days').textContent;
  v('vue Jour : la tâche amenée par son jalon y figure', /Compte rendu/.test(texteJour) && /Sous-tâche ce jour/.test(texteJour), texteJour.slice(0, 80));
  v('… sa sous-tâche du jour est mise en avant', d.querySelectorAll('.day-subtask-item.on-day').length === 1 && d.querySelector('.day-subtask-item.on-day').textContent.includes('Signature'));
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
