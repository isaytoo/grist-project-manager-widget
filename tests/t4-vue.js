// Tri du Kanban personnel, et vue par défaut propre à chaque utilisateur.
const { monter, rapport, baseMinimale } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  {
    const { w, d, g } = await monter(baseMinimale());
    v('table PM_UserViews créée', !!g.base.PM_UserViews);

    // --- le tri du Kanban ne s'écrit plus dans le document ---
    g.journal.length = 0;
    w.setKanbanSort('alpha');
    v('changer le tri n’écrit rien dans PM_Settings', !g.journal.some(a => a[1] === 'PM_Settings'), g.journal.map(a => a[0] + ' ' + a[1]).join(','));
    v('… il est gardé pour l’utilisateur', JSON.parse(w.localStorage.getItem(w.viewPrefsStorageKey())).kanbanSort === 'alpha' && /said@x\.fr/.test(w.viewPrefsStorageKey()), w.viewPrefsStorageKey());

    // --- pas encore de vue par défaut ---
    v('sans vue par défaut : étoile vide', d.querySelector('.default-view-btns').textContent.includes('☆'));
    w.applyMyDefaultView();
    v('« Ma vue » sans vue enregistrée ouvre le réglage', /Ma vue par défaut/.test(d.getElementById('modal-container').textContent));
    v('… qui dit qu’il n’y en a aucune', !!d.querySelector('.view-none'));
    w.closeModalForce();

    // --- composer une vue et l'enregistrer ---
    w.switchTab('kanban');
    w.toggleFilterValue('tag', 'Budget'); w.toggleFilterValue('group', 'Travaux');
    w.setKanbanGroupBy('priority'); w.setCalendarMode('week'); w.toggleKanbanCol('low');
    w.openDefaultViewModal();
    const resume = d.querySelector('.view-summary').textContent;
    v('le résumé décrit la vue affichée', /Kanban/.test(resume) && /Budget/.test(resume) && /Travaux/.test(resume) && /priorité/.test(resume) && /semaine/.test(resume), resume.slice(0, 140));
    await w.saveDefaultViewFromModal();
    const ligne = g.base.PM_UserViews[0];
    v('la vue est écrite dans le document, à mon nom', !!ligne && ligne.User_Email === 'said@x.fr', ligne && ligne.User_Email);
    const vue = JSON.parse(ligne.View_Json);
    v('elle porte onglet, filtres, tri et regroupement', vue.tab === 'kanban' && vue.filters.tags.join() === 'Budget' && vue.filters.groups.join() === 'Travaux' && vue.kanbanGroupBy === 'priority' && vue.kanbanSort === 'alpha' && vue.calendarMode === 'week' && vue.collapsedCols.join() === 'low', ligne.View_Json.slice(0, 120));
    v('étoile pleine une fois enregistrée', d.querySelector('.default-view-btns').textContent.includes('⭐'));

    // --- tout changer, puis revenir d'un clic ---
    w.resetFilters(); w.setKanbanGroupBy('status'); w.setKanbanSort('due'); w.setCalendarMode('month'); w.switchTab('table');
    w.applyMyDefaultView();
    v('« Ma vue » rétablit les filtres', w.currentFilterTags.join() === 'Budget' && w.currentFilterGroups.join() === 'Travaux');
    v('… le tri et le regroupement', w.kanbanSort === 'alpha' && w.kanbanGroupBy === 'priority');
    v('… l’onglet', w.activeTabId() === 'kanban', w.activeTabId());
    v('… le mode du calendrier et la colonne repliée', w.calendarMode === 'week' && w.collapsedKanbanCols.low === true);
    v('… et les listes déroulantes suivent', d.getElementById('kanban-sort').value === 'alpha' && d.getElementById('kanban-groupby').value === 'priority');

    // --- enregistrer une seconde fois met à jour, sans doublon ---
    w.toggleFilterValue('tag', 'Urgent');
    await w.saveMyDefaultView(w.currentViewSnapshot());
    v('une seule ligne par utilisateur', g.base.PM_UserViews.length === 1 && JSON.parse(g.base.PM_UserViews[0].View_Json).filters.tags.length === 2);

    // --- suppression ---
    w.openDefaultViewModal(); await w.removeDefaultViewFromModal();
    v('supprimer retire la ligne', g.base.PM_UserViews.length === 0 && !w.getMyDefaultView());
  }
  {
    // --- à l'ouverture, la vue par défaut l'emporte ; celle d'un collègue ne me concerne pas ---
    const base = baseMinimale();
    const maVue = { v: 1, tab: 'table', filters: { tags: ['Urgent'], roles: [], assignees: [], groups: [], categories: [], healths: [], custom: {} }, projectId: null, mineOnly: false, kanbanSort: 'due', kanbanGroupBy: 'status', collapsedCols: [], calendarMode: 'day', ganttMode: 'months', ganttSort: 'default', tableSort: { field: 'Title', asc: false }, tableStatuses: ['todo', 'statut-supprime'], tablePriorities: [] };
    base.PM_UserViews = [
      { id: 1, User_Email: 'ana@x.fr', View_Json: JSON.stringify(Object.assign({}, maVue, { tab: 'gantt' })), Updated_At: 0 },
      { id: 2, User_Email: 'SAID@x.fr', View_Json: JSON.stringify(maVue), Updated_At: 0 }
    ];
    const { w } = await monter(base, { stockage: { 'pm-filters:doc-test': JSON.stringify({ tags: ['Budget'] }), 'pm-active-tab': 'kanban' } });
    v('ouverture : ma vue par défaut, pas le dernier état', w.currentFilterTags.join() === 'Urgent' && w.activeTabId() === 'table', w.currentFilterTags.join() + ' / ' + w.activeTabId());
    v('… retrouvée malgré la casse de l’email', w.calendarMode === 'day' && w.kanbanSort === 'due');
    v('… un statut supprimé depuis est écarté', w.tableFilterStatuses.join() === 'todo', w.tableFilterStatuses.join());
    v('… la vue d’Ana n’est pas la mienne', w.activeTabId() !== 'gantt');
  }
  {
    // --- lecteur sans droit d'écriture : la vue reste sur le navigateur ---
    const { w, g } = await monter(baseMinimale(), { proprietaire: false, refuser: a => a[1] === 'PM_UserViews' && a[0] !== 'AddTable' });
    w.toggleFilterValue('tag', 'Budget');
    const ou = await w.saveMyDefaultView(w.currentViewSnapshot());
    v('écriture refusée : repli annoncé sur le navigateur', ou === 'navigateur' && g.base.PM_UserViews.length === 0, ou);
    w.resetFilters();
    v('… la vue reste utilisable', !!w.getMyDefaultView() && (w.applyMyDefaultView(), w.currentFilterTags.join() === 'Budget'));
  }
  {
    // --- un autre utilisateur sur le même navigateur ne récupère pas mon tri ---
    const a = await monter(baseMinimale(), { email: 'said@x.fr' });
    a.w.setKanbanSort('alpha');
    const stock = {}; for (let i = 0; i < a.w.localStorage.length; i++) { const k = a.w.localStorage.key(i); stock[k] = a.w.localStorage.getItem(k); }
    const b = await monter(baseMinimale(), { email: 'bob@x.fr', stockage: stock });
    v('même navigateur, autre compte : son tri n’est pas le mien', b.w.kanbanSort === 'manual', b.w.kanbanSort);
  }
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
