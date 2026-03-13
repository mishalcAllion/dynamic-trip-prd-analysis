// theme.js -- Tailwind config + utility functions for PRD Analysis app

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          950: '#020617',  // page bg
          900: '#0f172a',  // card bg
          800: '#1e293b',  // card border / muted bg
          700: '#334155',  // hover state
        },
        group: {
          prereq: '#3b82f6',    // blue-500
          core: '#22c55e',      // green-500
          'fast-follow': '#f59e0b', // amber-500
          'design-gap': '#a855f7',  // purple-500
        }
      }
    }
  }
};

// Utility functions
const Theme = {
  // Group colors
  groupColor(groupId) {
    const map = {
      prereq: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500', hex: '#3b82f6' },
      core: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500', hex: '#22c55e' },
      'fast-follow': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500', hex: '#f59e0b' },
      'design-gap': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500', hex: '#a855f7' },
    };
    return map[groupId] || map.core;
  },

  // Group labels
  groupLabel(groupId) {
    const map = { prereq: 'Prerequisites', core: 'Core Features', 'fast-follow': 'Fast-Follow', 'design-gap': 'Design Gaps' };
    return map[groupId] || groupId;
  },

  // Format point range
  points(min, max) {
    if (min === max) return `${min} pts`;
    return `${min}-${max} pts`;
  },

  // Date formatting
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // Get team member by id
  getTeamMember(id) {
    const data = typeof loadData === 'function' ? loadData() : (window.DATA || {});
    return (data.team || []).find(m => m.id === id);
  },

  // Assignee badge HTML
  assigneeBadge(assigneeId) {
    const member = this.getTeamMember(assigneeId);
    if (!member) return `<span class="text-slate-500 text-xs">Unassigned</span>`;
    return `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style="background: ${member.color}15; color: ${member.color}">
      <span class="w-1.5 h-1.5 rounded-full" style="background: ${member.color}"></span>
      ${member.short}
    </span>`;
  },

  // Severity badge for risks
  severityBadge(severity) {
    const map = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      low: 'bg-green-500/10 text-green-400 border-green-500/30',
    };
    return `<span class="inline-flex px-2 py-0.5 rounded text-xs font-mono border ${map[severity] || ''}">${severity}</span>`;
  },

  // Escape HTML
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
