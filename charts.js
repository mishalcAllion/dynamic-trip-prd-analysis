// charts.js -- Shared chart rendering library for PRD Analysis app
// Pure vanilla JS, no dependencies. Requires data.js + theme.js loaded first.

const CRITICAL_PATH_IDS = ['P1', 'P2', 'P4', 'C3', 'C4', 'C5'];

// ============================================================
//  Utility: date math helpers
// ============================================================
const ChartUtils = {
  // Parse "YYYY-MM-DD" into a Date at midnight UTC
  parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  // Number of calendar days between two date strings (inclusive of start, exclusive of end)
  daysBetween(startStr, endStr) {
    const s = this.parseDate(startStr);
    const e = this.parseDate(endStr);
    return Math.round((e - s) / (1000 * 60 * 60 * 24));
  },

  // Day index (0-based) of a date relative to a start date
  dayIndex(dateStr, startStr) {
    return this.daysBetween(startStr, dateStr);
  },

  // Format "YYYY-MM-DD" to "Mar 16"
  shortDate(str) {
    const d = this.parseDate(str);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // Generate array of date strings from start to end (inclusive)
  dateRange(startStr, endStr) {
    const dates = [];
    const start = this.parseDate(startStr);
    const end = this.parseDate(endStr);
    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  },

  // Is a date a weekend?
  isWeekend(dateStr) {
    const d = this.parseDate(dateStr);
    const day = d.getDay();
    return day === 0 || day === 6;
  },

  // Today as "YYYY-MM-DD"
  today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
};


// ============================================================
//  GanttChart
// ============================================================
const GanttChart = {

  /**
   * Render a Gantt chart into the given container.
   *
   * @param {string} containerId - DOM element ID to render into
   * @param {object} options
   *   - tickets: array of ticket objects
   *   - startDate: "YYYY-MM-DD"
   *   - endDate: "YYYY-MM-DD"
   *   - shipDate: "YYYY-MM-DD"
   *   - sprints: array of {name, start, end}
   *   - showFastFollow: boolean
   *   - highlightCriticalPath: boolean
   *   - groups: array of group definitions
   */
  render(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      tickets = [],
      startDate,
      endDate,
      shipDate,
      sprints = [],
      showFastFollow = false,
      highlightCriticalPath = false,
      groups = []
    } = options;

    // Filter tickets
    let visibleTickets = tickets.filter(t => {
      if (!showFastFollow && t.group === 'fast-follow') return false;
      return true;
    });

    // Sort: by group order then by ganttStart
    const groupOrder = { prereq: 0, 'design-gap': 1, core: 2, 'fast-follow': 3 };
    visibleTickets.sort((a, b) => {
      const ga = groupOrder[a.group] ?? 99;
      const gb = groupOrder[b.group] ?? 99;
      if (ga !== gb) return ga - gb;
      return a.ganttStart.localeCompare(b.ganttStart);
    });

    // Date range
    const allDates = ChartUtils.dateRange(startDate, endDate);
    const totalDays = allDates.length;
    const labelColWidth = 220;
    const dayWidth = 32;
    const rowHeight = 40;
    const headerHeight = 64;
    const totalWidth = labelColWidth + (totalDays * dayWidth);
    const totalHeight = headerHeight + (visibleTickets.length * rowHeight) + 20;

    // Build group color map
    const groupColorMap = {};
    groups.forEach(g => { groupColorMap[g.id] = g.color; });

    // Sprint band lookup: for each date, which sprint?
    function getSprintIndex(dateStr) {
      for (let i = 0; i < sprints.length; i++) {
        if (dateStr >= sprints[i].start && dateStr <= sprints[i].end) return i;
      }
      return -1;
    }

    // Ship date column index
    const shipDayIdx = ChartUtils.dayIndex(shipDate, startDate);

    // Today column index
    const todayStr = ChartUtils.today();
    const todayIdx = ChartUtils.dayIndex(todayStr, startDate);

    // Ticket ID -> row index map (for dependency arrows)
    const ticketRowMap = {};
    visibleTickets.forEach((t, i) => { ticketRowMap[t.id] = i; });

    // Ticket ID -> column positions map
    const ticketColMap = {};
    visibleTickets.forEach(t => {
      const startIdx = ChartUtils.dayIndex(t.ganttStart, startDate);
      const endIdx = ChartUtils.dayIndex(t.ganttEnd, startDate);
      ticketColMap[t.id] = { start: startIdx, end: endIdx };
    });

    // ---- Build HTML ----
    let html = '';

    // Wrapper: horizontal scroll
    html += `<div class="relative overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50" style="max-width:100%;">`;
    html += `<div class="relative" style="width:${totalWidth}px; min-height:${totalHeight}px;">`;

    // ---- Sprint background bands ----
    sprints.forEach((sprint, si) => {
      const sprintStartIdx = ChartUtils.dayIndex(sprint.start, startDate);
      const sprintEndIdx = ChartUtils.dayIndex(sprint.end, startDate);
      const sprintDays = sprintEndIdx - sprintStartIdx + 1;
      const left = labelColWidth + (sprintStartIdx * dayWidth);
      const width = sprintDays * dayWidth;
      const bgColor = si % 2 === 0 ? 'rgba(30,41,59,0.5)' : 'rgba(15,23,42,0.5)';
      html += `<div class="absolute top-0" style="left:${left}px; width:${width}px; height:100%; background:${bgColor}; z-index:0;"></div>`;
    });

    // ---- Header row: Sprint labels + day numbers ----
    html += `<div class="sticky top-0 z-20 flex" style="height:${headerHeight}px; background: linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%); backdrop-filter:blur(8px);">`;

    // Label column header
    html += `<div class="shrink-0 flex items-end pb-1 px-3 border-b border-slate-700/50 border-r border-r-slate-800" style="width:${labelColWidth}px;">
      <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ticket</span>
    </div>`;

    // Day columns header
    html += `<div class="flex items-end relative" style="width:${totalDays * dayWidth}px;">`;

    // Sprint labels at top
    sprints.forEach((sprint, si) => {
      const sprintStartIdx = ChartUtils.dayIndex(sprint.start, startDate);
      const sprintEndIdx = ChartUtils.dayIndex(sprint.end, startDate);
      const sprintDays = sprintEndIdx - sprintStartIdx + 1;
      const left = sprintStartIdx * dayWidth;
      const width = sprintDays * dayWidth;
      html += `<div class="absolute flex items-center justify-center" style="left:${left}px; width:${width}px; top:4px; height:24px;">
        <span class="text-xs font-semibold text-slate-400 tracking-wide">${sprint.name}</span>
      </div>`;
    });

    // Day labels
    allDates.forEach((dateStr, i) => {
      const d = ChartUtils.parseDate(dateStr);
      const dayNum = d.getDate();
      const isWknd = ChartUtils.isWeekend(dateStr);
      const isMonday = d.getDay() === 1;
      const textColor = isWknd ? 'text-slate-600' : 'text-slate-500';
      // Show month label on the 1st or first Monday
      let monthLabel = '';
      if (dayNum === 1 || (i === 0)) {
        monthLabel = `<span class="text-[9px] text-slate-600 block leading-none">${d.toLocaleDateString('en-US', { month: 'short' })}</span>`;
      }
      const borderLeft = isMonday ? 'border-l border-l-slate-700/30' : '';
      html += `<div class="inline-flex flex-col items-center justify-end pb-1 ${borderLeft} border-b border-slate-700/50" style="width:${dayWidth}px; height:${headerHeight - 28}px; position:absolute; left:${i * dayWidth}px; bottom:0;">
        ${monthLabel}
        <span class="text-[10px] font-mono ${textColor}">${dayNum}</span>
      </div>`;
    });

    html += `</div>`; // end day columns header
    html += `</div>`; // end header row

    // ---- Ticket rows ----
    visibleTickets.forEach((ticket, rowIdx) => {
      const isCritical = CRITICAL_PATH_IDS.includes(ticket.id);
      const groupColor = groupColorMap[ticket.group] || '#64748b';
      const rowTop = headerHeight + (rowIdx * rowHeight);
      const rowOpacity = (highlightCriticalPath && !isCritical) ? 'opacity-30' : '';
      const member = DATA.team.find(m => m.id === ticket.assignee);
      const assigneeName = member ? member.short : ticket.assignee;

      // Row container
      html += `<div class="absolute flex ${rowOpacity} transition-opacity duration-300" style="top:${rowTop}px; width:${totalWidth}px; height:${rowHeight}px;">`;

      // Label column
      html += `<div class="shrink-0 flex items-center gap-2 px-3 border-b border-slate-800/50 border-r border-r-slate-800/50 bg-slate-900/80" style="width:${labelColWidth}px; height:${rowHeight}px;">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${groupColor};"></span>
        <span class="text-xs font-mono text-slate-400 shrink-0 w-7">${ticket.id}</span>
        <span class="text-xs text-slate-300 truncate flex-1" title="${Theme.escapeHtml(ticket.title)}">${Theme.escapeHtml(ticket.title)}</span>
      </div>`;

      // Bar area
      html += `<div class="relative border-b border-slate-800/30" style="width:${totalDays * dayWidth}px; height:${rowHeight}px;">`;

      // Weekend shading for this row
      allDates.forEach((dateStr, di) => {
        if (ChartUtils.isWeekend(dateStr)) {
          html += `<div class="absolute top-0" style="left:${di * dayWidth}px; width:${dayWidth}px; height:${rowHeight}px; background:rgba(0,0,0,0.15);"></div>`;
        }
      });

      // The bar itself
      const barStartIdx = ChartUtils.dayIndex(ticket.ganttStart, startDate);
      const barEndIdx = ChartUtils.dayIndex(ticket.ganttEnd, startDate);
      const barDays = barEndIdx - barStartIdx + 1;
      const barLeft = barStartIdx * dayWidth + 2;
      const barWidth = (barDays * dayWidth) - 4;
      const barTop = 8;
      const barHeight = rowHeight - 16;

      const glowStyle = (highlightCriticalPath && isCritical)
        ? `box-shadow: 0 0 12px ${groupColor}60, 0 0 4px ${groupColor}40;`
        : '';

      // Tooltip data stored on bar for fixed-position tooltip system
      const tooltipData = JSON.stringify({
        id: ticket.id,
        title: ticket.title,
        assignee: assigneeName,
        points: Theme.points(ticket.pointsMin, ticket.pointsMax),
        start: ChartUtils.shortDate(ticket.ganttStart),
        end: ChartUtils.shortDate(ticket.ganttEnd),
        isMvp: ticket.isMvp,
        isCritical: isCritical,
        groupColor: groupColor,
        deps: ticket.dependencies
      }).replace(/'/g, '&#39;');

      html += `<div class="absolute rounded-md cursor-pointer transition-all duration-200 hover:brightness-125 group/bar"
        style="left:${barLeft}px; top:${barTop}px; width:${barWidth}px; height:${barHeight}px; background:${groupColor}; ${glowStyle} z-index:5;"
        data-ticket-id="${ticket.id}"
        data-gantt-tip='${tooltipData}'>
        <!-- Bar label (shown if wide enough) -->
        ${barWidth > 80 ? `<span class="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white/90 truncate pointer-events-none">${ticket.id} ${ticket.isMvp ? '' : '(FF)'}</span>` : ''}
      </div>`;

      html += `</div>`; // end bar area
      html += `</div>`; // end row
    });

    // ---- Ship date vertical line ----
    if (shipDayIdx >= 0 && shipDayIdx <= totalDays) {
      const shipLeft = labelColWidth + (shipDayIdx * dayWidth) + (dayWidth / 2);
      html += `<div class="absolute top-0 z-10 pointer-events-none" style="left:${shipLeft}px; width:2px; height:100%; background:rgba(239,68,68,0.7);">
        <div class="absolute -top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-b-md whitespace-nowrap" style="top:0;">
          ${ChartUtils.shortDate(shipDate)}
        </div>
      </div>`;
    }

    // ---- Today marker (dynamic: recomputed on every page load) ----
    if (todayIdx >= 0 && todayIdx <= totalDays) {
      const todayLeft = labelColWidth + (todayIdx * dayWidth) + (dayWidth / 2);
      const todayLabel = ChartUtils.shortDate(todayStr);
      html += `
        <!-- Today arrow indicator -->
        <div class="absolute top-0 z-[15] pointer-events-none" style="left:${todayLeft}px; transform:translateX(-50%);">
          <!-- Label + downward arrow -->
          <div class="flex flex-col items-center" style="margin-top:4px;">
            <div class="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-lg shadow-green-500/30">
              Today &middot; ${todayLabel}
            </div>
            <!-- Triangle pointing down -->
            <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #22c55e;"></div>
          </div>
        </div>
        <!-- Solid vertical line -->
        <div class="absolute pointer-events-none" style="left:${todayLeft}px; top:${headerHeight}px; width:2px; height:${totalHeight - headerHeight}px; background:rgba(34,197,94,0.5); transform:translateX(-50%); z-index:14;"></div>`;
    }

    // ---- Dependency arrows (SVG overlay) ----
    html += `<svg class="absolute top-0 left-0 z-[6] pointer-events-none" style="width:${totalWidth}px; height:${totalHeight}px;" xmlns="http://www.w3.org/2000/svg">`;
    html += `<defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" fill="#94a3b8">
        <polygon points="0 0, 8 3, 0 6" />
      </marker>
      <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" fill="#ef4444">
        <polygon points="0 0, 8 3, 0 6" />
      </marker>
    </defs>`;

    visibleTickets.forEach((ticket) => {
      if (!ticket.dependencies || ticket.dependencies.length === 0) return;
      const targetRow = ticketRowMap[ticket.id];
      if (targetRow === undefined) return;

      const targetCols = ticketColMap[ticket.id];
      if (!targetCols) return;

      ticket.dependencies.forEach(depId => {
        const depRow = ticketRowMap[depId];
        if (depRow === undefined) return;
        const depCols = ticketColMap[depId];
        if (!depCols) return;

        // Arrow from end of dependency bar to start of target bar
        const fromX = labelColWidth + ((depCols.end + 1) * dayWidth);
        const fromY = headerHeight + (depRow * rowHeight) + (rowHeight / 2);
        const toX = labelColWidth + (targetCols.start * dayWidth) + 2;
        const toY = headerHeight + (targetRow * rowHeight) + (rowHeight / 2);

        const isBothCritical = CRITICAL_PATH_IDS.includes(ticket.id) && CRITICAL_PATH_IDS.includes(depId);
        const strokeColor = (highlightCriticalPath && isBothCritical) ? '#ef4444' : '#475569';
        const strokeWidth = (highlightCriticalPath && isBothCritical) ? 2 : 1;
        const markerRef = (highlightCriticalPath && isBothCritical) ? 'url(#arrowhead-critical)' : 'url(#arrowhead)';
        const opacity = (highlightCriticalPath && !isBothCritical) ? 0.2 : 0.6;

        // Bezier curve
        const midX = fromX + (toX - fromX) * 0.5;
        html += `<path d="M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}"
          fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"
          marker-end="${markerRef}" />`;
      });
    });

    html += `</svg>`;

    html += `</div>`; // end inner wrapper
    html += `</div>`; // end outer scroll wrapper

    container.innerHTML = html;

    // ---- Fixed-position Gantt tooltip (avoids overflow clipping) ----
    let ganttTip = document.getElementById('gantt-fixed-tooltip');
    if (!ganttTip) {
      ganttTip = document.createElement('div');
      ganttTip.id = 'gantt-fixed-tooltip';
      ganttTip.className = 'fixed z-[200] opacity-0 transition-opacity duration-150 pointer-events-none';
      ganttTip.style.maxWidth = '340px';
      document.body.appendChild(ganttTip);
    }

    let ganttTipTimer = null;

    container.querySelectorAll('[data-gantt-tip]').forEach(barEl => {
      barEl.addEventListener('mouseenter', (e) => {
        clearTimeout(ganttTipTimer);
        try {
          const d = JSON.parse(barEl.getAttribute('data-gantt-tip'));
          ganttTip.innerHTML = `
            <div class="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full shrink-0" style="background:${d.groupColor}"></span>
                <span class="text-xs font-mono text-slate-300">${d.id}</span>
                <span class="text-xs text-slate-100 font-medium">${Theme.escapeHtml(d.title)}</span>
              </div>
              <div class="text-[11px] text-slate-400">${d.assignee} &middot; ${d.points}</div>
              <div class="text-[11px] text-slate-500">${d.start} &ndash; ${d.end}</div>
              <div class="flex gap-1 flex-wrap">
                ${d.isMvp ? '<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-green-500/20 text-green-400">MVP</span>' : '<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400">Fast-Follow</span>'}
                ${d.isCritical ? '<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-400">Critical Path</span>' : ''}
              </div>
              ${d.deps && d.deps.length > 0 ? `<div class="text-[10px] text-slate-500 pt-0.5">Depends on: ${d.deps.join(', ')}</div>` : ''}
            </div>`;

          // Position above the bar, viewport-safe
          const rect = barEl.getBoundingClientRect();
          ganttTip.classList.remove('opacity-0');
          ganttTip.classList.add('opacity-100');

          requestAnimationFrame(() => {
            const tipRect = ganttTip.getBoundingClientRect();
            let top = rect.top - tipRect.height - 8;
            let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

            // Keep in viewport
            if (top < 8) top = rect.bottom + 8;
            if (left < 8) left = 8;
            if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;

            ganttTip.style.top = top + 'px';
            ganttTip.style.left = left + 'px';
          });
        } catch (err) { /* ignore parse errors */ }
      });

      barEl.addEventListener('mouseleave', () => {
        ganttTipTimer = setTimeout(() => {
          ganttTip.classList.remove('opacity-100');
          ganttTip.classList.add('opacity-0');
        }, 100);
      });
    });
  }
};


// ============================================================
//  BarChart (Capacity / Workload)
// ============================================================
const BarChart = {

  /**
   * Render a horizontal workload bar chart.
   *
   * @param {string} containerId - DOM element ID
   * @param {Array} teamData - array of team member objects with:
   *   { name, short, pointsMin, pointsMax, weeklyCapacity, isBottleneck, color, role }
   * @param {object} [opts]
   *   - capacityLine: number (default 200 = 40hrs x 5 weeks)
   *   - totalWeeks: number (default 5)
   */
  renderWorkload(containerId, teamData, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const capacityLine = opts.capacityLine || 200;
    const totalWeeks = opts.totalWeeks || 5;
    const maxVal = Math.max(capacityLine, ...teamData.map(m => m.pointsMax || 0)) * 1.15;

    let html = '';
    html += `<div class="space-y-4">`;

    // Capacity line label
    html += `<div class="flex items-center justify-between mb-2">
      <span class="text-xs text-slate-500">Workload (points over ${totalWeeks} weeks)</span>
      <span class="text-xs text-slate-400 flex items-center gap-2">
        <span class="inline-block w-8 h-0.5 bg-red-500/60"></span>
        Capacity (${capacityLine} pts = ${totalWeeks} x 40hrs)
      </span>
    </div>`;

    teamData.forEach(member => {
      if (member.pointsMax === 0 && member.pointsMin === 0) return; // skip QA etc.

      const minPct = (member.pointsMin / maxVal) * 100;
      const maxPct = (member.pointsMax / maxVal) * 100;
      const capPct = (capacityLine / maxVal) * 100;
      const isOver = member.pointsMax > capacityLine;
      const barColor = member.color || '#64748b';

      html += `<div class="group">`;
      // Label row
      html += `<div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" style="background:${barColor}"></span>
          <span class="text-sm text-slate-200 font-medium">${member.short || member.name}</span>
          <span class="text-xs text-slate-500">${member.role || ''}</span>
          ${member.isBottleneck ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/20">Bottleneck</span>' : ''}
        </div>
        <span class="text-xs font-mono ${isOver ? 'text-red-400' : 'text-slate-400'}">${member.pointsMin}-${member.pointsMax} pts</span>
      </div>`;

      // Bar
      html += `<div class="relative h-8 rounded-md bg-slate-800/50 overflow-visible">`;

      // Min bar (lighter)
      html += `<div class="absolute top-0 left-0 h-full rounded-md transition-all duration-500"
        style="width:${maxPct}%; background:${barColor}20;"></div>`;

      // Max bar (full)
      html += `<div class="absolute top-0 left-0 h-full rounded-md transition-all duration-500"
        style="width:${minPct}%; background:${barColor}50;"></div>`;

      // Actual bar overlay with gradient
      html += `<div class="absolute top-0 left-0 h-full rounded-md transition-all duration-500 flex items-center"
        style="width:${maxPct}%; background: linear-gradient(90deg, ${barColor}80 0%, ${barColor}40 ${(minPct / maxPct * 100).toFixed(0)}%, ${barColor}20 100%);">
        <span class="absolute right-2 text-[10px] font-mono text-white/70">${member.pointsMax}</span>
      </div>`;

      // Min marker
      html += `<div class="absolute top-0 h-full" style="left:${minPct}%; width:2px; background:${barColor};">
        <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500">${member.pointsMin}</span>
      </div>`;

      // Capacity line
      html += `<div class="absolute top-0 h-full" style="left:${capPct}%; width:1px; border-left:2px dashed rgba(239,68,68,0.5); z-index:2;"></div>`;

      html += `</div>`; // end bar
      html += `</div>`; // end group
    });

    html += `</div>`;
    container.innerHTML = html;
  }
};
