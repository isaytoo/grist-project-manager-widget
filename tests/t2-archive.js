// Archive des sous-tâches, propre à chaque tâche.
const { monter, rapport, baseMinimale } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const { w, d, g, attendre } = await monter(baseMinimale());
  const tache = () => w.tasks.find(t => t.id === 1);
  v('au départ : 2 sous-tâches, 50 %', w.getTaskSubtasks(1).length === 2 && w.getTaskProgress(tache()) === 50, w.getTaskProgress(tache()) + ' %');

  w.openEditTaskModal(1);
  v('chaque sous-tâche a son bouton d’archive', d.querySelectorAll('#subtasks-list button[onclick^="archiveSubtask"]').length === 2);
  v('« Archiver la sous-tâche terminée » proposé', !!d.querySelector('.subtask-archive-all') && d.querySelector('.subtask-archive-all').textContent === 'Archiver la sous-tâche terminée', d.querySelector('.subtask-archive-all') && d.querySelector('.subtask-archive-all').textContent);
  v('archive repliée et vide', d.querySelector('.subtask-archive-toggle').textContent.includes('0') && !d.querySelector('.subtask-archive-list'));

  d.getElementById('task-title').value = 'Titre en cours de saisie';
  await w.archiveSubtask(2, 1, true);
  v('écrit Archived = true', g.base.PM_Subtasks.find(s => s.id === 2).Archived === true);
  v('le statut de la sous-tâche est intact', g.base.PM_Subtasks.find(s => s.id === 2).Status === 'done');
  v('elle sort de la liste', w.getTaskSubtasks(1).length === 1 && w.getTaskSubtasks(1)[0].id === 1);
  v('elle est dans l’archive de la tâche', w.getTaskSubtasks(1, true).length === 1 && w.getTaskSubtasks(1, true)[0].id === 2);
  v('l’avancement est recalculé sans elle', w.getTaskProgress(tache()) === 0, w.getTaskProgress(tache()) + ' %');
  v('la saisie en cours a survécu', d.getElementById('task-title').value === 'Titre en cours de saisie', d.getElementById('task-title').value);
  v('le compteur de la modale suit', d.querySelector('.subtasks-header .subtask-badge').textContent === '0/1', d.querySelector('.subtasks-header .subtask-badge').textContent);

  await w.toggleSubtaskArchive(1); await attendre(5);
  const lignes = () => [...d.querySelectorAll('.subtask-archive-list .subtask-item.archived')];
  v('archive dépliée : la sous-tâche y figure', lignes().length === 1 && lignes()[0].textContent.includes('Publier'));

  w.renderKanbanView();
  v('carte Kanban : décompte 0/1', d.querySelector('.task-card[data-id="1"] .subtask-count').textContent === '0/1', d.querySelector('.task-card[data-id="1"] .subtask-count').textContent);
  w.renderTableView();
  v('tableau : une seule ligne de sous-tâche', d.querySelectorAll('.subtask-row[data-parent="1"]').length === 1);

  await w.archiveSubtask(2, 1, false);
  v('restaurer la remet dans la liste', w.getTaskSubtasks(1).length === 2 && w.getTaskSubtasks(1, true).length === 0);
  v('… avec son statut d’origine', w.subtasks.find(s => s.id === 2).Status === 'done' && w.subtasks.find(s => s.id === 2).Completed === true);

  await w.archiveCompletedSubtasks(1);
  v('« archiver les terminées » ne prend que les terminées', w.getTaskSubtasks(1).map(s => s.id).join() === '1' && w.getTaskSubtasks(1, true).map(s => s.id).join() === '2');
  v('plus rien de terminé : le bouton disparaît', !d.querySelector('.subtask-archive-all'));

  await w.deleteSubtask(2, 1);
  v('supprimer depuis l’archive', !g.base.PM_Subtasks.find(s => s.id === 2) && w.getTaskSubtasks(1, true).length === 0);
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
