// Filtres à choix multiples : rôle, personne, groupe, catégorie, tag, champs personnalisés.
const { monter, rapport, baseMinimale, J } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const base = baseMinimale();
  const t0 = base.PM_Tasks[0].Start_Date;
  base.PM_Tags.push({ id: 4, Name: 'R&D <test> "x"', Color: '#000' });
  base.PM_Tasks.push(Object.assign({}, base.PM_Tasks[2], { id: 4, Title: 'Brevet', Status: 'todo', Assignee: 'Said', Group_Name: '', Category: 'Études', Tag: 'R&D <test> "x"' }));
  base.PM_CustomFields.push({ id: 3, Name: 'Réception', Type: 'date', Options: '', Order: 3, Created_At: t0 });
  base.PM_CustomFieldValues.push({ id: 4, Task_Id: 1, Field_Id: 3, Value: String(t0 + 5 * J) }, { id: 5, Task_Id: 4, Field_Id: 3, Value: String(t0 + 40 * J) });
  const { w, d, erreurs } = await monter(base);
  const ids = () => w.getFilteredTasks().map(t => t.id).sort().join(',');
  const libelles = kind => [...d.querySelectorAll('#fc-list-' + kind + ' .filter-combo-opt:not(.fc-clear)')].map(e => e.dataset.label);
  const clic = (kind, valeur) => { const el = [...d.querySelectorAll('#fc-list-' + kind + ' .filter-combo-opt')].find(e => e.getAttribute('data-value') === valeur); if (!el) throw new Error('option absente : ' + kind + '/' + valeur); el.click(); };
  const champ = (id, valeur) => [...d.querySelectorAll('#fc-list-custom .filter-combo-opt')].find(e => e.dataset.field === String(id) && e.getAttribute('data-value') === valeur).click();

  v('aucune erreur', erreurs.length === 0, erreurs.join('|'));
  v('sans filtre : tout', ids() === '1,2,3,4', ids());
  v('tags par ordre alphabétique', libelles('tag').join('|') === 'Archive|Budget|R&D <test> "x"|Urgent', libelles('tag').join('|'));
  v('personnes par ordre alphabétique', libelles('person').join('|') === 'Ana|Bob|Said', libelles('person').join('|'));

  w.toggleFilterCombo('tag'); clic('tag', 'Budget');
  v('tag « Budget » : les deux tâches qui le portent', ids() === '1,2', ids());
  v('la liste est restée ouverte après le clic', d.getElementById('fc-dd-tag').classList.contains('show'));
  v('la case est cochée', d.querySelector('#fc-list-tag .filter-combo-opt.selected .fc-check').textContent === '☑');
  clic('tag', 'R&D <test> "x"');
  v('deux tags cochés : l’un OU l’autre', ids() === '1,2,4', ids());
  v('un tag à caractères spéciaux arrive intact', w.currentFilterTags.indexOf('R&D <test> "x"') !== -1);
  v('le bouton annonce le nombre', d.querySelector('#fc-btn-tag .filter-combo-label').textContent === 'Tag (2)', d.querySelector('#fc-btn-tag .filter-combo-label').textContent);
  v('rien n’est injecté dans la page', !d.querySelector('test'));

  w.toggleFilterCombo('category'); clic('category', 'Études');
  v('ET catégorie « Études »', ids() === '1,4', ids());
  const bandeau = d.getElementById('project-filter-banner').textContent;
  v('bandeau : les deux critères', /Études/.test(bandeau) && /Budget/.test(bandeau), bandeau.slice(0, 80));
  clic('category', 'Études');
  v('décocher retire le critère', ids() === '1,2,4', ids());
  d.querySelector('#fc-list-tag .fc-clear').click();
  v('« Effacer » vide le critère', w.currentFilterTags.length === 0 && ids() === '1,2,3,4', ids());

  w.toggleFilterValue('person', 'bob@x.fr');
  v('personne : tâche assignée par le nom, filtrée par l’email', ids() === '2', ids());
  w.toggleFilterValue('person', 'ana@x.fr');
  v('deux personnes', ids() === '1,2', ids());
  w.resetFilters();

  v('filtre Groupe proposé', libelles('group').join('|') === 'Juridique|Travaux', libelles('group').join('|'));
  w.toggleFilterValue('group', 'Juridique');
  v('groupe : tâche confiée au groupe (3) et tâche d’un membre (2)', ids() === '2,3', ids());
  v('les personnes proposées se limitent au groupe', libelles('person').join('|') === 'Bob', libelles('person').join('|'));
  w.resetFilters();

  w.toggleFilterValue('person', 'bob@x.fr'); w.toggleFilterValue('role', 'admin');
  v('choisir un rôle retire la personne qui ne l’a pas', w.currentFilterAssignees.length === 0);
  v('rôle admin : tâches d’Ana et de Said', ids() === '1,4', ids());
  w.resetFilters();

  const sections = [...d.querySelectorAll('#fc-list-custom .fc-section')].map(e => e.textContent);
  v('champs personnalisés : une section par champ', sections.join('|') === 'Lot|Validé|Réception', sections.join('|'));
  w.toggleFilterCombo('custom'); champ(1, 'Gros œuvre');
  v('champ liste « Lot = Gros œuvre »', ids() === '1', ids());
  champ(1, 'Second œuvre');
  v('deux valeurs du même champ', ids() === '1,2', ids());
  champ(2, 'true');
  v('ET case « Validé = Oui »', ids() === '2', ids());
  v('bouton : deux champs actifs', d.querySelector('#fc-btn-custom .filter-combo-label').textContent === 'Champs (2)', d.querySelector('#fc-btn-custom .filter-combo-label').textContent);
  w.clearCustomFilters(); champ(2, 'false');
  v('case « Non » : y compris les tâches jamais renseignées', ids() === '1,3,4', ids());
  w.clearCustomFilters();
  const iso = ts => { const x = new Date(ts * 1000); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  w.setCustomDateFilter(3, 'from', iso(t0)); w.setCustomDateFilter(3, 'to', iso(t0 + 5 * J));
  v('champ date : plage, bornes incluses', ids() === '1', ids());
  w.setCustomDateFilter(3, 'to', '');
  v('champ date : seulement « à partir du »', ids() === '1,4', ids());
  w.resetFilters();
  v('réinitialiser vide aussi les champs', !w.anyFilterActive() && ids() === '1,2,3,4');

  w.toggleFilterCombo('custom'); w.filterComboSearch('custom', 'gros');
  const visibles = [...d.querySelectorAll('#fc-list-custom .fc-section')].filter(e => e.style.display !== 'none').map(e => e.textContent);
  v('la recherche ne garde que la section concernée', visibles.join('|') === 'Lot', visibles.join('|'));

  w.toggleFilterValue('tag', 'Urgent'); w.toggleFilterValue('group', 'Travaux');
  const cle = w.filtersStorageKey();
  const stocke = JSON.parse(w.localStorage.getItem(cle));
  v('filtres mémorisés par document', stocke.tags.join() === 'Urgent' && stocke.groups.join() === 'Travaux' && /doc-test/.test(cle), cle);
  w.applyFiltersSnapshot({}); w.restoreFilters();
  v('… et restaurés', w.currentFilterTags.join() === 'Urgent' && w.currentFilterGroups.join() === 'Travaux');
  w.localStorage.setItem(cle, JSON.stringify({ role: 'admin', assignee: 'ana@x.fr', category: 'Études', tag: 'Budget', mineOnly: false }));
  w.restoreFilters();
  v('l’ancien format à valeur unique est repris', w.currentFilterRoles.join() === 'admin' && w.currentFilterAssignees.join() === 'ana@x.fr' && w.currentFilterCategories.join() === 'Études' && w.currentFilterTags.join() === 'Budget');
  w.localStorage.setItem(cle, JSON.stringify({ tags: ['Disparu', 'Budget'], groups: ['Fantôme'], custom: { 99: ['x'], 1: ['Inconnue', 'Gros œuvre'] } }));
  w.restoreFilters();
  v('une valeur absente du document est écartée', w.currentFilterTags.join() === 'Budget' && w.currentFilterGroups.length === 0 && !w.currentFilterCustom[99] && w.currentFilterCustom[1].join() === 'Gros œuvre');
  w.resetFilters();

  w.toggleFilterValue('tag', 'Urgent');
  w.switchTab('kanban');
  v('le Kanban suit le filtre', d.querySelectorAll('.task-card').length === 1, d.querySelectorAll('.task-card').length);
  w.switchTab('table');
  v('le tableau aussi', d.querySelectorAll('tr.task-row').length === 1, d.querySelectorAll('tr.task-row').length);
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
