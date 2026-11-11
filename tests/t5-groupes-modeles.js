// Une personne dans plusieurs groupes ; modèles portant un projet et des sous-tâches.
const { monter, rapport, baseMinimale } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const base = baseMinimale();
  base.PM_Templates = [{ id: 1, Title: 'Marché de travaux', Description: 'Procédure adaptée', Priority: 'high', Category: 'Études', Estimated_Hours: 4, Group_Name: 'Travaux', Tag: 'Urgent', Recurrence: 'none', Usage_Count: 0, Updated_At: 0 }];
  const { w, d, g, erreurs, attendre } = await monter(base);
  v('aucune erreur', erreurs.length === 0, erreurs.join('|'));

  // ───── groupes ─────
  await w.openEditUserModal(2);
  const puces = id => [...d.querySelectorAll('#cp-' + id + ' .chip-picker-chip')].map(e => e.firstChild.textContent);
  v('Bob : son groupe actuel en étiquette', puces('user-group').join('|') === 'Juridique', puces('user-group').join('|'));
  w.chipPickerAdd('user-group', 'Travaux');
  await w.updateUser(2);
  v('Bob appartient maintenant à deux groupes', g.base.PM_Users.find(u => u.id === 2).Group_Name === 'Juridique, Travaux', g.base.PM_Users.find(u => u.id === 2).Group_Name);
  v('lu comme deux groupes', w.getUserGroups(w.users.find(u => u.id === 2)).join('|') === 'Juridique|Travaux');
  w.switchTab('team');
  const cartes = [...d.querySelectorAll('#groups-list .template-card')].map(c => c.textContent);
  v('Bob compte dans « Travaux »', cartes.find(c => c.includes('Travaux')).includes('Bob') && /2 /.test(cartes.find(c => c.includes('Travaux'))), cartes.find(c => c.includes('Travaux')).slice(0, 60));
  v('… et toujours dans « Juridique »', cartes.find(c => c.includes('Juridique')).includes('Bob'));
  const ligneBob = [...d.querySelectorAll('#users-list tr')].find(tr => tr.textContent.includes('bob@x.fr'));
  v('la liste des membres affiche ses deux groupes', ligneBob.querySelectorAll('.assignee-chip').length === 2);
  w.toggleFilterValue('group', 'Travaux');
  v('filtre « Travaux » : les tâches de Bob y entrent', w.getFilteredTasks().map(t => t.id).sort().join() === '1,2', w.getFilteredTasks().map(t => t.id).sort().join());
  w.resetFilters();

  w.openNewGroupModal(); d.getElementById('group-name').value = 'A, B';
  const avant = g.base.PM_Groups.length; await w.createGroup();
  v('un nom de groupe avec virgule est refusé', g.base.PM_Groups.length === avant);
  w.closeModalForce();

  await w.openNewUserModal();
  d.getElementById('user-name').value = 'Chloé'; d.getElementById('user-email').value = 'chloe@x.fr';
  w.chipPickerAdd('user-group', 'Travaux'); w.chipPickerAdd('user-group', 'Juridique');
  await w.createUser();
  v('nouvelle personne créée dans deux groupes', (g.base.PM_Users.find(u => u.Name === 'Chloé') || {}).Group_Name === 'Travaux, Juridique', (g.base.PM_Users.find(u => u.Name === 'Chloé') || {}).Group_Name);

  // ───── modèles ─────
  v('migration : Project_Id et Subtasks sur les modèles', !!g.cols.PM_Templates.Project_Id && !!g.cols.PM_Templates.Subtasks);
  w.openNewTemplateModal(1);
  v('la modale propose projet, tags et sous-tâches', !!d.getElementById('tpl-project') && !!d.getElementById('tpl-subtasks') && puces('tpl-tag').join() === 'Urgent');
  d.getElementById('tpl-project').value = '2';
  d.getElementById('tpl-subtasks').value = 'Rédiger le cahier des charges\n\n  Consulter les entreprises  \nAnalyser les offres\n';
  w.chipPickerAdd('tpl-tag', 'Budget');
  await w.updateTemplate(1);
  const tpl = g.base.PM_Templates[0];
  v('modèle : projet enregistré', tpl.Project_Id === 2, tpl.Project_Id);
  v('modèle : sous-tâches nettoyées, une par ligne', tpl.Subtasks === 'Rédiger le cahier des charges\nConsulter les entreprises\nAnalyser les offres', JSON.stringify(tpl.Subtasks));
  v('modèle : plusieurs tags', tpl.Tag === 'Urgent, Budget', tpl.Tag);
  w.switchTab('templates');
  const carte = d.querySelector('#templates-list .template-card').textContent;
  v('la carte du modèle annonce projet et sous-tâches', /Voirie/.test(carte) && /3 sous-tâches/.test(carte), carte.slice(0, 110));

  // utiliser le modèle alors qu'un autre projet est filtré
  w.filterByProject(1);
  await w.useTemplate(1); await attendre(5);
  const nouvelle = g.base.PM_Tasks[g.base.PM_Tasks.length - 1];
  v('tâche créée depuis le modèle', nouvelle.Title === 'Marché de travaux' && nouvelle.Tag === 'Urgent, Budget', nouvelle.Title + ' / ' + nouvelle.Tag);
  v('… rattachée au projet du modèle, pas au projet filtré', nouvelle.Project_Id === 2, nouvelle.Project_Id);
  const sts = g.base.PM_Subtasks.filter(s => s.Parent_Task_Id === nouvelle.id);
  v('… avec ses trois sous-tâches, dans l’ordre', sts.map(s => s.Title).join('|') === 'Rédiger le cahier des charges|Consulter les entreprises|Analyser les offres' && sts.map(s => s.Order).join() === '1,2,3', sts.map(s => s.Title).join('|'));
  v('la modale d’édition les affiche', d.querySelectorAll('#subtasks-list .subtask-item').length === 3);
  v('le compteur d’utilisations a augmenté', g.base.PM_Templates[0].Usage_Count === 1);

  // abandon du brouillon : titre effacé puis fermeture
  d.getElementById('task-title').value = '';
  w.closeModalForce(); await attendre(20);
  v('brouillon abandonné : la tâche est retirée', !g.base.PM_Tasks.find(t => t.id === nouvelle.id));
  v('… et ses sous-tâches avec elle', g.base.PM_Subtasks.filter(s => s.Parent_Task_Id === nouvelle.id).length === 0);

  // projet du modèle supprimé entre-temps
  g.base.PM_Projects = g.base.PM_Projects.filter(p => p.id !== 2); await w.loadAllData();
  w.filterByProject(null);
  await w.useTemplate(1); await attendre(5);
  const autre = g.base.PM_Tasks[g.base.PM_Tasks.length - 1];
  v('projet du modèle disparu : la tâche n’est pas rattachée à un fantôme', !autre.Project_Id, autre.Project_Id);
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
