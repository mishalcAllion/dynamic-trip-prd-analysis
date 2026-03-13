// tooltips.js -- Source traceability tooltip system
// Usage: Add data-tooltip='{"type":"prd","section":"...","excerpt":"..."}' to any element

(function() {
  let tooltipEl = null;
  let hideTimer = null;

  function createTooltip() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'source-tooltip';
    tooltipEl.className = 'fixed z-[100] opacity-0 transition-opacity duration-150';
    tooltipEl.style.maxWidth = '380px';
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function getTooltipContent(data) {
    const isPrd = data.type === 'prd';
    const icon = isPrd
      ? `<svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
      : `<svg class="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.134 2 5 5.134 5 9c0 1.387.405 2.677 1.1 3.765L12 22l5.9-9.235A6.953 6.953 0 0019 9c0-3.866-3.134-7-7-7z"/></svg>`;

    const sourceLabel = isPrd ? 'PRD Reference' : 'Figma Reference';
    const section = data.section || data.label || '';
    const excerpt = data.excerpt || data.description || '';
    const meta = typeof DATA !== 'undefined' ? DATA.meta : {};
    const link = isPrd
      ? (meta.prdUrl || '#')
      : (data.nodeId && data.nodeId !== 'TBD'
          ? `${meta.figmaBaseUrl || '#'}?node-id=${data.nodeId}`
          : (meta.figmaBaseUrl || '#'));

    return `
      <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 space-y-2">
        <div class="flex items-center gap-2">
          ${icon}
          <span class="text-xs font-medium text-slate-300 uppercase tracking-wider">${sourceLabel}</span>
        </div>
        ${section ? `<div class="text-xs font-mono text-blue-400">${Theme.escapeHtml(section)}</div>` : ''}
        ${excerpt ? `<div class="text-xs text-slate-400 leading-relaxed border-l-2 border-slate-600 pl-2 italic">"${Theme.escapeHtml(excerpt)}"</div>` : ''}
        <a href="${link}" target="_blank" class="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 pointer-events-auto">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Open in ${isPrd ? 'Notion' : 'Figma'}
        </a>
      </div>
    `;
  }

  function showTooltip(el, data) {
    clearTimeout(hideTimer);
    const tooltip = createTooltip();
    tooltip.innerHTML = getTooltipContent(data);
    tooltip.classList.remove('opacity-0');
    tooltip.classList.add('opacity-100');

    // Position above the element
    const rect = el.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 8;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    // Keep in viewport
    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => {
      if (tooltipEl) {
        tooltipEl.classList.remove('opacity-100');
        tooltipEl.classList.add('opacity-0');
      }
    }, 150);
  }

  // Event delegation
  document.addEventListener('mouseenter', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    try {
      const data = JSON.parse(el.getAttribute('data-tooltip'));
      showTooltip(el, data);
    } catch (err) { /* ignore parse errors */ }
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    hideTooltip();
  }, true);

  // Keep tooltip visible when hovering over it
  document.addEventListener('mouseenter', (e) => {
    if (e.target.closest('#source-tooltip')) clearTimeout(hideTimer);
  }, true);
  document.addEventListener('mouseleave', (e) => {
    if (e.target.closest('#source-tooltip')) hideTooltip();
  }, true);
})();

// Helper: create a PRD reference badge
function prdBadge(prdRef) {
  if (!prdRef) return '';
  const data = JSON.stringify({ type: 'prd', section: prdRef.section, excerpt: prdRef.excerpt });
  return `<span data-tooltip='${data.replace(/'/g, "&#39;")}' class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-help hover:bg-blue-500/20 transition-colors">
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    PRD
  </span>`;
}

// Helper: create a Figma reference badge
function figmaBadge(figmaRef) {
  if (!figmaRef) return '';
  const data = JSON.stringify({ type: 'figma', nodeId: figmaRef.nodeId, label: figmaRef.label, description: figmaRef.description });
  return `<span data-tooltip='${data.replace(/'/g, "&#39;")}' class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-help hover:bg-purple-500/20 transition-colors">
    <svg class="w-3 h-3" viewBox="0 0 15 15" fill="currentColor"><path d="M4.5 1C3.12 1 2 2.12 2 3.5S3.12 6 4.5 6H7V1H4.5zM3 3.5C3 2.67 3.67 2 4.5 2H6v3H4.5C3.67 5 3 4.33 3 3.5z"/><path d="M7.5 1H8v5H7.5C7.22 6 7 5.78 7 5.5v-4c0-.28.22-.5.5-.5z"/><path d="M8 6h2.5C11.88 6 13 4.88 13 3.5S11.88 1 10.5 1H8v5zm1-4h1.5c.83 0 1.5.67 1.5 1.5S11.33 5 10.5 5H9V2z"/><path d="M2 10.5C2 9.12 3.12 8 4.5 8H7v2.5C7 11.88 5.88 13 4.5 13S2 11.88 2 10.5zM4.5 9C3.67 9 3 9.67 3 10.5S3.67 12 4.5 12 6 11.33 6 10.5V9H4.5z"/><path d="M2 6.5C2 5.12 3.12 4 4.5 4H7v5H4.5C3.12 9 2 7.88 2 6.5zM4.5 5C3.67 5 3 5.67 3 6.5S3.67 8 4.5 8H6V5H4.5z"/></svg>
    Figma
  </span>`;
}
