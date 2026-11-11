// Plusieurs tags par tâche, et météo (avance bien / risque / arrêtée).
const { monter, rapport, baseMinimale } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  {
    const { w, d, g, erreurs } = await monter(baseMinimale());
    v('aucune erreur au chargement', erreurs.length === 0, erreurs.join(' | '));
    v('migration : colonne Health sur les tâches', !!g.cols.PM_Tasks.Health);
    v('migration : colonne Archived sur les sous-tâches', !!g.cols.PM_Subtasks.Archived);

    w.openEditTaskModal(1);
    const puces = () => [...d.querySelectorAll('#cp-task-tag .chip-picker-chip')].map(e => e.firstChild.textContent);
    v('la tâche montre ses deux tags', puces().join('|') === 'Urgent|Budget', puces().join('|'));
    v('le champ caché porte la liste', d.getElementById('task-tag').value === 'Urgent, Budget', d.getElementById('task-tag').value);
    const restants = () => [...d.querySelectorAll('#cp-task-tag select option')].map(o => o.value).filter(Boolean);
    v('la liste ne propose que les tags restants', restants().join('|') === 'Archive', restants().join('|'));
    w.chipPickerAdd('task-tag', 'Archive');
    v('ajout d’un troisième tag', d.getElementById('task-tag').value === 'Urgent, Budget, Archive', d.getElementById('task-tag').value);
    v('plus rien à proposer : la liste disparaît', !d.querySelector('#cp-task-tag select'));
    w.chipPickerRemove('task-tag', 0);
    v('retrait du premier', d.getElementById('task-tag').value === 'Budget, Archive', d.getElementById('task-tag').value);

    const pills = [...d.querySelectorAll('[data-health]')];
    v('trois états de météo proposés', pills.length === 3, pills.map(p => p.textContent).join(' / '));
    w.setTaskHealth('blocked', pills.find(p => p.dataset.health === 'blocked'));
    v('état retenu', d.getElementById('task-health').value === 'blocked');
    v('une seule pastille active', d.querySelectorAll('[data-health].active-progress').length === 1);

    g.journal.length = 0;
    await w.updateTask(1);
    const maj = g.journal.find(a => a[0] === 'UpdateRecord' && a[1] === 'PM_Tasks' && a[2] === 1);
    v('enregistrement : tags', maj && maj[3].Tag === 'Budget, Archive', maj && maj[3].Tag);
    v('enregistrement : météo', maj && maj[3].Health === 'blocked', maj && maj[3].Health);

    w.renderKanbanView();
    const carte = d.querySelector('.task-card[data-id="1"]');
    v('la carte affiche l’orage', !!carte.querySelector('.health-badge') && carte.querySelector('.health-badge').textContent === '⛈️');
    v('la carte affiche les deux tags', carte.textContent.includes('Budget') && carte.textContent.includes('Archive'));
    v('une tâche sans météo n’a pas de signe', !d.querySelector('.task-card[data-id="2"] .health-badge'));

    w.openEditTaskModal(1);
    const p2 = [...d.querySelectorAll('[data-health]')].find(p => p.dataset.health === 'blocked');
    v('la modale rouvre sur l’état enregistré', p2.classList.contains('active-progress'));
    w.setTaskHealth('blocked', p2);
    v('recliquer sur l’état actif le retire', d.getElementById('task-health').value === '' && !d.querySelector('[data-health].active-progress'));
    w.closeModalForce();

    w.cardDisplaySettings.health = false; w.renderKanbanView();
    v('réglage « météo » décoché : plus de signe sur la carte', !d.querySelector('.task-card[data-id="1"] .health-badge'));

    g.base.PM_Tags = g.base.PM_Tags.filter(t => t.Name !== 'Archive'); await w.loadAllData();
    w.openEditTaskModal(1);
    v('un tag supprimé reste affiché sur la tâche', puces().join('|') === 'Budget|Archive', puces().join('|'));
    g.journal.length = 0; await w.updateTask(1);
    const maj2 = g.journal.find(a => a[0] === 'UpdateRecord' && a[1] === 'PM_Tasks');
    v('… et n’est pas effacé à l’enregistrement', maj2 && maj2[3].Tag === 'Budget, Archive', maj2 && maj2[3].Tag);
  }
  {
    // Sans droit de modifier la structure : pas de colonne, donc pas d'écriture dedans
    const { w, d, g } = await monter(baseMinimale(), { proprietaire: false, refuser: a => a[0] === 'AddColumn' || a[0] === 'AddTable' });
    v('sans droit de structure : pas de colonne Health', !g.cols.PM_Tasks.Health && w.hasHealthColumn === false);
    w.openEditTaskModal(1);
    v('… la modale ne propose pas la météo', !d.getElementById('task-health'));
    v('… ni l’archive de sous-tâches', !d.querySelector('.subtask-archive'));
    d.getElementById('task-title').value = 'Titre modifié';
    g.journal.length = 0; await w.updateTask(1);
    const maj = g.journal.find(a => a[0] === 'UpdateRecord' && a[1] === 'PM_Tasks');
    v('… l’enregistrement ne touche pas à Health', !!maj && !('Health' in maj[3]));
    v('… et il aboutit réellement dans le document', g.base.PM_Tasks.find(t => t.id === 1).Title === 'Titre modifié', g.base.PM_Tasks.find(t => t.id === 1).Title);
  }
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
