// nav.js -- Left sidebar navigation (injected into all pages)

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`, href: 'index.html' },
  { id: 'requirements', label: 'Requirements', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`, href: 'requirements.html' },
  { id: 'mvp-split', label: 'MVP Split', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`, href: 'mvp-split.html' },
  { id: 'timeline', label: 'Timeline', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`, href: 'timeline.html' },
  { id: 'capacity', label: 'Capacity & Risk', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`, href: 'capacity.html' },
  { id: 'editor', label: 'Data Editor', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`, href: 'editor.html' },
];

function initNav() {
  const root = document.getElementById('nav-root');
  if (!root) return;

  const currentPage = window.CURRENT_PAGE || 'overview';
  const data = typeof loadData === 'function' ? loadData() : (window.DATA || {});
  const computed = data.computed || {};

  const navHtml = `
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <!-- Header -->
      <div class="p-5 border-b border-slate-800">
        <h1 class="text-slate-100 font-semibold text-base">Dynamic Trip Page</h1>
        <p class="text-slate-500 text-xs mt-0.5 font-mono">PRD Analysis</p>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 py-3 overflow-y-auto">
        ${NAV_ITEMS.map(item => {
          const active = currentPage === item.id;
          return `
            <a href="${item.href}"
               class="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${active
                 ? 'text-slate-100 bg-slate-800/50 border-l-2 border-blue-400'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent'}">
              ${item.icon}
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Quick Stats -->
      <div class="p-4 border-t border-slate-800 space-y-2">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="text-slate-500">Tickets</div>
          <div class="text-slate-300 font-mono text-right">${computed.totalParentTickets || 16}</div>
          <div class="text-slate-500">Sub-issues</div>
          <div class="text-slate-300 font-mono text-right">~${computed.totalSubIssues || 57}</div>
          <div class="text-slate-500">Total Points</div>
          <div class="text-slate-300 font-mono text-right">${computed.totalPointsMin || 198}-${computed.totalPointsMax || 281}</div>
          <div class="text-slate-500">Ship Date</div>
          <div class="text-red-400 font-mono text-right">${data.meta?.shipDate ? Theme.formatDate(data.meta.shipDate) : 'Apr 15'}</div>
        </div>
        ${isDataModified() ? '<div class="text-xs text-amber-400 mt-2 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg> Data modified</div>' : ''}
      </div>

      <!-- External Links -->
      <div class="p-4 border-t border-slate-800 space-y-1.5">
        <a href="${data.meta?.prdUrl || '#'}" target="_blank" class="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          PRD (Notion)
        </a>
        <a href="${data.meta?.figmaBaseUrl || '#'}" target="_blank" class="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Figma Designs
        </a>
      </div>
    </aside>

    <!-- Mobile hamburger -->
    <button id="nav-toggle" class="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>

    <!-- Mobile overlay -->
    <div id="nav-overlay" class="lg:hidden fixed inset-0 bg-black/50 z-40 hidden"></div>
  `;

  root.innerHTML = navHtml;

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('nav-overlay');

  if (toggle && sidebar && overlay) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });
  }
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', initNav);
