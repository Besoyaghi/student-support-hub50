(function () {
  function getClient() {
    if (!window.supabase || !window.SSHUB_SUPABASE) return null;

    const config = window.SSHUB_SUPABASE;
    if (!config.url || !config.anonKey) return null;
    if (String(config.anonKey).includes("PASTE_")) return null;

    return window.supabase.createClient(config.url, config.anonKey);
  }

  function mapPaper(row) {
    return {
      id: "backend-" + (row.slug || row.id),
      backendId: row.id,
      backend: true,
      num: row.paper_number || 0,
      title: row.title || "Untitled paper",
      authors: row.authors_text || "Student Support Hub Backend",
      abstract: row.abstract || "",
      year: row.year || "",
      category: row.category_name || "Backend Library",
      club: row.source || "Supabase",
      source: row.source || "Supabase",
      keywords: row.keywords || [],
      pdf: row.pdf_url || "",
      citation_apa: row.citation_apa || "",
      citation_mla: row.citation_mla || "",
      citation_chicago: row.citation_chicago || ""
    };
  }

  async function loadPapers() {
    const client = getClient();
    if (!client) {
      return { ok: false, papers: [], message: "Supabase is not configured." };
    }

    const { data, error } = await client
      .from("papers")
      .select(
        "id, slug, title, abstract, year, type, source, paper_number, keywords, pdf_url, citation_apa, citation_mla, citation_chicago, status"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Student Support Hub Supabase load failed:", error.message);
      return { ok: false, papers: [], message: error.message };
    }

    return {
      ok: true,
      papers: (data || []).map(mapPaper),
      message: `Loaded ${(data || []).length} backend paper(s).`
    };
  }

  window.SSHUB_BACKEND = {
    loadPapers
  };
})();