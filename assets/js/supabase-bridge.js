(function () {
  function getClient() {
    if (!window.supabase || !window.SSHUB_SUPABASE) return null;

    const config = window.SSHUB_SUPABASE;
    if (!config.url || !config.anonKey) return null;
    if (String(config.anonKey).includes("PASTE_")) return null;

    return window.supabase.createClient(config.url, config.anonKey);
  }

  function canonicalBookId(slugOrId) {
    const key = String(slugOrId || '');
    const map = {
      'amo2-unravel-the-past-2024': 'book_amo2_2024',
      'reigns-of-revolution-2025': 'book_ror',
      'amo2-beneath-the-surface-2025': 'book_amo2_2025',
      'between-order-and-chaos-2026': 'book_amag_geo'
    };

    return map[key] || ('backend-book-' + key);
  }

  function academicYearId(year) {
    if (Number(year) === 2024) return "ay_2024";
    if (Number(year) === 2025) return "ay_2025";
    if (Number(year) === 2026) return "ay_2026";
    return "ay_2025";
  }

  function mapBook(row) {
    const baseId = row.slug || row.id;

    return {
      id: canonicalBookId(baseId),
      backendId: row.id,
      backend: true,
      title: row.title || "Untitled book",
      description: row.description || row.subtitle || "",
      publicationYear: row.year || new Date().getFullYear(),
      editors: row.source || "AMRC Research Hub",
      clubId: "club_amg",
      academicYearId: academicYearId(row.year),
      pdf: row.pdf_url || "",
      pages: 0,
      papers: 0,
      size: 0
    };
  }

  function mapPaper(row) {
    const bookSlug = row.books && row.books.slug ? row.books.slug : null;
    const backendBookId = bookSlug
      ? canonicalBookId(bookSlug)
      : row.book_id
        ? canonicalBookId(row.book_id)
        : "";

    return {
      id: "backend-" + (row.slug || row.id),
      backendId: row.id,
      backend: true,
      num: row.paper_number || 0,
      title: row.title || "Untitled paper",
      authors: Array.isArray(row.paper_authors) && row.paper_authors.length
        ? row.paper_authors
            .slice()
            .sort((a,b)=>(a.author_order || 0) - (b.author_order || 0))
            .map(pa => pa.authors?.full_name)
            .filter(Boolean)
            .join(", ")
        : "Author not listed",
      abstract: row.abstract || "",
      year: row.year || "",
      category: row.categories && row.categories.name ? row.categories.name : "Uncategorized",
      club: row.source || "AMRC Research Hub",
      source: row.source || "AMRC Research Hub",
      keywords: row.keywords || [],
      pdf: row.pdf_url || "",
      bookId: backendBookId,
      citation_apa: row.citation_apa || "",
      citation_mla: row.citation_mla || "",
      citation_chicago: row.citation_chicago || ""
    };
  }

  async function fetchAllPaged(buildQuery, pageSize) {
    let all = [];
    let from = 0;
    const size = pageSize || 1000;

    while (true) {
      const to = from + size - 1;
      const { data, error } = await buildQuery().range(from, to);

      if (error) return { data: all, error };

      const rows = data || [];
      all = all.concat(rows);

      if (rows.length < size) break;
      from += size;
      if (from > 20000) break;
    }

    return { data: all, error: null };
  }

  async function loadBooks() {
    const client = getClient();
    if (!client) {
      return { ok: false, books: [], message: "Supabase is not configured." };
    }

    const { data, error } = await fetchAllPaged(() => client
      .from("books")
      .select("id, slug, title, subtitle, description, year, source, pdf_url, status")
      .eq("status", "published")
      .order("created_at", { ascending: false }), 1000);

    if (error) {
      console.warn("Student Support Hub Supabase books load failed:", error.message);
      return { ok: false, books: [], message: error.message };
    }

    return {
      ok: true,
      books: (data || []).map(mapBook),
      message: `Loaded ${(data || []).length} backend book(s).`
    };
  }

  async function loadPapers() {
    const client = getClient();
    if (!client) {
      return { ok: false, papers: [], message: "Supabase is not configured." };
    }

    const selectColumns = "id, slug, title, abstract, year, type, source, book_id, paper_number, keywords, pdf_url, citation_apa, citation_mla, citation_chicago, status, books(slug,title), categories(name), paper_authors(author_order, authors(full_name))";

    const { data, error } = await fetchAllPaged(() => client
      .from("papers")
      .select(selectColumns)
      .eq("status", "published")
      .order("book_id", { ascending: true })
      .order("paper_number", { ascending: true })
      .order("created_at", { ascending: false }), 1000);

    if (error) {
      console.warn("Student Support Hub Supabase papers load failed:", error.message);
      return { ok: false, papers: [], message: error.message };
    }

    return {
      ok: true,
      papers: (data || []).map(mapPaper),
      message: `Loaded ${(data || []).length} backend paper(s).`
    };
  }

  window.SSHUB_BACKEND = {
    loadBooks,
    loadPapers
  };
})();
