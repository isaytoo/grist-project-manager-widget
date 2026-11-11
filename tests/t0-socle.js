// Non-régression : chaque onglet et chaque modale se dessine sans erreur.
const { monter, rapport, baseMinimale } = require('./harnais');
(async () => {
  const res = []; const v = (n, ok, det) => res.push([n, ok, det]);
  const { w, d, erreurs } = await monter(baseMinimale());
  v('le script se charge sans erreur', erreurs.length === 0, erreurs.join(' | '));
  v('la version s’affiche près du titre et en pied de page', /^v\d+$/.test(d.getElementById('widget-version').textContent) && d.getElementById('widget-version-footer').textContent === w.WIDGET_VERSION, d.getElementById('widget-version').textContent);
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  v('… et correspond au ?v= de index.html', (html.match(/widget\.js\?v=(\d+)/) || [])[1] === w.WIDGET_VERSION.slice(1), (html.match(/widget\.js\?v=(\d+)/) || [])[1] + ' / ' + w.WIDGET_VERSION);
  for (const tab of ['calendar', 'kanban', 'table', 'gantt', 'templates', 'stats', 'team', 'settings']) {
    let err = null; try { w.switchTab(tab); } catch (e) { err = e; }
    v('onglet ' + tab, !err && erreurs.length === 0, err ? err.message : erreurs.join('|'));
  }
  for (const mode of ['month', 'week', 'day']) { let err = null; try { w.switchTab('calendar'); w.setCalendarMode(mode); } catch (e) { err = e; } v('calendrier ' + mode, !err, err && err.message); }
  for (const mode of ['days', 'weeks', 'months', 'year', 'twoyears', 'custom']) { let err = null; try { w.switchTab('gantt'); w.setGanttMode(mode); } catch (e) { err = e; } v('gantt ' + mode, !err, err && err.message); }
  for (const g of ['status', 'priority', 'project']) { let err = null; try { w.switchTab('kanban'); w.setKanbanGroupBy(g); } catch (e) { err = e; } v('kanban groupé par ' + g, !err && d.querySelectorAll('.task-card').length === 3, err && err.message); }
  let err = null;
  try { w.openEditTaskModal(1); w.closeModalForce(); w.openNewTemplateModal(); w.closeModalForce(); w.openNewGroupModal(); w.closeModalForce(); w.openDefaultViewModal(); w.closeModalForce(); w.openCustomFieldsModal(); w.closeModalForce(); } catch (e) { err = e; }
  v('les modales s’ouvrent', !err, err && err.stack);
  w.setLang('en'); w.renderProjectSelector(); w.switchTab('kanban'); w.openEditTaskModal(1);
  v('en anglais aussi', erreurs.length === 0 && /Health/.test(d.getElementById('modal-container').textContent) && /Group/.test(d.getElementById('project-selector').textContent));
  w.closeModalForce(); w.setLang('fr');
  w.toggleArchiveView(); v('vue des archives', erreurs.length === 0); w.toggleArchiveView();
  rapport(res);
})().catch(e => { console.error(e); process.exit(1); });
