// data.js -- All ticket/team/timeline data + localStorage persistence
// Shared across all pages. Editor writes here, all pages read.

const STORAGE_KEY = 'prd-analysis-data';

const DEFAULT_DATA = {

  // -- Meta --
  meta: {
    projectName: "Dynamic Trip Page",
    shipDate: "2026-04-15",
    startDate: "2026-03-16",
    totalWeeks: 5,
    prdUrl: "https://www.notion.so/322d1ecb2189813ba114d197694f5249",
    figmaFileKey: "4iE0xDHDUxCIHQ3E55zu5p",
    figmaBaseUrl: "https://www.figma.com/design/4iE0xDHDUxCIHQ3E55zu5p/Maestro-%7C-Product",
  },

  // -- Team --
  team: [
    { id: "waruna", name: "Waruna Samarasinghe", short: "Waruna", role: "Mobile UI/UX", focus: "All Core UI tickets (C1-C5), Fast-Follow UI (F1, F2, F4)", location: "Canada", tz: "GMT-6", pointsMin: 80, pointsMax: 110, weeklyCapacity: 40, isBottleneck: true, color: "#3b82f6" },
    { id: "kalpa", name: "Kalpa Thathsara", short: "Kalpa", role: "Mobile Backend/Logic", focus: "Backend API (P2), Phase logic (P4)", location: "Sri Lanka", tz: "GMT+5:30", pointsMin: 50, pointsMax: 70, weeklyCapacity: 40, isBottleneck: false, color: "#22c55e" },
    { id: "shashila", name: "Shashila Heshan", short: "Shashila", role: "Backend Integrations", focus: "Notion schema (P1), Task dashboard (P3), Push notifications (F3)", location: "Sri Lanka", tz: "GMT+5:30", pointsMin: 11, pointsMax: 16, weeklyCapacity: 40, isBottleneck: false, color: "#a855f7" },
    { id: "juan", name: "Juan", short: "Juan", role: "Design", focus: "Design gaps (G1-G3) -- BLOCKS ALL UI WORK", location: "TBD", tz: "TBD", pointsMin: 16, pointsMax: 24, weeklyCapacity: 40, isBottleneck: false, isHighestRisk: true, color: "#f59e0b" },
    { id: "thilini", name: "Thilini", short: "Thilini", role: "QA", focus: "All parent tickets -- reproduce / validate", location: "TBD", tz: "TBD", pointsMin: 0, pointsMax: 0, weeklyCapacity: 40, isBottleneck: false, color: "#ec4899" },
  ],

  // -- Sprints --
  sprints: [
    { name: "Sprint 9",  start: "2026-03-16", end: "2026-03-28", weeks: 2 },
    { name: "Sprint 10", start: "2026-03-29", end: "2026-04-11", weeks: 2 },
    { name: "Sprint 11", start: "2026-04-12", end: "2026-04-25", weeks: 2 },
  ],

  // -- Ticket Groups --
  groups: [
    { id: "prereq",      label: "Prerequisites",  prefix: "P", color: "#3b82f6", bgClass: "bg-blue-500/10",   textClass: "text-blue-400",   borderClass: "border-blue-500/30"  },
    { id: "core",         label: "Core Features",  prefix: "C", color: "#22c55e", bgClass: "bg-green-500/10",  textClass: "text-green-400",  borderClass: "border-green-500/30" },
    { id: "fast-follow",  label: "Fast-Follow",    prefix: "F", color: "#f59e0b", bgClass: "bg-amber-500/10",  textClass: "text-amber-400",  borderClass: "border-amber-500/30" },
    { id: "design-gap",   label: "Design Gaps",    prefix: "G", color: "#a855f7", bgClass: "bg-purple-500/10", textClass: "text-purple-400", borderClass: "border-purple-500/30" },
  ],

  // -- Tickets (16 parents with sub-issues) --
  tickets: [

    // === PREREQUISITES ===
    {
      id: "P1", group: "prereq", title: "Notion Schema Setup",
      description: "Add all new fields to Trips DB and Components DB per PRD Section 6",
      assignee: "shashila", qaAssignee: "thilini",
      pointsMin: 6, pointsMax: 10, isMvp: true,
      ganttStart: "2026-03-16", ganttEnd: "2026-03-21",
      dependencies: [], blocksTickets: ["P2", "C1", "C2", "C3"],
      prdRef: { section: "Section 6 - Notion Schema Changes", excerpt: "29 net-new fields across Trips DB and Components DB" },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "P1.1", title: "Add Trip Page Type, Cover Image URL, feedback fields to Trips DB", assignee: "shashila", pointsMin: 2, pointsMax: 4, prdRef: { section: "Section 6.1 - Trips Database New Fields", excerpt: "Trip Page Type select: Structured / Notion Embedded / Custom" } },
        { id: "P1.2", title: "Add Insider Tips rich text fields to Trips DB", assignee: "shashila", pointsMin: 1, pointsMax: 2, prdRef: { section: "Section 4.9 - Insider Tips", excerpt: "Stored as rich text fields on Trips Database: Transportation, Money & Connectivity, Culture & Etiquette, Packing & Prep" } },
        { id: "P1.3", title: "Add Image URLs, Advisor Reasoning, Comments JSON, Option Group, Key Time, Display Order, Website URL, decision fields to Components DB", assignee: "shashila", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 6.2 - Components Database New Fields", excerpt: "Image URLs (text), Advisor Reasoning (rich text), Comments (JSON), Display Order (number), Option Group (text), Client Decision Date, Decided By, Key Time, Website URL" } },
      ]
    },
    {
      id: "P2", group: "prereq", title: "Backend API Layer",
      description: "Build all 6 REST endpoints per PRD Section 7.2",
      assignee: "kalpa", qaAssignee: "thilini",
      pointsMin: 24, pointsMax: 32, isMvp: true,
      ganttStart: "2026-03-19", ganttEnd: "2026-04-04",
      dependencies: ["P1"], blocksTickets: ["C1", "C2", "C3", "C4", "C5"],
      prdRef: { section: "Section 7.2 - Backend API", excerpt: "6 endpoints: GET /trips/:id, GET /trips/:id/components/:componentId, PATCH decision, POST comments, PATCH feedback, GET /trips" },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "P2.1", title: "GET /trips/:id - Trip metadata + components + comment counts + insider tips", assignee: "kalpa", pointsMin: 5, pointsMax: 7, prdRef: { section: "Section 7.2", excerpt: "Trip metadata + components + comment counts + insider tips" } },
        { id: "P2.2", title: "GET /trips/:id/components/:componentId - Full component detail with comments", assignee: "kalpa", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 7.2", excerpt: "Full component detail including comments with review statuses" } },
        { id: "P2.3", title: "PATCH /trips/:id/components/:componentId/decision - Update Client Decision", assignee: "kalpa", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 7.2 + 7.9", excerpt: "Update Client Decision + auto-create Notion Task Dashboard task" } },
        { id: "P2.4", title: "POST /trips/:id/components/:componentId/comments - Append comment to JSON", assignee: "kalpa", pointsMin: 3, pointsMax: 5, prdRef: { section: "Section 7.2 + 4.5", excerpt: "Append comment to component's Comments JSON + auto-create task" } },
        { id: "P2.5", title: "PATCH /trips/:id/feedback - Submit planning or trip feedback", assignee: "kalpa", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 7.2 + 4.7", excerpt: "Submit planning or trip feedback (rating + pill tags)" } },
        { id: "P2.6", title: "GET /trips - Trip list for authenticated member", assignee: "kalpa", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 7.2", excerpt: "Trip list for authenticated member" } },
        { id: "P2.7", title: "Notion Task Dashboard auto-create integration", assignee: "kalpa", pointsMin: 4, pointsMax: 4, prdRef: { section: "Section 7.9", excerpt: "Every member action auto-creates a task in Notion Task Dashboard. Deduplication: same component within 5 min = single task." } },
      ]
    },
    {
      id: "P3", group: "prereq", title: "Task Dashboard Integration",
      description: "Auto-create Notion tasks from member actions per PRD Section 7.9",
      assignee: "shashila", qaAssignee: "thilini",
      pointsMin: 8, pointsMax: 12, isMvp: true,
      ganttStart: "2026-03-23", ganttEnd: "2026-04-01",
      dependencies: ["P1"], blocksTickets: ["C3", "C4"],
      prdRef: { section: "Section 7.9 - Notion Task Dashboard Integration", excerpt: "Approve, Decline, Request Changes, Post Comment, Submit Feedback -- all auto-create tasks with deduplication" },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "P3.1", title: "Task creation logic for approve/decline/request-changes/comment actions", assignee: "shashila", pointsMin: 5, pointsMax: 8, prdRef: { section: "Section 7.9", excerpt: "6 task types with title templates, priority mapping, and deduplication" } },
        { id: "P3.2", title: "Batch handling: 3+ actions within 2 min = single summary task", assignee: "shashila", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 7.9", excerpt: "Batch handling: 3+ approve/decline within 2 min = single summary task" } },
      ]
    },
    {
      id: "P4", group: "prereq", title: "Phase-Dependent View Logic",
      description: "Control what UI sections show/hide based on trip status per PRD Section 5",
      assignee: "kalpa", qaAssignee: "thilini",
      pointsMin: 5, pointsMax: 8, isMvp: true,
      ganttStart: "2026-03-23", ganttEnd: "2026-03-28",
      dependencies: ["P2"], blocksTickets: ["C1", "C2", "C3", "C5"],
      prdRef: { section: "Section 5 - Phase-Dependent View Logic", excerpt: "8 trip phases control visibility of status banner, At a Glance, itinerary, comments, feedback, insider tips" },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "P4.1", title: "Phase-to-visibility mapping engine (8 phases x 7 UI sections)", assignee: "kalpa", pointsMin: 3, pointsMax: 5, prdRef: { section: "Section 5", excerpt: "Not Started/Trip Identified: only status + summary. Outline: draft components. Itinerary Review: FULL interactive view" } },
        { id: "P4.2", title: "Component state validation per phase (Section 4.10.5 cross-reference)", assignee: "kalpa", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 4.10.5", excerpt: "Cross-reference table: valid component states per trip phase" } },
      ]
    },

    // === CORE FEATURES ===
    {
      id: "C1", group: "core", title: "Trip Page Header",
      description: "Status banner + trip summary card + travelers row per PRD Section 4.1",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 16, pointsMax: 22, isMvp: true,
      ganttStart: "2026-03-28", ganttEnd: "2026-04-04",
      dependencies: ["P2", "P4", "G3"], blocksTickets: [],
      prdRef: { section: "Section 4.1 - Trip Page Header", excerpt: "Status Banner: horizontal stage progression bar with 3 stages visible. Trip Summary Card: name, destinations, dates, party size, type. Travelers Row: circular avatars." },
      figmaRef: { nodeId: "TBD", label: "Trip Page Header", description: "Status progression bar + summary card + traveler avatars" },
      impactIfRemoved: "No trip status visibility. Users cannot see what phase their trip is in.",
      subIssues: [
        { id: "C1.1", title: "Status Banner - 3-stage horizontal progression bar with animations", assignee: "waruna", pointsMin: 4, pointsMax: 6, prdRef: { section: "Section 4.1", excerpt: "Previous stage (40% opacity, solid line) -> Current (full opacity, pill badge, animated pulse) -> Next (40% opacity, dotted line)" } },
        { id: "C1.2", title: "Trip Summary Card - name, destinations, dates, party size, trip type", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.1", excerpt: "Trip name, destinations, travel dates, party size, trip type" } },
        { id: "C1.3", title: "Travelers Row - avatars, initials fallback, overflow, invite button", assignee: "waruna", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 4.1", excerpt: "32px circular avatars, initials fallback, max 6 visible, +N overflow, Invite button" } },
        { id: "C1.4", title: "Cover image hero with gradient overlay", assignee: "waruna", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 6.1", excerpt: "Cover Image URL field on Trips DB" } },
        { id: "C1.5", title: "Phase-dependent header variations (8 phases)", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 5", excerpt: "Not Started: placeholder message. Itinerary Review: full header. Finalized: confirmed badge." } },
      ]
    },
    {
      id: "C2", group: "core", title: "At a Glance Timeline",
      description: "Compact vertical timeline showing entire trip shape per PRD Section 4.2",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 14, pointsMax: 20, isMvp: true,
      ganttStart: "2026-03-30", ganttEnd: "2026-04-06",
      dependencies: ["P2", "P4", "G3"], blocksTickets: [],
      prdRef: { section: "Section 4.2 - At a Glance Timeline", excerpt: "Compact vertical timeline: date, city pill, component rows with category icon + all-caps label + status badge + name + key time" },
      figmaRef: { nodeId: "TBD", label: "At a Glance Timeline", description: "Vertical timeline with day rows, city pills, component status" },
      impactIfRemoved: "Users lose trip shape overview. Must scroll entire itinerary to understand trip structure.",
      subIssues: [
        { id: "C2.1", title: "Day rows with date + city pills + transition pills", assignee: "waruna", pointsMin: 4, pointsMax: 6, prdRef: { section: "Section 4.2", excerpt: "Date: abbreviated month + day. City pill: colored pill. Transition pills for city changes (e.g., London -> Paris)" } },
        { id: "C2.2", title: "Component rows with category icon + label + status badge + key time", assignee: "waruna", pointsMin: 4, pointsMax: 6, prdRef: { section: "Section 4.2", excerpt: "Category icon + all-caps label (muted) + status badge + component name bold + right-aligned key time" } },
        { id: "C2.3", title: "Scroll-to-detail: tap component row -> smooth scroll to card", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.2", excerpt: "Tapping component row smooth-scrolls to card. Brief highlight animation." } },
        { id: "C2.4", title: "Phase behavior variations (hidden, draft, full, finalized)", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.2", excerpt: "Not Started/Trip Identified: Hidden. Outline: draft, no badges. Itinerary Review: full. Finalized: only confirmed." } },
      ]
    },
    {
      id: "C3", group: "core", title: "Detailed Itinerary & Component Cards",
      description: "Day-by-day structure with component cards, option groups, decision actions per PRD Section 4.3",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 30, pointsMax: 40, isMvp: true, isLargest: true,
      ganttStart: "2026-03-30", ganttEnd: "2026-04-11",
      dependencies: ["P2", "P3", "P4", "G3"], blocksTickets: ["C4"],
      prdRef: { section: "Section 4.3 - Detailed Itinerary & Component Cards", excerpt: "Day-by-day with date headers. Component cards: name, category label, status, key details, hero image, pricing, advisor notes, comment count. Option Groups: horizontal swipeable carousel." },
      figmaRef: { nodeId: "TBD", label: "Component Cards & Itinerary", description: "Day-by-day itinerary with component cards" },
      impactIfRemoved: "ENTIRE FEATURE IS GONE. This IS the trip page.",
      subIssues: [
        { id: "C3.1", title: "Day-by-day structure with sticky day jump pill + day picker overlay", assignee: "waruna", pointsMin: 5, pointsMax: 7, prdRef: { section: "Section 4.3", excerpt: "Sticky floating pill (Day 3 of 7 - Paris). Tapping opens day picker overlay. Days with pending decisions show action dot." } },
        { id: "C3.2", title: "Component Card UI - all 8 elements per card spec", assignee: "waruna", pointsMin: 6, pointsMax: 8, prdRef: { section: "Section 4.3", excerpt: "Card elements: name, category label (all-caps text, NOT pill), status, key details, hero image, pricing, advisor notes, comment count" } },
        { id: "C3.3", title: "Option Group carousel with dot indicator + comparison bar", assignee: "waruna", pointsMin: 4, pointsMax: 6, prdRef: { section: "Section 4.3", excerpt: "Components sharing same Option Group in horizontal swipeable carousel. Dot indicator. Sticky comparison bar for 2+ options." } },
        { id: "C3.4", title: "Decision actions: Approve / Decline / Request Changes with overlays", assignee: "waruna", pointsMin: 5, pointsMax: 7, prdRef: { section: "Section 4.3", excerpt: "Approve: green checkmark overlay. Decline: card dims. Request Changes: opens comment sheet. Reversible via undo." } },
        { id: "C3.5", title: "Undo decision flow (tap decided card -> undo -> reset to Pending)", assignee: "waruna", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 4.3", excerpt: "Tapping decided card -> undo -> resets to Pending" } },
        { id: "C3.6", title: "To Be Scheduled section for components without dates", assignee: "waruna", pointsMin: 2, pointsMax: 3, prdRef: { section: "Section 4.3", excerpt: "Components without dates appear in To Be Scheduled section at bottom" } },
        { id: "C3.7", title: "Type-specific card layouts (flight, hotel, dining, experience, transfer, VIP)", assignee: "waruna", pointsMin: 6, pointsMax: 6, prdRef: { section: "Section 4.3", excerpt: "Key details vary by type: Flights (route, dates, cabin), Hotels (city, dates, address), etc." } },
      ]
    },
    {
      id: "C4", group: "core", title: "Component Detail View",
      description: "Full-page detail view with carousel, reasoning, pricing, actions per PRD Section 4.4",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 20, pointsMax: 28, isMvp: true,
      ganttStart: "2026-04-04", ganttEnd: "2026-04-12",
      dependencies: ["P2", "C3", "G3"], blocksTickets: [],
      prdRef: { section: "Section 4.4 - Component Detail View", excerpt: "Hero image carousel, Why we love this option reasoning, Website link, Detailed pricing, Additional details, Sticky footer actions, Comments section" },
      figmaRef: { nodeId: "TBD", label: "Component Detail View", description: "Full detail view with carousel, reasoning, pricing" },
      impactIfRemoved: "Users can only see card summaries. No reasoning, no detailed pricing, no image carousel.",
      subIssues: [
        { id: "C4.1", title: "Hero Image Carousel with pinch-to-zoom + lightbox", assignee: "waruna", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 4.4 + 7.6", excerpt: "Swipeable carousel, dot indicator, pinch-to-zoom, lightbox. Image URL parsing: split by newline, https:// required." } },
        { id: "C4.2", title: "'Why we love this option' reasoning section", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.4 + 7.7", excerpt: "Advisor reasoning: bold text = title, rest = body. Empty = section omitted." } },
        { id: "C4.3", title: "Detailed Pricing - cash, points, taxes, per-night, value assessment", assignee: "waruna", pointsMin: 3, pointsMax: 5, prdRef: { section: "Section 4.4", excerpt: "Total cash, points, taxes, per-night rate, points value assessment. Side-by-side if both exist." } },
        { id: "C4.4", title: "Type-specific Additional Details section", assignee: "waruna", pointsMin: 3, pointsMax: 5, prdRef: { section: "Section 4.4", excerpt: "Varies by type: check-in times, airline, cuisine, duration, etc." } },
        { id: "C4.5", title: "Sticky footer with approve/decline + 'Ask a question' quick-action", assignee: "waruna", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 4.4", excerpt: "Sticky footer: approve/decline/request changes + chat-bubble icon Ask a question (opens comment sheet)" } },
        { id: "C4.6", title: "Finalized detail view - read-only, Confirmed badge + conf number", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.4", excerpt: "Read-only. Carousel/reasoning/pricing visible. Confirmed badge + conf number instead of approve/decline." } },
      ]
    },
    {
      id: "C5", group: "core", title: "Finalized View",
      description: "Read-only finalized trip view when Booking Complete per PRD Section 4.6",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 10, pointsMax: 14, isMvp: true,
      ganttStart: "2026-04-10", ganttEnd: "2026-04-15",
      dependencies: ["P4", "C3", "C4"], blocksTickets: [],
      prdRef: { section: "Section 4.6 - Finalized View", excerpt: "All decision UI removed. Only confirmed/booked shown. Confirmation numbers displayed. Addresses front and center." },
      figmaRef: { nodeId: "TBD", label: "Finalized View", description: "Read-only confirmed trip view" },
      impactIfRemoved: "Post-booking users see interactive UI that no longer applies. Confusing UX.",
      subIssues: [
        { id: "C5.1", title: "Strip decision UI, show only confirmed/booked components", assignee: "waruna", pointsMin: 3, pointsMax: 5, prdRef: { section: "Section 4.6", excerpt: "All decision UI removed. Only confirmed/booked components shown." } },
        { id: "C5.2", title: "Confirmation numbers + addresses prominent display", assignee: "waruna", pointsMin: 4, pointsMax: 5, prdRef: { section: "Section 4.6", excerpt: "Confirmation numbers displayed prominently. Addresses and logistics front and center." } },
        { id: "C5.3", title: "Preserved day structure with increased whitespace", assignee: "waruna", pointsMin: 3, pointsMax: 4, prdRef: { section: "Section 4.6", excerpt: "Day-by-day structure preserved, more whitespace. Comments accessible but de-emphasized." } },
      ]
    },

    // === FAST-FOLLOW ===
    {
      id: "F1", group: "fast-follow", title: "Component Comments",
      description: "Comment system stored as JSON on component per PRD Section 4.5",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 16, pointsMax: 22, isMvp: false,
      ganttStart: "2026-04-16", ganttEnd: "2026-04-28",
      dependencies: ["C3", "C4"], blocksTickets: [],
      prdRef: { section: "Section 4.5 - Component Comments", excerpt: "Comments as structured JSON array on Components DB. Badge count, review status lifecycle, visibility filter." },
      figmaRef: { nodeId: "TBD", label: "Comment Sheet", description: "Comment thread UI on component" },
      impactIfRemoved: null,
      subIssues: [
        { id: "F1.1", title: "Comment badge on component card (unresolved count)", assignee: "waruna", pointsMin: 2, pointsMax: 3 },
        { id: "F1.2", title: "Comment section in detail view", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F1.3", title: "Post comment flow (append JSON + create task)", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F1.4", title: "Review status display (Reviewing, Addressed, Won't Address)", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F1.5", title: "Comment visibility filter (All vs Open only)", assignee: "waruna", pointsMin: 2, pointsMax: 3 },
        { id: "F1.6", title: "Request Changes -> auto-create comment with tag", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
      ]
    },
    {
      id: "F2", group: "fast-follow", title: "Feedback Modals",
      description: "Post-planning and post-trip feedback modals per PRD Section 4.7",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 10, pointsMax: 14, isMvp: false,
      ganttStart: "2026-04-20", ganttEnd: "2026-04-30",
      dependencies: ["P2"], blocksTickets: [],
      prdRef: { section: "Section 4.7 - Feedback Modals", excerpt: "5-star rating + pill tags. Post-planning (Booking Complete trigger). Post-trip (Post Trip trigger). 3 dismissals -> persistent banner." },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "F2.1", title: "Post-planning feedback modal with 5-star + positive/improvement pills", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F2.2", title: "Post-trip feedback modal with trip-specific pills", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F2.3", title: "Dismissal logic: 3 dismissals -> persistent banner", assignee: "waruna", pointsMin: 2, pointsMax: 3 },
        { id: "F2.4", title: "Feedback submission to PATCH /trips/:id/feedback", assignee: "waruna", pointsMin: 2, pointsMax: 3 },
      ]
    },
    {
      id: "F3", group: "fast-follow", title: "Push Notifications",
      description: "Deep-linking notifications per PRD Section 4.8",
      assignee: "shashila", qaAssignee: "thilini",
      pointsMin: 10, pointsMax: 14, isMvp: false,
      ganttStart: "2026-04-20", ganttEnd: "2026-05-02",
      dependencies: ["P2", "P3"], blocksTickets: [],
      prdRef: { section: "Section 4.8 - Push Notifications", excerpt: "4 triggers: status change, new components, advisor reply, feedback prompt. Quiet hours 10PM-8AM. Throttle limits." },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "F3.1", title: "Trip status change notification with deep link", assignee: "shashila", pointsMin: 3, pointsMax: 5 },
        { id: "F3.2", title: "New components + advisor reply notifications with batching", assignee: "shashila", pointsMin: 4, pointsMax: 5 },
        { id: "F3.3", title: "Quiet hours (10PM-8AM) + throttle logic", assignee: "shashila", pointsMin: 3, pointsMax: 4 },
      ]
    },
    {
      id: "F4", group: "fast-follow", title: "Insider Tips",
      description: "Collapsible accordion with curated travel tips per PRD Section 4.9",
      assignee: "waruna", qaAssignee: "thilini",
      pointsMin: 8, pointsMax: 12, isMvp: false,
      ganttStart: "2026-04-16", ganttEnd: "2026-04-25",
      dependencies: ["P1", "P2"], blocksTickets: [],
      prdRef: { section: "Section 4.9 - Insider Tips", excerpt: "Collapsible accordion: Transportation, Money & Connectivity, Culture & Etiquette, Packing & Prep. Visible from Outline phase. One-time tooltip." },
      figmaRef: null,
      impactIfRemoved: null,
      subIssues: [
        { id: "F4.1", title: "Accordion UI with 4 categories + icons", assignee: "waruna", pointsMin: 3, pointsMax: 4 },
        { id: "F4.2", title: "Rich text rendering (Notion -> sanitized HTML)", assignee: "waruna", pointsMin: 3, pointsMax: 5 },
        { id: "F4.3", title: "One-time tooltip for first-view discoverability", assignee: "waruna", pointsMin: 2, pointsMax: 3 },
      ]
    },

    // === DESIGN GAPS ===
    {
      id: "G1", group: "design-gap", title: "Onboarding Modal",
      description: "First-time user onboarding for dynamic trip page",
      assignee: "juan", qaAssignee: "thilini",
      pointsMin: 3, pointsMax: 5, isMvp: true,
      ganttStart: "2026-03-16", ganttEnd: "2026-03-21",
      dependencies: [], blocksTickets: [],
      prdRef: null, figmaRef: null, impactIfRemoved: null, subIssues: []
    },
    {
      id: "G2", group: "design-gap", title: "Suggestion States",
      description: "Design for empty states, error states, and loading skeletons",
      assignee: "juan", qaAssignee: "thilini",
      pointsMin: 2, pointsMax: 4, isMvp: true,
      ganttStart: "2026-03-16", ganttEnd: "2026-03-22",
      dependencies: [], blocksTickets: [],
      prdRef: { section: "Section 7.11 - Error & Empty States", excerpt: "12 error/empty scenarios defined: empty reasoning, no images, pricing empty, fetch fails, etc." },
      figmaRef: null, impactIfRemoved: null, subIssues: []
    },
    {
      id: "G3", group: "design-gap", title: "Full Design Pass",
      description: "Complete Figma designs for all core screens -- BLOCKS ALL UI WORK",
      assignee: "juan", qaAssignee: "thilini",
      pointsMin: 16, pointsMax: 24, isMvp: true, isBlocker: true,
      ganttStart: "2026-03-16", ganttEnd: "2026-03-28",
      dependencies: [], blocksTickets: ["C1", "C2", "C3", "C4", "C5"],
      prdRef: null, figmaRef: null,
      impactIfRemoved: "ALL UI WORK STOPS. Waruna cannot build screens without final designs.",
      subIssues: []
    },
  ],

  // -- Risks --
  risks: [
    { id: "R1", title: "Juan (Design) availability unknown", severity: "critical", likelihood: "high", impact: "G3 (Full Design Pass) blocks all 5 Core UI tickets. If Juan is unavailable or slow, Waruna's 80-110 points of work cannot start.", mitigation: "Confirm Juan's availability and sprint commitment by March 17. Fallback: Waruna builds from prototype screens." },
    { id: "R2", title: "Waruna is single-threaded bottleneck", severity: "high", likelihood: "medium", impact: "80-110 points assigned to one person across 5 weeks = 16-22 pts/week. At 1pt = 1hr, this is at or above 40hr/week capacity.", mitigation: "Strict prioritization. C3 (Itinerary & Cards) is largest -- start first. Defer F1/F2/F4 fast-follows if behind." },
    { id: "R3", title: "Notion API rate limits under load", severity: "medium", likelihood: "low", impact: "3 req/sec limit. Task auto-creation + component reads could bottleneck during active user sessions.", mitigation: "PRD plans Redis/Postgres read-replica cache for V1.5. V1 acceptable at ~50 active trips." },
    { id: "R4", title: "PRD scope creep mid-sprint", severity: "medium", likelihood: "medium", impact: "PRD already changed between Mar 5 and Mar 9 (countdown timer removed, comment model restructured). Further changes add rework.", mitigation: "Lock PRD scope for Core features by Sprint 9 start (Mar 16). Change control process for additions." },
    { id: "R5", title: "Cross-timezone coordination", severity: "low", likelihood: "high", impact: "Waruna (GMT-6) and Kalpa/Shashila (GMT+5:30) have 11.5-hour gap. Blockers discovered at end of Waruna's day wait 12+ hours for response.", mitigation: "Async handoff notes in Linear. 30-min overlap window at start of Waruna's day for sync." },
  ],

  // -- Computed (populated on load) --
  computed: {}
};

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
