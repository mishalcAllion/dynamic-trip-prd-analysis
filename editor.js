// editor.js -- CRUD form engine for editing ticket data
// Depends on data.js (loadData, saveData, resetData)

window.Editor = {
  currentTab: 'tickets',
  data: null,
  _saveTimer: null,
  _expandedTicket: null,
  _expandedTeam: null,
  _expandedRisk: null,

  // =========================================================================
  // Init & Tab Switching
  // =========================================================================

  init() {
    this.data = loadData();
    this.renderTabBar();
    this.switchTab(this.currentTab);
  },

  switchTab(tab) {
    this.currentTab = tab;
    this._expandedTicket = null;
    this._expandedTeam = null;
    this._expandedRisk = null;
    this.renderTabBar();

    const content = document.getElementById('editor-content');
    if (!content) return;

    switch (tab) {
      case 'tickets': this.renderTicketsTab(); break;
      case 'team': this.renderTeamTab(); break;
      case 'risks': this.renderRisksTab(); break;
      case 'import-export': this.renderImportExportTab(); break;
    }
  },

  renderTabBar() {
    const bar = document.getElementById('editor-tabs');
    if (!bar) return;

    const tabs = [
      { id: 'tickets', label: 'Tickets', count: this.data ? this.data.tickets.length : 0 },
      { id: 'team', label: 'Team', count: this.data ? this.data.team.length : 0 },
      { id: 'risks', label: 'Risks', count: this.data ? this.data.risks.length : 0 },
      { id: 'import-export', label: 'Import / Export', count: null },
    ];

    bar.innerHTML = `
      <div class="flex items-center gap-1 border-b border-slate-800">
        ${tabs.map(t => {
          const active = this.currentTab === t.id;
          return `
            <button onclick="Editor.switchTab('${t.id}')"
              class="px-4 py-3 text-sm font-medium transition-colors border-b-2 ${active
                ? 'border-blue-400 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'}">
              ${t.label}${t.count !== null ? ` <span class="ml-1 text-xs font-mono ${active ? 'text-blue-400' : 'text-slate-600'}">${t.count}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  // =========================================================================
  // Auto-Save with Debounce
  // =========================================================================

  _debounceSave() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      computeTotals(this.data);
      saveData(this.data);
      this.showToast('Saved');
    }, 500);
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colorMap = {
      success: 'bg-green-500/10 border-green-500/30 text-green-400',
      error: 'bg-red-500/10 border-red-500/30 text-red-400',
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    };

    toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${colorMap[type] || colorMap.success} shadow-lg backdrop-blur-sm transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' : ''}
        ${type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' : ''}
        ${type === 'info' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' : ''}
      </svg>
      ${message}
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Animate out and remove
    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  // =========================================================================
  // Shared Form Helpers
  // =========================================================================

  _input(id, label, value, type = 'text', extra = '') {
    return `
      <div class="space-y-1">
        <label for="${id}" class="text-slate-400 text-xs uppercase tracking-wider font-medium block">${label}</label>
        <input type="${type}" id="${id}" value="${this._esc(value)}" ${extra}
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors placeholder-slate-600"
        />
      </div>
    `;
  },

  _textarea(id, label, value, rows = 3) {
    return `
      <div class="space-y-1">
        <label for="${id}" class="text-slate-400 text-xs uppercase tracking-wider font-medium block">${label}</label>
        <textarea id="${id}" rows="${rows}"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none placeholder-slate-600"
        >${this._esc(value)}</textarea>
      </div>
    `;
  },

  _select(id, label, value, options) {
    return `
      <div class="space-y-1">
        <label for="${id}" class="text-slate-400 text-xs uppercase tracking-wider font-medium block">${label}</label>
        <select id="${id}"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors">
          ${options.map(o => `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </div>
    `;
  },

  _checkbox(id, label, checked) {
    return `
      <label for="${id}" class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}
          class="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
        />
        <span class="text-sm text-slate-300">${label}</span>
      </label>
    `;
  },

  _esc(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  _groupOptions() {
    return (this.data.groups || []).map(g => ({ value: g.id, label: g.label }));
  },

  _teamOptions() {
    return [{ value: '', label: '-- Unassigned --' }, ...(this.data.team || []).map(m => ({ value: m.id, label: m.name }))];
  },

  // =========================================================================
  // TICKETS TAB
  // =========================================================================

  renderTicketsTab() {
    const content = document.getElementById('editor-content');
    if (!content) return;

    const ticketsByGroup = {};
    this.data.groups.forEach(g => { ticketsByGroup[g.id] = []; });
    this.data.tickets.forEach(t => {
      if (ticketsByGroup[t.group]) ticketsByGroup[t.group].push(t);
    });

    let html = `
      <div class="mb-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">${this.data.tickets.length} tickets, ${this.data.tickets.reduce((s, t) => s + (t.subIssues || []).length, 0)} sub-issues</div>
        <button onclick="Editor.addTicket()"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add New Ticket
        </button>
      </div>
    `;

    this.data.groups.forEach(group => {
      const gc = Theme.groupColor(group.id);
      const tickets = ticketsByGroup[group.id] || [];
      if (tickets.length === 0) return;

      html += `
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2.5 h-2.5 rounded-full ${gc.dot}"></span>
            <span class="text-sm font-semibold text-slate-200">${group.label}</span>
            <span class="text-xs text-slate-600 font-mono">${tickets.length}</span>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <!-- Table header -->
            <div class="grid grid-cols-[80px_1fr_120px_90px_80px_60px] gap-2 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider font-medium">
              <div>ID</div>
              <div>Title</div>
              <div>Assignee</div>
              <div>Points</div>
              <div>Subs</div>
              <div></div>
            </div>

            ${tickets.map(t => this._renderTicketRow(t, gc)).join('')}
          </div>
        </div>
      `;
    });

    content.innerHTML = html;
  },

  _renderTicketRow(ticket, gc) {
    const isExpanded = this._expandedTicket === ticket.id;
    const subCount = (ticket.subIssues || []).length;
    const assignee = this.data.team.find(m => m.id === ticket.assignee);
    const title = ticket.title.length > 50 ? ticket.title.substring(0, 50) + '...' : ticket.title;

    let row = `
      <div class="border-b border-slate-800/50 last:border-b-0">
        <div class="grid grid-cols-[80px_1fr_120px_90px_80px_60px] gap-2 px-4 py-3 items-center hover:bg-slate-800/30 transition-colors cursor-pointer"
             onclick="Editor.toggleTicketForm('${ticket.id}')">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full ${gc.dot}"></span>
            <span class="font-mono text-xs ${gc.text}">${ticket.id}</span>
          </div>
          <div class="text-sm text-slate-300 truncate">${Theme.escapeHtml(title)}</div>
          <div>${assignee ? Theme.assigneeBadge(ticket.assignee) : '<span class="text-xs text-slate-600">Unassigned</span>'}</div>
          <div class="font-mono text-xs text-slate-400">${ticket.pointsMin}-${ticket.pointsMax}</div>
          <div class="text-xs text-slate-500">${subCount} sub${subCount !== 1 ? 's' : ''}</div>
          <div class="flex items-center justify-end gap-1">
            <button onclick="event.stopPropagation(); Editor.toggleTicketForm('${ticket.id}')" class="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
        </div>
        ${isExpanded ? this.renderTicketForm(ticket.id) : ''}
      </div>
    `;
    return row;
  },

  toggleTicketForm(ticketId) {
    if (this._expandedTicket === ticketId) {
      this._expandedTicket = null;
    } else {
      this._expandedTicket = ticketId;
    }
    this.renderTicketsTab();
  },

  renderTicketForm(ticketId) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return '';

    const prefix = `tf-${ticketId.replace(/\./g, '-')}`;
    const allTicketIds = this.data.tickets.map(t => t.id).filter(id => id !== ticketId);

    return `
      <div class="px-4 py-4 bg-slate-800/20 border-t border-slate-800/50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          ${this._input(`${prefix}-id`, 'Ticket ID', ticket.id, 'text', 'readonly class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 focus:outline-none cursor-not-allowed"')}
          ${this._input(`${prefix}-title`, 'Title', ticket.title)}
          ${this._select(`${prefix}-group`, 'Group', ticket.group, this._groupOptions())}
          ${this._select(`${prefix}-assignee`, 'Assignee', ticket.assignee || '', this._teamOptions())}
        </div>

        <div class="mb-4">
          ${this._textarea(`${prefix}-description`, 'Description', ticket.description || '', 2)}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          ${this._input(`${prefix}-pointsMin`, 'Points (Min)', ticket.pointsMin, 'number', 'min="0"')}
          ${this._input(`${prefix}-pointsMax`, 'Points (Max)', ticket.pointsMax, 'number', 'min="0"')}
          ${this._input(`${prefix}-ganttStart`, 'Start Date', ticket.ganttStart || '', 'date')}
          ${this._input(`${prefix}-ganttEnd`, 'End Date', ticket.ganttEnd || '', 'date')}
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          ${this._input(`${prefix}-dependencies`, 'Dependencies (comma-separated IDs)', (ticket.dependencies || []).join(', '))}
          ${this._input(`${prefix}-blocksTickets`, 'Blocks Tickets (comma-separated IDs)', (ticket.blocksTickets || []).join(', '))}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          ${this._input(`${prefix}-prdSection`, 'PRD Section', ticket.prdRef ? ticket.prdRef.section : '')}
          ${this._textarea(`${prefix}-prdExcerpt`, 'PRD Excerpt', ticket.prdRef ? ticket.prdRef.excerpt : '', 2)}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          ${this._input(`${prefix}-figmaNodeId`, 'Figma Node ID', ticket.figmaRef ? ticket.figmaRef.nodeId : '')}
          ${this._input(`${prefix}-figmaLabel`, 'Figma Label', ticket.figmaRef ? ticket.figmaRef.label : '')}
        </div>

        <div class="mb-4">
          ${this._textarea(`${prefix}-impactIfRemoved`, 'Impact If Removed', ticket.impactIfRemoved || '', 2)}
        </div>

        <div class="flex items-center gap-4 mb-6">
          ${this._checkbox(`${prefix}-isMvp`, 'MVP Ticket', ticket.isMvp)}
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-3 mb-6">
          <button onclick="Editor.saveTicketFromForm('${ticketId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Ticket
          </button>
          <button onclick="Editor.confirmDeleteTicket('${ticketId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>

        <!-- Sub-issues section -->
        ${this.renderSubIssuesTable(ticketId)}
      </div>
    `;
  },

  saveTicketFromForm(ticketId) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const prefix = `tf-${ticketId.replace(/\./g, '-')}`;
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const num = (id) => { const v = parseInt(val(id), 10); return isNaN(v) ? 0 : v; };
    const chk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
    const csvArr = (id) => val(id).split(',').map(s => s.trim()).filter(s => s);

    ticket.title = val(`${prefix}-title`);
    ticket.group = val(`${prefix}-group`);
    ticket.assignee = val(`${prefix}-assignee`) || null;
    ticket.description = val(`${prefix}-description`);
    ticket.pointsMin = num(`${prefix}-pointsMin`);
    ticket.pointsMax = num(`${prefix}-pointsMax`);
    ticket.ganttStart = val(`${prefix}-ganttStart`) || null;
    ticket.ganttEnd = val(`${prefix}-ganttEnd`) || null;
    ticket.dependencies = csvArr(`${prefix}-dependencies`);
    ticket.blocksTickets = csvArr(`${prefix}-blocksTickets`);
    ticket.isMvp = chk(`${prefix}-isMvp`);
    ticket.impactIfRemoved = val(`${prefix}-impactIfRemoved`) || null;

    // PRD ref
    const prdSection = val(`${prefix}-prdSection`);
    const prdExcerpt = val(`${prefix}-prdExcerpt`);
    ticket.prdRef = (prdSection || prdExcerpt) ? { section: prdSection, excerpt: prdExcerpt } : null;

    // Figma ref
    const figmaNodeId = val(`${prefix}-figmaNodeId`);
    const figmaLabel = val(`${prefix}-figmaLabel`);
    ticket.figmaRef = (figmaNodeId || figmaLabel) ? { nodeId: figmaNodeId, label: figmaLabel } : null;

    this._debounceSave();
    this.renderTabBar();
    this.renderTicketsTab();
  },

  addTicket() {
    // Generate next ID based on highest existing number in first group
    const existingIds = this.data.tickets.map(t => t.id);
    let nextNum = this.data.tickets.length + 1;
    const newId = `NEW-${nextNum}`;
    while (existingIds.includes(newId)) { nextNum++; }

    const newTicket = {
      id: `NEW-${nextNum}`,
      group: 'core',
      title: 'New Ticket',
      description: '',
      assignee: null,
      qaAssignee: 'thilini',
      pointsMin: 0,
      pointsMax: 0,
      isMvp: false,
      ganttStart: null,
      ganttEnd: null,
      dependencies: [],
      blocksTickets: [],
      prdRef: null,
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [],
    };

    this.data.tickets.push(newTicket);
    this._expandedTicket = newTicket.id;
    this._debounceSave();
    this.renderTabBar();
    this.renderTicketsTab();

    // Scroll to new ticket
    setTimeout(() => {
      const content = document.getElementById('editor-content');
      if (content) content.scrollTop = content.scrollHeight;
    }, 100);
  },

  confirmDeleteTicket(ticketId) {
    this._showConfirmModal(
      'Delete Ticket',
      `Are you sure you want to delete ticket <span class="font-mono text-blue-400">${ticketId}</span>? This will also delete all its sub-issues. This action cannot be undone.`,
      () => this.deleteTicket(ticketId)
    );
  },

  deleteTicket(ticketId) {
    const idx = this.data.tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return;

    this.data.tickets.splice(idx, 1);
    this._expandedTicket = null;
    this._debounceSave();
    this.renderTabBar();
    this.renderTicketsTab();
    this.showToast(`Ticket ${ticketId} deleted`, 'info');
  },

  // =========================================================================
  // SUB-ISSUES
  // =========================================================================

  renderSubIssuesTable(ticketId) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return '';

    const subs = ticket.subIssues || [];

    let subRows = '';
    if (subs.length === 0) {
      subRows = `<div class="px-4 py-6 text-center text-sm text-slate-600">No sub-issues yet.</div>`;
    } else {
      subRows = subs.map((sub, i) => `
        <div class="grid grid-cols-[60px_1fr_120px_90px_60px] gap-2 px-4 py-2.5 items-center border-b border-slate-800/30 last:border-b-0 hover:bg-slate-800/20">
          <div class="font-mono text-xs text-slate-500">${sub.id}</div>
          <div class="text-xs text-slate-300 truncate">${Theme.escapeHtml(sub.title || '')}</div>
          <div>${sub.assignee ? Theme.assigneeBadge(sub.assignee) : '<span class="text-xs text-slate-600">--</span>'}</div>
          <div class="font-mono text-xs text-slate-500">${sub.pointsMin || 0}-${sub.pointsMax || 0}</div>
          <div class="flex items-center justify-end gap-1">
            <button onclick="Editor.editSubIssue('${ticketId}', ${i})" class="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="Editor.confirmDeleteSubIssue('${ticketId}', ${i})" class="p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `).join('');
    }

    return `
      <div class="border-t border-slate-700 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sub-issues (${subs.length})</h4>
          <button onclick="Editor.addSubIssue('${ticketId}')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Sub-issue
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <!-- Sub-issue header -->
          <div class="grid grid-cols-[60px_1fr_120px_90px_60px] gap-2 px-4 py-2 border-b border-slate-800 text-[10px] text-slate-600 uppercase tracking-wider font-medium">
            <div>ID</div>
            <div>Title</div>
            <div>Assignee</div>
            <div>Points</div>
            <div></div>
          </div>
          ${subRows}
        </div>
      </div>
    `;
  },

  addSubIssue(ticketId) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (!ticket.subIssues) ticket.subIssues = [];

    const nextNum = ticket.subIssues.length + 1;
    const newSub = {
      id: `${ticketId}.${nextNum}`,
      title: 'New sub-issue',
      assignee: ticket.assignee || null,
      pointsMin: 0,
      pointsMax: 0,
      prdRef: null,
    };

    ticket.subIssues.push(newSub);
    this._debounceSave();
    this.renderTicketsTab();
  },

  editSubIssue(ticketId, subIndex) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.subIssues || !ticket.subIssues[subIndex]) return;

    const sub = ticket.subIssues[subIndex];
    const prefix = 'sub-edit';

    const formHtml = `
      <div class="space-y-3">
        <h3 class="text-base font-semibold text-slate-100">Edit Sub-issue: ${Theme.escapeHtml(sub.id)}</h3>
        <div class="grid grid-cols-2 gap-3">
          ${this._input(`${prefix}-id`, 'Sub-issue ID', sub.id)}
          ${this._select(`${prefix}-assignee`, 'Assignee', sub.assignee || '', this._teamOptions())}
        </div>
        ${this._input(`${prefix}-title`, 'Title', sub.title)}
        <div class="grid grid-cols-2 gap-3">
          ${this._input(`${prefix}-pointsMin`, 'Points (Min)', sub.pointsMin, 'number', 'min="0"')}
          ${this._input(`${prefix}-pointsMax`, 'Points (Max)', sub.pointsMax, 'number', 'min="0"')}
        </div>
        ${this._input(`${prefix}-prdSection`, 'PRD Section', sub.prdRef ? sub.prdRef.section : '')}
        ${this._textarea(`${prefix}-prdExcerpt`, 'PRD Excerpt', sub.prdRef ? sub.prdRef.excerpt : '', 2)}
      </div>
    `;

    this._showFormModal('Edit Sub-issue', formHtml, () => {
      const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
      const num = (id) => { const v = parseInt(val(id), 10); return isNaN(v) ? 0 : v; };

      sub.id = val(`${prefix}-id`) || sub.id;
      sub.title = val(`${prefix}-title`);
      sub.assignee = val(`${prefix}-assignee`) || null;
      sub.pointsMin = num(`${prefix}-pointsMin`);
      sub.pointsMax = num(`${prefix}-pointsMax`);

      const prdSection = val(`${prefix}-prdSection`);
      const prdExcerpt = val(`${prefix}-prdExcerpt`);
      sub.prdRef = (prdSection || prdExcerpt) ? { section: prdSection, excerpt: prdExcerpt } : null;

      this._debounceSave();
      this.renderTicketsTab();
    });
  },

  confirmDeleteSubIssue(ticketId, subIndex) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.subIssues || !ticket.subIssues[subIndex]) return;

    const sub = ticket.subIssues[subIndex];
    this._showConfirmModal(
      'Delete Sub-issue',
      `Delete sub-issue <span class="font-mono text-blue-400">${sub.id}</span>? This cannot be undone.`,
      () => this.deleteSubIssue(ticketId, subIndex)
    );
  },

  deleteSubIssue(ticketId, subIndex) {
    const ticket = this.data.tickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.subIssues) return;

    ticket.subIssues.splice(subIndex, 1);
    this._debounceSave();
    this.renderTicketsTab();
    this.showToast('Sub-issue deleted', 'info');
  },

  // =========================================================================
  // TEAM TAB
  // =========================================================================

  renderTeamTab() {
    const content = document.getElementById('editor-content');
    if (!content) return;

    let html = `
      <div class="mb-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">${this.data.team.length} team members</div>
        <button onclick="Editor.addTeamMember()"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Team Member
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="grid grid-cols-[50px_1fr_140px_90px_90px_60px_60px] gap-2 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider font-medium">
          <div>Color</div>
          <div>Name</div>
          <div>Role</div>
          <div>Points</div>
          <div>Capacity</div>
          <div>Flags</div>
          <div></div>
        </div>

        ${this.data.team.map((member, i) => this._renderTeamRow(member, i)).join('')}
      </div>
    `;

    content.innerHTML = html;
  },

  _renderTeamRow(member, index) {
    const isExpanded = this._expandedTeam === member.id;

    let flags = '';
    if (member.isBottleneck) flags += '<span class="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" title="Bottleneck"></span>';
    if (member.isHighestRisk) flags += '<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" title="Highest Risk"></span>';

    return `
      <div class="border-b border-slate-800/50 last:border-b-0">
        <div class="grid grid-cols-[50px_1fr_140px_90px_90px_60px_60px] gap-2 px-4 py-3 items-center hover:bg-slate-800/30 transition-colors cursor-pointer"
             onclick="Editor.toggleTeamForm('${member.id}')">
          <div><span class="w-4 h-4 rounded-full inline-block" style="background: ${member.color}"></span></div>
          <div>
            <div class="text-sm text-slate-200">${Theme.escapeHtml(member.name)}</div>
            <div class="text-xs text-slate-500 font-mono">${member.id}</div>
          </div>
          <div class="text-xs text-slate-400">${Theme.escapeHtml(member.role)}</div>
          <div class="font-mono text-xs text-slate-400">${member.pointsMin}-${member.pointsMax}</div>
          <div class="font-mono text-xs text-slate-500">${member.weeklyCapacity} hr/wk</div>
          <div>${flags || '<span class="text-slate-700">--</span>'}</div>
          <div class="flex items-center justify-end">
            <button onclick="event.stopPropagation(); Editor.toggleTeamForm('${member.id}')" class="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
        </div>
        ${isExpanded ? this.renderTeamForm(member.id) : ''}
      </div>
    `;
  },

  toggleTeamForm(memberId) {
    this._expandedTeam = this._expandedTeam === memberId ? null : memberId;
    this.renderTeamTab();
  },

  renderTeamForm(memberId) {
    const member = this.data.team.find(m => m.id === memberId);
    if (!member) return '';

    const prefix = `tm-${memberId}`;

    return `
      <div class="px-4 py-4 bg-slate-800/20 border-t border-slate-800/50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          ${this._input(`${prefix}-id`, 'ID', member.id)}
          ${this._input(`${prefix}-name`, 'Full Name', member.name)}
          ${this._input(`${prefix}-short`, 'Short Name', member.short)}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          ${this._input(`${prefix}-role`, 'Role', member.role)}
          ${this._textarea(`${prefix}-focus`, 'Focus Areas', member.focus || '', 2)}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          ${this._input(`${prefix}-pointsMin`, 'Points (Min)', member.pointsMin, 'number', 'min="0"')}
          ${this._input(`${prefix}-pointsMax`, 'Points (Max)', member.pointsMax, 'number', 'min="0"')}
          ${this._input(`${prefix}-weeklyCapacity`, 'Weekly Capacity (hrs)', member.weeklyCapacity, 'number', 'min="0"')}
          <div class="space-y-1">
            <label for="${prefix}-color" class="text-slate-400 text-xs uppercase tracking-wider font-medium block">Color</label>
            <div class="flex items-center gap-2">
              <input type="color" id="${prefix}-color" value="${member.color || '#3b82f6'}"
                class="w-10 h-10 rounded border border-slate-700 bg-slate-800 cursor-pointer" />
              <input type="text" id="${prefix}-colorHex" value="${member.color || '#3b82f6'}" readonly
                class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono focus:outline-none cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6 mb-4">
          ${this._checkbox(`${prefix}-isBottleneck`, 'Bottleneck', member.isBottleneck)}
          ${this._checkbox(`${prefix}-isHighestRisk`, 'Highest Risk', member.isHighestRisk)}
        </div>

        <div class="flex items-center gap-3">
          <button onclick="Editor.saveTeamMemberFromForm('${memberId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Member
          </button>
          <button onclick="Editor.confirmDeleteTeamMember('${memberId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </div>
    `;
  },

  saveTeamMemberFromForm(memberId) {
    const member = this.data.team.find(m => m.id === memberId);
    if (!member) return;

    const prefix = `tm-${memberId}`;
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const num = (id) => { const v = parseInt(val(id), 10); return isNaN(v) ? 0 : v; };
    const chk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };

    const oldId = member.id;
    member.id = val(`${prefix}-id`) || oldId;
    member.name = val(`${prefix}-name`);
    member.short = val(`${prefix}-short`);
    member.role = val(`${prefix}-role`);
    member.focus = val(`${prefix}-focus`);
    member.pointsMin = num(`${prefix}-pointsMin`);
    member.pointsMax = num(`${prefix}-pointsMax`);
    member.weeklyCapacity = num(`${prefix}-weeklyCapacity`);
    member.color = val(`${prefix}-color`);
    member.isBottleneck = chk(`${prefix}-isBottleneck`);
    member.isHighestRisk = chk(`${prefix}-isHighestRisk`);

    // Update color hex display
    const hexEl = document.getElementById(`${prefix}-colorHex`);
    if (hexEl) hexEl.value = member.color;

    this._debounceSave();
    this.renderTabBar();
    this.renderTeamTab();
  },

  addTeamMember() {
    let nextNum = this.data.team.length + 1;
    let newId = `member${nextNum}`;
    while (this.data.team.find(m => m.id === newId)) { nextNum++; newId = `member${nextNum}`; }

    const newMember = {
      id: newId,
      name: 'New Member',
      short: 'New',
      role: '',
      focus: '',
      location: '',
      tz: '',
      pointsMin: 0,
      pointsMax: 0,
      weeklyCapacity: 40,
      isBottleneck: false,
      color: '#6366f1',
    };

    this.data.team.push(newMember);
    this._expandedTeam = newId;
    this._debounceSave();
    this.renderTabBar();
    this.renderTeamTab();
  },

  confirmDeleteTeamMember(memberId) {
    this._showConfirmModal(
      'Delete Team Member',
      `Delete team member <span class="font-mono text-blue-400">${memberId}</span>? Tickets assigned to this member will become unassigned.`,
      () => this.deleteTeamMember(memberId)
    );
  },

  deleteTeamMember(memberId) {
    const idx = this.data.team.findIndex(m => m.id === memberId);
    if (idx === -1) return;

    // Clear assignee from tickets referencing this member
    this.data.tickets.forEach(t => {
      if (t.assignee === memberId) t.assignee = null;
      if (t.qaAssignee === memberId) t.qaAssignee = null;
      (t.subIssues || []).forEach(s => {
        if (s.assignee === memberId) s.assignee = null;
      });
    });

    this.data.team.splice(idx, 1);
    this._expandedTeam = null;
    this._debounceSave();
    this.renderTabBar();
    this.renderTeamTab();
    this.showToast(`Team member ${memberId} deleted`, 'info');
  },

  // =========================================================================
  // RISKS TAB
  // =========================================================================

  renderRisksTab() {
    const content = document.getElementById('editor-content');
    if (!content) return;

    let html = `
      <div class="mb-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">${this.data.risks.length} risks</div>
        <button onclick="Editor.addRisk()"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Risk
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="grid grid-cols-[50px_1fr_100px_100px_60px] gap-2 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider font-medium">
          <div>ID</div>
          <div>Title</div>
          <div>Severity</div>
          <div>Likelihood</div>
          <div></div>
        </div>

        ${this.data.risks.length === 0
          ? '<div class="px-4 py-6 text-center text-sm text-slate-600">No risks defined.</div>'
          : this.data.risks.map((risk, i) => this._renderRiskRow(risk, i)).join('')
        }
      </div>
    `;

    content.innerHTML = html;
  },

  _renderRiskRow(risk, index) {
    const isExpanded = this._expandedRisk === risk.id;

    return `
      <div class="border-b border-slate-800/50 last:border-b-0">
        <div class="grid grid-cols-[50px_1fr_100px_100px_60px] gap-2 px-4 py-3 items-center hover:bg-slate-800/30 transition-colors cursor-pointer"
             onclick="Editor.toggleRiskForm('${risk.id}')">
          <div class="font-mono text-xs text-slate-500">${risk.id}</div>
          <div class="text-sm text-slate-300 truncate">${Theme.escapeHtml(risk.title)}</div>
          <div>${Theme.severityBadge(risk.severity)}</div>
          <div class="text-xs text-slate-400 capitalize">${risk.likelihood}</div>
          <div class="flex items-center justify-end">
            <button onclick="event.stopPropagation(); Editor.toggleRiskForm('${risk.id}')" class="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
          </div>
        </div>
        ${isExpanded ? this.renderRiskForm(risk.id) : ''}
      </div>
    `;
  },

  toggleRiskForm(riskId) {
    this._expandedRisk = this._expandedRisk === riskId ? null : riskId;
    this.renderRisksTab();
  },

  renderRiskForm(riskId) {
    const risk = this.data.risks.find(r => r.id === riskId);
    if (!risk) return '';

    const prefix = `rk-${riskId}`;
    const severityOptions = [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ];
    const likelihoodOptions = [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ];

    return `
      <div class="px-4 py-4 bg-slate-800/20 border-t border-slate-800/50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          ${this._input(`${prefix}-id`, 'Risk ID', risk.id)}
          ${this._select(`${prefix}-severity`, 'Severity', risk.severity, severityOptions)}
          ${this._select(`${prefix}-likelihood`, 'Likelihood', risk.likelihood, likelihoodOptions)}
        </div>

        <div class="mb-4">
          ${this._input(`${prefix}-title`, 'Title', risk.title)}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          ${this._textarea(`${prefix}-impact`, 'Impact', risk.impact || '', 3)}
          ${this._textarea(`${prefix}-mitigation`, 'Mitigation', risk.mitigation || '', 3)}
        </div>

        <div class="flex items-center gap-3">
          <button onclick="Editor.saveRiskFromForm('${riskId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Risk
          </button>
          <button onclick="Editor.confirmDeleteRisk('${riskId}')"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </div>
    `;
  },

  saveRiskFromForm(riskId) {
    const risk = this.data.risks.find(r => r.id === riskId);
    if (!risk) return;

    const prefix = `rk-${riskId}`;
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

    const oldId = risk.id;
    risk.id = val(`${prefix}-id`) || oldId;
    risk.title = val(`${prefix}-title`);
    risk.severity = val(`${prefix}-severity`);
    risk.likelihood = val(`${prefix}-likelihood`);
    risk.impact = val(`${prefix}-impact`);
    risk.mitigation = val(`${prefix}-mitigation`);

    this._debounceSave();
    this.renderTabBar();
    this.renderRisksTab();
  },

  addRisk() {
    let nextNum = this.data.risks.length + 1;
    let newId = `R${nextNum}`;
    while (this.data.risks.find(r => r.id === newId)) { nextNum++; newId = `R${nextNum}`; }

    const newRisk = {
      id: newId,
      title: 'New Risk',
      severity: 'medium',
      likelihood: 'medium',
      impact: '',
      mitigation: '',
    };

    this.data.risks.push(newRisk);
    this._expandedRisk = newId;
    this._debounceSave();
    this.renderTabBar();
    this.renderRisksTab();
  },

  confirmDeleteRisk(riskId) {
    this._showConfirmModal(
      'Delete Risk',
      `Delete risk <span class="font-mono text-blue-400">${riskId}</span>? This cannot be undone.`,
      () => this.deleteRisk(riskId)
    );
  },

  deleteRisk(riskId) {
    const idx = this.data.risks.findIndex(r => r.id === riskId);
    if (idx === -1) return;

    this.data.risks.splice(idx, 1);
    this._expandedRisk = null;
    this._debounceSave();
    this.renderTabBar();
    this.renderRisksTab();
    this.showToast(`Risk ${riskId} deleted`, 'info');
  },

  // =========================================================================
  // IMPORT / EXPORT TAB
  // =========================================================================

  renderImportExportTab() {
    const content = document.getElementById('editor-content');
    if (!content) return;

    const modified = isDataModified();

    content.innerHTML = `
      <div class="space-y-6">

        <!-- Export Section -->
        <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 class="text-base font-semibold text-slate-100 mb-1">Export Data</h3>
          <p class="text-sm text-slate-500 mb-5">Download your current ticket, team, and risk data.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onclick="Editor.exportDataJS()"
              class="flex flex-col items-center gap-3 p-5 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/30 transition-all group">
              <svg class="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              <div>
                <div class="text-sm font-medium text-slate-200 group-hover:text-slate-100">Export as data.js</div>
                <div class="text-xs text-slate-500 mt-0.5">Drop-in replacement for data.js file</div>
              </div>
            </button>

            <button onclick="Editor.exportJSON()"
              class="flex flex-col items-center gap-3 p-5 rounded-lg border-2 border-dashed border-slate-700 hover:border-green-500/50 hover:bg-slate-800/30 transition-all group">
              <svg class="w-8 h-8 text-slate-500 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <div>
                <div class="text-sm font-medium text-slate-200 group-hover:text-slate-100">Export as JSON</div>
                <div class="text-xs text-slate-500 mt-0.5">Raw data for backup or transfer</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Import Section -->
        <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 class="text-base font-semibold text-slate-100 mb-1">Import Data</h3>
          <p class="text-sm text-slate-500 mb-5">Upload a JSON file to replace current data. Must contain a <code class="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-blue-400">tickets</code> array.</p>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-medium cursor-pointer transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Choose JSON File
              <input type="file" accept=".json,application/json" onchange="Editor.importJSON(this.files[0])" class="hidden" />
            </label>
            <span id="import-filename" class="text-xs text-slate-600">No file selected</span>
          </div>
        </div>

        <!-- Reset Section -->
        <div class="bg-slate-900 border ${modified ? 'border-amber-500/30' : 'border-slate-800'} rounded-lg p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-base font-semibold text-slate-100 mb-1">Reset to Defaults</h3>
              <p class="text-sm text-slate-500">Clear all localStorage modifications and restore the original data.js values.</p>
              ${modified
                ? '<p class="text-xs text-amber-400 mt-2 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg> Data has been modified from defaults</p>'
                : '<p class="text-xs text-green-400 mt-2 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg> Using default data</p>'
              }
            </div>
            <button onclick="Editor.confirmReset()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg ${modified ? 'bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400' : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'} text-sm font-medium transition-colors"
              ${modified ? '' : 'disabled'}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Reset All
            </button>
          </div>
        </div>

      </div>
    `;
  },

  exportDataJS() {
    const dataClone = JSON.parse(JSON.stringify(this.data));
    delete dataClone.computed;

    // Build a formatted JS string
    const jsonStr = JSON.stringify(dataClone, null, 2);
    const jsContent = `// data.js -- All ticket/team/timeline data + localStorage persistence
// Shared across all pages. Editor writes here, all pages read.
// Exported on ${new Date().toISOString()}

const STORAGE_KEY = 'prd-analysis-data';

const DEFAULT_DATA = ${jsonStr};

// Compute totals from ticket data
function computeTotals(data) {
  let totalMin = 0, totalMax = 0, coreMin = 0, coreMax = 0, ffMin = 0, ffMax = 0, subs = 0;
  let prereqMin = 0, prereqMax = 0, gapMin = 0, gapMax = 0;
  data.tickets.forEach(t => {
    totalMin += t.pointsMin;
    totalMax += t.pointsMax;
    subs += (t.subIssues || []).length;
    if (t.group === 'prereq') { prereqMin += t.pointsMin; prereqMax += t.pointsMax; }
    if (t.group === 'core') { coreMin += t.pointsMin; coreMax += t.pointsMax; }
    if (t.group === 'fast-follow') { ffMin += t.pointsMin; ffMax += t.pointsMax; }
    if (t.group === 'design-gap') { gapMin += t.pointsMin; gapMax += t.pointsMax; }
  });
  data.computed = {
    totalPointsMin: totalMin, totalPointsMax: totalMax,
    prereqPointsMin: prereqMin, prereqPointsMax: prereqMax,
    corePointsMin: coreMin, corePointsMax: coreMax,
    fastFollowPointsMin: ffMin, fastFollowPointsMax: ffMax,
    gapPointsMin: gapMin, gapPointsMax: gapMax,
    totalSubIssues: subs,
    totalParentTickets: data.tickets.length,
    mvpPointsMin: totalMin - ffMin,
    mvpPointsMax: totalMax - ffMax,
  };
  return data;
}

// Load data -- localStorage first, fallback to defaults
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return computeTotals(parsed);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage, using defaults:', e);
  }
  return computeTotals(JSON.parse(JSON.stringify(DEFAULT_DATA)));
}

// Save data to localStorage
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// Reset to default data
function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return computeTotals(JSON.parse(JSON.stringify(DEFAULT_DATA)));
}

// Check if data has been modified from defaults
function isDataModified() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Initialize global DATA on load
const DATA = loadData();
`;

    this._downloadFile(jsContent, 'data.js', 'text/javascript');
    this.showToast('Exported data.js', 'success');
  },

  exportJSON() {
    const dataClone = JSON.parse(JSON.stringify(this.data));
    delete dataClone.computed;

    const jsonStr = JSON.stringify(dataClone, null, 2);
    this._downloadFile(jsonStr, 'prd-analysis-data.json', 'application/json');
    this.showToast('Exported JSON', 'success');
  },

  importJSON(file) {
    if (!file) return;

    const filenameEl = document.getElementById('import-filename');
    if (filenameEl) filenameEl.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        // Validate basic schema
        if (!parsed.tickets || !Array.isArray(parsed.tickets)) {
          this.showToast('Invalid JSON: must contain a "tickets" array', 'error');
          return;
        }

        // Ensure required arrays exist
        if (!parsed.team) parsed.team = [];
        if (!parsed.risks) parsed.risks = [];
        if (!parsed.groups) parsed.groups = this.data.groups;
        if (!parsed.sprints) parsed.sprints = this.data.sprints;
        if (!parsed.meta) parsed.meta = this.data.meta;

        // Save and reload
        computeTotals(parsed);
        saveData(parsed);
        this.data = parsed;
        this.renderTabBar();
        this.switchTab(this.currentTab);
        this.showToast(`Imported ${parsed.tickets.length} tickets from ${file.name}`, 'success');
      } catch (err) {
        this.showToast(`Parse error: ${err.message}`, 'error');
      }
    };
    reader.onerror = () => {
      this.showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  },

  confirmReset() {
    this._showConfirmModal(
      'Reset to Defaults',
      'This will clear all your edits and restore the original data from data.js. <strong class="text-red-400">This cannot be undone.</strong> Consider exporting first.',
      () => this.resetToDefaults()
    );
  },

  resetToDefaults() {
    this.data = resetData();
    this.renderTabBar();
    this.switchTab(this.currentTab);
    this.showToast('Data reset to defaults', 'info');
  },

  // =========================================================================
  // File Download Helper
  // =========================================================================

  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // =========================================================================
  // Confirm Modal
  // =========================================================================

  _showConfirmModal(title, message, onConfirm) {
    const existing = document.getElementById('editor-confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'editor-confirm-modal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[420px] p-6">
        <h3 class="text-base font-semibold text-slate-100 mb-3">${title}</h3>
        <p class="text-sm text-slate-400 leading-relaxed mb-6">${message}</p>
        <div class="flex items-center gap-3 justify-end">
          <button onclick="document.getElementById('editor-confirm-modal').remove()"
            class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button id="confirm-action-btn"
            class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
            Confirm
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('confirm-action-btn').onclick = () => {
      modal.remove();
      onConfirm();
    };
  },

  // =========================================================================
  // Form Modal (for sub-issue editing)
  // =========================================================================

  _showFormModal(title, formHtml, onSave) {
    const existing = document.getElementById('editor-form-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'editor-form-modal';
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[560px] max-h-[85vh] overflow-y-auto p-6">
        ${formHtml}
        <div class="flex items-center gap-3 justify-end mt-6 pt-4 border-t border-slate-800">
          <button onclick="document.getElementById('editor-form-modal').remove()"
            class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button id="form-save-btn"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Save
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('form-save-btn').onclick = () => {
      onSave();
      modal.remove();
    };
  },
};
