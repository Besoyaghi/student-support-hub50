// legacy-data.js
// AMRC Research Hub — Legacy & Impact data module
// All sections use empty states until real data is provided by the user.
// DO NOT populate with fake names, fake events, or fake rankings.

window.LEGACY_DATA = {

  // ─── School / AMRC Timeline ───────────────────────────────────────────────
  // Add real events here when confirmed. Each entry:
  // { year: "2004", title: "...", description: "..." }
  timeline: [
    // PLACEHOLDER — replace with real canon events
    // { year: "2010", title: "AMRC Founded", description: "The Al Mawakeb Research Centre was established at Garhoud." },
  ],

  // ─── Summary Stats ────────────────────────────────────────────────────────
  // Update these numbers when verified.
  stats: {
    totalResearchers: null,       // e.g. 120
    totalPapers: null,            // e.g. 312
    totalPublications: null,      // e.g. 8
    yearsActive: null,            // e.g. 14
  },

  // ─── Contributor Rankings ─────────────────────────────────────────────────
  // Add real contributors when verified. Each entry:
  // {
  //   name: "Full Name",
  //   years: 3,                  // years in AMRC
  //   papers: 12,                // number of research papers contributed
  //   publications: 2,           // number of books/anthologies included in
  //   leadership: true,          // held a leadership role?
  //   roles: ["Editor", "Lead Researcher"]
  // }
  contributors: [
    // PLACEHOLDER — do not add fake names
    // Real data will be provided by the AMRC team for verification
  ],

  // ─── Data Rules / Transparency Notice ────────────────────────────────────
  transparency: {
    message: "All rankings and statistics on this page are based on verified AMRC records only. Data will be updated as contributions are confirmed by the AMRC team.",
    lastUpdated: null,            // e.g. "June 2025"
  },
};
