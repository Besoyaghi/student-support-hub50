const { useEffect, useMemo, useState } = React;
const ROUTES = ['home', 'research', 'publications', 'subjects', 'collaborations', 'alumni', 'assistant', 'ap', 'ap-resources', 'ap-decider', 'reading-list', 'book', 'paper','legacy'];
const STORAGE = {
    readingList: 'ssh_reading_list_v3',
    auth: 'ssh_admin_auth_v3',
    assistant: 'ssh_ai_assistant_history_v1'
};
function parseRoute() {
    const raw = (location.hash || '#/home').replace(/^#\/?/, '');
    let [page = 'home', ...rest] = raw.split('/');
    if (page === 'ap-resources' || page === 'ap-decider')
        page = 'ap';
    return { page: ROUTES.includes(page) ? page : 'home', id: rest.length ? decodeURIComponent(rest.join('/')) : null };
}
function go(page, id) { location.hash = id ? `#/${page}/${encodeURIComponent(id)}` : `#/${page}`; }
function readJSON(key, fallback) { var _a; try {
    return (_a = JSON.parse(localStorage.getItem(key))) !== null && _a !== void 0 ? _a : fallback;
}
catch (_b) {
    return fallback;
} }
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function appData(key, fallback) { var _a; try {
    return (_a = DB === null || DB === void 0 ? void 0 : DB.get(key, fallback)) !== null && _a !== void 0 ? _a : fallback;
}
catch (_b) {
    return fallback;
} }
function setAppData(key, value) { try {
    DB === null || DB === void 0 ? void 0 : DB.set(key, value);
}
catch (_a) {
    localStorage.setItem(key, JSON.stringify(value));
} }
function partnerData(key, fallback) { var _a; try {
    return ((_a = window.SSH_PARTNER_DATA) === null || _a === void 0 ? void 0 : _a[key]) || fallback;
}
catch (_b) {
    return fallback;
} }
function alumniSource() { try {
    return window.SSH_ALUMNI_DATA || { regions: [] };
}
catch (_a) {
    return { regions: [] };
} }
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }
function short(text, len = 160) { if (!text)
    return ''; return text.length > len ? text.slice(0, len).trim() + '…' : text; }
function toText(value) { return Array.isArray(value) ? value.join(', ') : (value || ''); }
function normalize(s) { return String(s || '').toLowerCase().trim(); }
function initials(name) { return String(name || 'AMRC').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }
function baseUrl() { return location.href.split('#')[0]; }
function pdfUrl(path) { if (!path)
    return ''; if (path.startsWith('idb:'))
    return path; try {
    return new URL(path, baseUrl()).href;
}
catch (_a) {
    return path;
} }
function getBookPdf(book) { return (book === null || book === void 0 ? void 0 : book.pdf) ? { pdf: book.pdf, pages: book.pages || 0, papers: book.papers || 0, size: book.size || 0 } : (FULL_BOOK_PDFS[book === null || book === void 0 ? void 0 : book.id] || null); }
function formatBytes(bytes) { if (!bytes)
    return ''; const mb = bytes / 1024 / 1024; return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
function copyText(text) { var _a; (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(text); }
const AP_AREAS = [
    'Arts', 'English', 'History & Social Sciences', 'Math & Computer Science', 'Sciences', 'World Languages & Cultures', 'AP Capstone', 'AP Career Kickstart'
];
const AP_COURSES = [
    { name: 'AP 2-D Art and Design', area: 'Arts', difficulty: 3, workload: 3, writing: 2, math: 1, memorization: 2, grades: [10, 11, 12], interests: ['arts', 'design', 'architecture'], pathways: ['arts'], summary: 'Portfolio-driven design course for students who can create consistently over time.' },
    { name: 'AP 3-D Art and Design', area: 'Arts', difficulty: 3, workload: 3, writing: 1, math: 1, memorization: 1, grades: [10, 11, 12], interests: ['arts', 'design', 'architecture'], pathways: ['arts'], summary: 'Best for sculpture, product design, architecture, and spatial portfolio work.' },
    { name: 'AP Drawing', area: 'Arts', difficulty: 3, workload: 3, writing: 1, math: 1, memorization: 1, grades: [10, 11, 12], interests: ['arts', 'design'], pathways: ['arts'], summary: 'Portfolio course for students building a drawing-centered creative body of work.' },
    { name: 'AP Art History', area: 'Arts', difficulty: 3, workload: 4, writing: 3, math: 1, memorization: 4, grades: [10, 11, 12], interests: ['arts', 'history', 'culture'], pathways: ['humanities', 'arts'], summary: 'Strong for students who like art, history, culture, and visual analysis.' },
    { name: 'AP Music Theory', area: 'Arts', difficulty: 3, workload: 3, writing: 1, math: 2, memorization: 3, grades: [10, 11, 12], interests: ['music', 'arts'], pathways: ['arts'], summary: 'Best for musicians who want composition, harmony, ear training, and notation.' },
    { name: 'AP English Language and Composition', area: 'English', difficulty: 4, workload: 4, writing: 5, math: 1, memorization: 2, grades: [11, 12], interests: ['writing', 'law', 'debate', 'media', 'research'], pathways: ['humanities', 'law', 'business'], summary: 'Excellent for argument, rhetoric, nonfiction reading, and college writing readiness.' },
    { name: 'AP English Literature and Composition', area: 'English', difficulty: 4, workload: 4, writing: 5, math: 1, memorization: 2, grades: [11, 12], interests: ['literature', 'writing', 'arts'], pathways: ['humanities', 'arts'], summary: 'Best for students who enjoy novels, poetry, close reading, and interpretation.' },
    { name: 'AP African American Studies', area: 'History & Social Sciences', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['history', 'culture', 'justice'], pathways: ['humanities', 'law'], summary: 'Interdisciplinary course for history, culture, politics, and social analysis.' },
    { name: 'AP Comparative Government and Politics', area: 'History & Social Sciences', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [11, 12], interests: ['policy', 'law', 'global', 'debate'], pathways: ['law', 'humanities'], summary: 'Good for global politics, international systems, law, and comparative institutions.' },
    { name: 'AP European History', area: 'History & Social Sciences', difficulty: 4, workload: 4, writing: 4, math: 1, memorization: 4, grades: [10, 11, 12], interests: ['history', 'culture', 'law'], pathways: ['humanities', 'law'], summary: 'Reading-heavy course for students ready for historical argument and evidence.' },
    { name: 'AP Human Geography', area: 'History & Social Sciences', difficulty: 2, workload: 2, writing: 2, math: 1, memorization: 3, grades: [9, 10], interests: ['global', 'policy', 'environment', 'culture'], pathways: ['humanities', 'business'], summary: 'A strong first AP for students who like societies, cities, migration, and global issues.' },
    { name: 'AP Macroeconomics', area: 'History & Social Sciences', difficulty: 3, workload: 3, writing: 2, math: 3, memorization: 3, grades: [11, 12], interests: ['economics', 'finance', 'business'], pathways: ['business', 'stem'], summary: 'Useful for business, finance, policy, and understanding national economies.' },
    { name: 'AP Microeconomics', area: 'History & Social Sciences', difficulty: 3, workload: 3, writing: 2, math: 3, memorization: 3, grades: [11, 12], interests: ['economics', 'business', 'entrepreneurship'], pathways: ['business', 'stem'], summary: 'Great for markets, incentives, entrepreneurship, and decision-making.' },
    { name: 'AP Psychology', area: 'History & Social Sciences', difficulty: 2, workload: 2, writing: 2, math: 1, memorization: 4, grades: [10, 11, 12], interests: ['psychology', 'medicine', 'people', 'education'], pathways: ['medicine', 'humanities'], summary: 'Accessible option for behavior, mental processes, health, and social science interests.' },
    { name: 'AP United States Government and Politics', area: 'History & Social Sciences', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [11, 12], interests: ['law', 'policy', 'debate'], pathways: ['law', 'humanities'], summary: 'Strong for law, leadership, public policy, debate, and current events.' },
    { name: 'AP United States History', area: 'History & Social Sciences', difficulty: 4, workload: 4, writing: 4, math: 1, memorization: 4, grades: [11, 12], interests: ['history', 'law', 'policy'], pathways: ['law', 'humanities'], summary: 'Best after AP-style writing practice; excellent rigor for history-oriented students.' },
    { name: 'AP World History: Modern', area: 'History & Social Sciences', difficulty: 3, workload: 4, writing: 4, math: 1, memorization: 4, grades: [10, 11], interests: ['history', 'global', 'policy'], pathways: ['humanities', 'law'], summary: 'Good foundation for document-based writing and global historical thinking.' },
    { name: 'AP Calculus AB', area: 'Math & Computer Science', difficulty: 4, workload: 4, writing: 1, math: 5, memorization: 2, grades: [11, 12], interests: ['engineering', 'science', 'finance', 'math'], pathways: ['stem', 'medicine', 'business'], summary: 'Core STEM and quantitative AP; best after precalculus readiness.' },
    { name: 'AP Calculus BC', area: 'Math & Computer Science', difficulty: 5, workload: 5, writing: 1, math: 5, memorization: 2, grades: [11, 12], interests: ['engineering', 'physics', 'math', 'computer science'], pathways: ['stem'], summary: 'Choose only with very strong math readiness and capacity for intense pace.' },
    { name: 'AP Computer Science A', area: 'Math & Computer Science', difficulty: 4, workload: 4, writing: 1, math: 4, memorization: 2, grades: [10, 11, 12], interests: ['computer science', 'technology', 'engineering'], pathways: ['stem'], summary: 'Java-style programming and problem solving for serious CS/STEM students.' },
    { name: 'AP Computer Science Principles', area: 'Math & Computer Science', difficulty: 2, workload: 2, writing: 2, math: 2, memorization: 2, grades: [9, 10, 11, 12], interests: ['technology', 'business', 'creativity', 'data'], pathways: ['stem', 'business'], summary: 'Friendly first tech AP for coding, data, internet, and digital creativity.' },
    { name: 'AP Precalculus', area: 'Math & Computer Science', difficulty: 3, workload: 3, writing: 1, math: 4, memorization: 2, grades: [10, 11, 12], interests: ['engineering', 'science', 'finance', 'math'], pathways: ['stem', 'business'], summary: 'Strong bridge into calculus for STEM, economics, and quantitative majors.' },
    { name: 'AP Statistics', area: 'Math & Computer Science', difficulty: 3, workload: 3, writing: 2, math: 3, memorization: 3, grades: [10, 11, 12], interests: ['medicine', 'business', 'psychology', 'research', 'data'], pathways: ['medicine', 'business', 'humanities', 'stem'], summary: 'Highly flexible AP for research, medicine, business, psychology, and data.' },
    { name: 'AP Biology', area: 'Sciences', difficulty: 4, workload: 4, writing: 2, math: 2, memorization: 4, grades: [10, 11, 12], interests: ['medicine', 'biology', 'environment'], pathways: ['medicine', 'stem'], summary: 'Recommended for pre-med, biology, health science, and environmental paths.' },
    { name: 'AP Chemistry', area: 'Sciences', difficulty: 5, workload: 5, writing: 2, math: 4, memorization: 3, grades: [11, 12], interests: ['medicine', 'chemistry', 'engineering'], pathways: ['medicine', 'stem'], summary: 'Rigorous science AP; best after strong chemistry and algebra foundations.' },
    { name: 'AP Environmental Science', area: 'Sciences', difficulty: 3, workload: 3, writing: 2, math: 2, memorization: 3, grades: [10, 11, 12], interests: ['environment', 'policy', 'biology', 'global'], pathways: ['medicine', 'humanities', 'stem'], summary: 'Good for sustainability, ecology, public policy, and global issues.' },
    { name: 'AP Physics 1: Algebra-Based', area: 'Sciences', difficulty: 4, workload: 4, writing: 1, math: 4, memorization: 2, grades: [10, 11, 12], interests: ['engineering', 'physics', 'architecture'], pathways: ['stem'], summary: 'Algebra-based physics foundation for engineering and applied science.' },
    { name: 'AP Physics 2: Algebra-Based', area: 'Sciences', difficulty: 4, workload: 4, writing: 1, math: 4, memorization: 2, grades: [11, 12], interests: ['engineering', 'physics', 'medicine'], pathways: ['stem', 'medicine'], summary: 'Continues algebra-based physics into fluids, electricity, optics, and modern physics.' },
    { name: 'AP Physics C: Electricity and Magnetism', area: 'Sciences', difficulty: 5, workload: 5, writing: 1, math: 5, memorization: 2, grades: [11, 12], interests: ['engineering', 'physics'], pathways: ['stem'], summary: 'Calculus-based physics for advanced engineering and physics students.' },
    { name: 'AP Physics C: Mechanics', area: 'Sciences', difficulty: 5, workload: 5, writing: 1, math: 5, memorization: 2, grades: [11, 12], interests: ['engineering', 'physics'], pathways: ['stem'], summary: 'Best with calculus or concurrent calculus; key for physics and engineering.' },
    { name: 'AP Chinese Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 2, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'business'], summary: 'For students with language background or strong continuing study.' },
    { name: 'AP French Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'business'], summary: 'Strengthens communication, culture, and global readiness.' },
    { name: 'AP German Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'business'], summary: 'For students continuing German with a focus on cultural communication.' },
    { name: 'AP Italian Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'arts'], summary: 'Good fit for students with Italian background or extended language study.' },
    { name: 'AP Japanese Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 4, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'business'], summary: 'For students continuing Japanese with strong commitment to language practice.' },
    { name: 'AP Latin', area: 'World Languages & Cultures', difficulty: 4, workload: 4, writing: 3, math: 1, memorization: 4, grades: [10, 11, 12], interests: ['language', 'history', 'law'], pathways: ['humanities', 'law'], summary: 'Strong humanities AP for classics, law, history, and close textual analysis.' },
    { name: 'AP Spanish Language and Culture', area: 'World Languages & Cultures', difficulty: 3, workload: 3, writing: 3, math: 1, memorization: 3, grades: [10, 11, 12], interests: ['language', 'culture', 'global'], pathways: ['humanities', 'business', 'medicine'], summary: 'Broadly useful for communication, healthcare, business, and global pathways.' },
    { name: 'AP Spanish Literature and Culture', area: 'World Languages & Cultures', difficulty: 4, workload: 4, writing: 4, math: 1, memorization: 3, grades: [11, 12], interests: ['language', 'literature', 'culture'], pathways: ['humanities', 'arts'], summary: 'Advanced Spanish option for literature, analysis, and cultural interpretation.' },
    { name: 'AP Research', area: 'AP Capstone', difficulty: 4, workload: 4, writing: 5, math: 2, memorization: 1, grades: [11, 12], interests: ['research', 'science', 'humanities', 'writing'], pathways: ['medicine', 'stem', 'law', 'humanities', 'business'], summary: 'Independent research course best after AP Seminar or strong research maturity.' },
    { name: 'AP Seminar', area: 'AP Capstone', difficulty: 3, workload: 3, writing: 4, math: 1, memorization: 1, grades: [10, 11], interests: ['research', 'debate', 'writing'], pathways: ['medicine', 'stem', 'law', 'humanities', 'business'], summary: 'Excellent foundation for research, presentations, academic discussion, and evidence.' },
    { name: 'AP Business with Personal Finance', area: 'AP Career Kickstart', difficulty: 3, workload: 3, writing: 2, math: 3, memorization: 2, grades: [10, 11, 12], interests: ['business', 'finance', 'entrepreneurship'], pathways: ['business'], summary: 'Career-focused business and finance course; marked as emerging/availability dependent.', emerging: true },
    { name: 'AP Cybersecurity', area: 'AP Career Kickstart', difficulty: 4, workload: 4, writing: 1, math: 3, memorization: 2, grades: [10, 11, 12], interests: ['technology', 'cybersecurity', 'computer science'], pathways: ['stem'], summary: 'Career-focused cybersecurity course; school availability may vary during launch.', emerging: true },
    { name: 'AP Networking', area: 'AP Career Kickstart', difficulty: 4, workload: 4, writing: 1, math: 3, memorization: 2, grades: [11, 12], interests: ['technology', 'networking', 'computer science'], pathways: ['stem'], summary: 'Career-focused networking course; future availability depends on school adoption.', emerging: true }
];
const PATHWAYS = [
    { id: 'balanced', label: 'Balanced / undecided', interests: ['research', 'writing', 'technology', 'global'], priority: ['AP English Language and Composition', 'AP Statistics', 'AP Seminar', 'AP Psychology', 'AP Computer Science Principles'] },
    { id: 'medicine', label: 'Medicine / health science', interests: ['medicine', 'biology', 'psychology', 'research'], priority: ['AP Biology', 'AP Chemistry', 'AP Statistics', 'AP Psychology', 'AP English Language and Composition'] },
    { id: 'stem', label: 'Engineering / computer science', interests: ['engineering', 'computer science', 'physics', 'technology', 'math'], priority: ['AP Calculus AB', 'AP Calculus BC', 'AP Physics 1: Algebra-Based', 'AP Computer Science A', 'AP Computer Science Principles', 'AP Statistics'] },
    { id: 'business', label: 'Business / economics / finance', interests: ['business', 'finance', 'economics', 'entrepreneurship', 'data'], priority: ['AP Microeconomics', 'AP Macroeconomics', 'AP Statistics', 'AP Calculus AB', 'AP Computer Science Principles', 'AP English Language and Composition'] },
    { id: 'law', label: 'Law / politics / international relations', interests: ['law', 'policy', 'debate', 'history', 'global'], priority: ['AP United States Government and Politics', 'AP Comparative Government and Politics', 'AP United States History', 'AP English Language and Composition', 'AP World History: Modern'] },
    { id: 'humanities', label: 'Humanities / social science', interests: ['history', 'culture', 'writing', 'research', 'psychology'], priority: ['AP English Literature and Composition', 'AP World History: Modern', 'AP Psychology', 'AP Art History', 'AP Seminar'] },
    { id: 'arts', label: 'Arts / design / architecture', interests: ['arts', 'design', 'architecture', 'music'], priority: ['AP 2-D Art and Design', 'AP Art History', 'AP Drawing', 'AP Music Theory', 'AP English Literature and Composition'] }
];
const DEFAULT_PROFILE = { grade: 9, gpa: '3.5-3.8', goal: 'balanced', pathway: 'balanced', stress: 3, time: 6, math: 3, writing: 3, science: 3, reading: 3, interests: [], weaknesses: [], completed: [] };
function useRoute() {
    const [route, setRoute] = useState(parseRoute());
    useEffect(() => { const h = () => setRoute(parseRoute()); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
    return route;
}
function useLocalData() {
    const [books, setBooks] = useState(() => appData('books', SEED_BOOKS));
    const [papers, setPapers] = useState(() => appData('papers', SEED_PAPERS));
    const [parts, setParts] = useState(() => appData('parts', SEED_PARTS));
    const [chapters, setChapters] = useState(() => appData('chapters', SEED_CHAPTERS));
    const [clubs, setClubs] = useState(() => appData('clubs', SEED_CLUBS));
    const [years, setYears] = useState(() => appData('years', SEED_YEARS));
    const [backendStatus, setBackendStatus] = useState('Local data loaded');
    useEffect(() => {
        let active = true;
        async function loadBackend() {
            if (!window.SSHUB_BACKEND) {
                setBackendStatus('Backend bridge not found');
                return;
            }
            setBackendStatus('Connecting to Supabase…');
            const bookResult = window.SSHUB_BACKEND.loadBooks
                ? await window.SSHUB_BACKEND.loadBooks()
                : { ok: false, books: [], message: 'Book loader not found' };
            const paperResult = window.SSHUB_BACKEND.loadPapers
                ? await window.SSHUB_BACKEND.loadPapers()
                : { ok: false, papers: [], message: 'Paper loader not found' };
            if (!active)
                return;
            if (bookResult.ok && bookResult.books.length) {
                const backendBooks = bookResult.books;
                setBooks(current => {
                    const incoming = new Map(backendBooks.map(book => [book.id, book]));
                    const replaced = current.map(book => {
                        if (!incoming.has(book.id))
                            return book;
                        const backendBook = incoming.get(book.id);
                        return Object.assign(Object.assign(Object.assign({}, book), backendBook), { clubId: backendBook.clubId || book.clubId, academicYearId: backendBook.academicYearId || book.academicYearId });
                    });
                    const existing = new Set(replaced.map(book => book.id));
                    const backendOnly = backendBooks.filter(book => !existing.has(book.id));
                    return [...backendOnly, ...replaced];
                });
                setParts(current => {
                    const bookIdsWithParts = new Set(current.map(part => part.bookId));
                    const existing = new Set(current.map(part => part.id));
                    const newParts = backendBooks
                        .filter(book => !bookIdsWithParts.has(book.id))
                        .map(book => ({
                        id: 'part_' + book.id,
                        title: 'Full Book',
                        partNumber: 1,
                        bookId: book.id
                    }));
                    return [...newParts.filter(part => !existing.has(part.id)), ...current];
                });
                setChapters(current => current.filter(chapter => !String(chapter.id).startsWith('backend-chapter-') && !String(chapter.id).startsWith('ch_backend-book-')));
            }
            if (paperResult.ok && paperResult.papers.length) {
                setPapers(current => {
                    const existing = new Set(current.map(p => p.id));
                    const backendOnly = paperResult.papers.filter(p => !existing.has(p.id));
                    return [...backendOnly, ...current];
                });
                const grouped = new Map();
                paperResult.papers
                    .filter(p => p.bookId)
                    .forEach(p => {
                    const title = p.category || 'Uploaded Publication';
                    const key = `${p.bookId}::${title}`;
                    if (!grouped.has(key))
                        grouped.set(key, { bookId: p.bookId, title, firstNum: p.num || 9999 });
                    else
                        grouped.get(key).firstNum = Math.min(grouped.get(key).firstNum, p.num || 9999);
                });
                const byBook = {};
                Array.from(grouped.values()).forEach(group => {
                    if (!byBook[group.bookId])
                        byBook[group.bookId] = [];
                    byBook[group.bookId].push(group);
                });
                const backendChapters = Object.entries(byBook).flatMap(([bookId, groups]) => groups
                    .sort((a, b) => (a.firstNum || 0) - (b.firstNum || 0) || a.title.localeCompare(b.title))
                    .map((group, index) => ({
                    id: `backend-chapter-${bookId}-${String(group.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
                    title: group.title,
                    chapterNumber: index + 1,
                    bookId,
                    partId: 'part_' + bookId
                })));
                setChapters(current => {
                    const cleaned = current.filter(chapter => !String(chapter.id).startsWith('backend-chapter-') && !String(chapter.id).startsWith('ch_backend-book-'));
                    const existing = new Set(cleaned.map(chapter => chapter.id));
                    return [...backendChapters.filter(chapter => !existing.has(chapter.id)), ...cleaned];
                });
            }
            setBackendStatus(`${bookResult.message || ''} ${paperResult.message || ''}`.trim());
        }
        loadBackend();
        return () => { active = false; };
    }, []);
    const save = (key, setter) => value => { setter(value); setAppData(key, value); };
    return {
        books,
        papers,
        parts,
        chapters,
        clubs,
        years,
        backendStatus,
        setBooks: save('books', setBooks),
        setPapers: save('papers', setPapers),
        setParts: save('parts', setParts),
        setChapters: save('chapters', setChapters),
        setClubs: save('clubs', setClubs),
        setYears: save('years', setYears)
    };
}
function useReadingList() {
    const [list, setList] = useState(() => readJSON(STORAGE.readingList, []));
    const save = next => { setList(next); writeJSON(STORAGE.readingList, next); };
    const has = id => list.includes(id);
    const toggle = id => save(has(id) ? list.filter(x => x !== id) : [...list, id]);
    return { list, has, toggle, clear: () => save([]) };
}
function usePdfObject(path) {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('ready');
    useEffect(() => {
        let active = true;
        let obj = '';
        async function resolve() {
            if (!path) {
                setUrl('');
                setStatus('missing');
                return;
            }
            if (path.startsWith('idb:')) {
                try {
                    setStatus('loading');
                    const blob = await loadLocalPDF(path.replace('idb:', ''));
                    obj = URL.createObjectURL(blob);
                    if (active) {
                        setUrl(obj);
                        setStatus('ready');
                    }
                }
                catch (_a) {
                    if (active) {
                        setStatus('missing');
                        setUrl('');
                    }
                }
            }
            else {
                setStatus('ready');
                setUrl(pdfUrl(path));
            }
        }
        resolve();
        return () => { active = false; if (obj)
            URL.revokeObjectURL(obj); };
    }, [path]);
    return { url, status };
}
function TopBar({ route, auth, onLogin, onLogout }) {
    const nav = [
        ['home', 'Home'],
        ['research', 'Research Hub'],
        ['publications', 'Publications'],
        ['collaborations', 'Collaborations'],
        ['alumni', 'Alumni Map'],
        ['assistant', 'AI Assistant'],
        ['ap', 'AP Planning'],
        ['reading-list', 'Reading List']
        ['legacy','Legacy & Impact']

    ];
    const active = route.page;
    return React.createElement("header", { className: "topbar" },
        React.createElement("button", { className: "brand", onClick: () => go('home'), "aria-label": "Go home" },
            React.createElement("span", { className: "brand-mark" }, "A"),
            React.createElement("span", null,
                React.createElement("b", null, "Student Support Hub"),
                React.createElement("small", null, "AMRC Academic Library"))),
        React.createElement("nav", { className: "nav" }, nav.map(([id, label]) => React.createElement("button", { key: id, className: (active === id || (id === 'ap' && ['ap', 'ap-resources', 'ap-decider'].includes(active)) || (id === 'research' && ['paper', 'subjects'].includes(active)) || (id === 'publications' && active === 'book')) ? 'active' : '', onClick: () => go(id) }, label))));
}
function Badge({ children, tone = '' }) { return React.createElement("span", { className: `badge ${tone}` }, children); }
function PageHeader({ eyebrow, title, subtitle, children }) { return React.createElement("section", { className: "page-hero" },
    React.createElement("div", { className: "container page-hero-inner" },
        React.createElement("div", null,
            React.createElement("p", { className: "eyebrow" }, eyebrow),
            React.createElement("h1", null, title),
            subtitle && React.createElement("p", { className: "lead" }, subtitle)),
        children)); }
function Stat({ num, label }) { return React.createElement("div", { className: "stat" },
    React.createElement("b", null, num),
    React.createElement("span", null, label)); }
function SectionHead({ kicker, title, subtitle, actions }) { return React.createElement("div", { className: "section-head" },
    React.createElement("div", null,
        React.createElement("p", { className: "kicker" }, kicker),
        React.createElement("h2", null, title),
        subtitle && React.createElement("p", null, subtitle)),
    actions); }
function MetaLine({ items }) { return React.createElement("div", { className: "meta-line" }, items.filter(Boolean).map((x, i) => React.createElement("span", { key: i }, x))); }
function Empty({ title = 'Nothing here yet.', text = 'Try changing the filters or search terms.' }) { return React.createElement("div", { className: "empty" },
    React.createElement("h3", null, title),
    React.createElement("p", null, text)); }
function Home({ data }) {
    const { books, papers, chapters } = data;
    const featured = books.slice().sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)).slice(0, 3);
    const recent = papers.slice().sort((a, b) => (b.year || 0) - (a.year || 0) || (b.num || 0) - (a.num || 0)).slice(0, 5);
    const categories = uniq(papers.map(p => p.category)).length;
    return React.createElement("main", null,
        React.createElement("section", { className: "home-hero" },
            React.createElement("div", { className: "container hero-grid" },
                React.createElement("div", { className: "hero-copy" },
                    React.createElement(Badge, { tone: "gold" }, "Student academic platform"),
                    React.createElement("h1", null, "One polished hub for research, AP planning, and student academic growth."),
                    React.createElement("p", null, "Browse AMRC publications, open individual research papers, build a reading list, generate citations, compare AP courses, and create a smarter four-year AP plan."),
                    React.createElement("div", { className: "hero-actions" },
                        React.createElement("button", { className: "btn primary", onClick: () => go('research') }, "Explore Research"),
                        React.createElement("button", { className: "btn dark", onClick: () => go('ap') }, "Plan APs"))),
                React.createElement("aside", { className: "command-card" },
                    React.createElement("div", { className: "command-top" },
                        React.createElement("span", null),
                        React.createElement("span", null),
                        React.createElement("span", null)),
                    React.createElement("h3", null, "Academic Command Center"),
                    React.createElement("div", { className: "quick-search", onClick: () => go('research') }, "Search 200 papers, 4 publications, subjects, authors\u2026"),
                    React.createElement("div", { className: "stat-grid" },
                        React.createElement(Stat, { num: books.length, label: "Publications" }),
                        React.createElement(Stat, { num: papers.length, label: "Research papers" }),
                        React.createElement(Stat, { num: chapters.length, label: "Sections" }),
                        React.createElement(Stat, { num: categories, label: "Subjects" }))))),
        React.createElement("section", { className: "container section" },
            React.createElement(SectionHead, { kicker: "Platform modules", title: "A cleaner structure, not a crowded PDF dump", subtitle: "Each feature now has a proper place in the site architecture." }),
            React.createElement("div", { className: "module-grid" },
                React.createElement(FeatureCard, { title: "AMRC Research Hub", desc: "Unified search, filters, subject collections, books, standalone papers, PDF tools, and academic layouts.", action: "Open library", page: "research" }),
                React.createElement(FeatureCard, { title: "AP Planning", desc: "A combined AP hub with the course library, comparison workspace, and AP Decider roadmap in one place.", action: "Open AP hub", page: "ap" }),
                React.createElement(FeatureCard, { title: "Reading List", desc: "Students can save research papers locally, continue later, and export their list.", action: "View saved papers", page: "reading-list" }),
                React.createElement(FeatureCard, { title: "Alumni Destinations", desc: "A map-style view showing where AMSI students continued their studies by region and university destination.", action: "Open map", page: "alumni" }),
                React.createElement(FeatureCard, { title: "Knowledge Assistant", desc: "A controlled helper for research discovery, AP planning, partner resources, and opportunities using only site data.", action: "Ask assistant", page: "assistant" }))),
        React.createElement("section", { className: "container section two-col" },
            React.createElement("div", null,
                React.createElement(SectionHead, { kicker: "Featured publications", title: "Books now feel like publications", subtitle: "Research is grouped by books, sections, and paper relationships so it feels intentional." }),
                React.createElement("div", { className: "book-strip" }, featured.map(b => React.createElement(BookCard, { key: b.id, book: b, data: data })))),
            React.createElement("aside", { className: "panel pad" },
                React.createElement(SectionHead, { kicker: "Recently indexed", title: "Latest papers" }),
                React.createElement("div", { className: "compact-list" }, recent.map(p => React.createElement("button", { key: p.id, onClick: () => go('paper', p.id) },
                    React.createElement("b", null, p.title),
                    React.createElement("span", null, p.authors)))))));
}
function FeatureCard({ title, desc, action, page }) { return React.createElement("article", { className: "feature-card" },
    React.createElement("div", { className: "feature-icon" }, initials(title)),
    React.createElement("h3", null, title),
    React.createElement("p", null, desc),
    React.createElement("button", { className: "link-btn", onClick: () => go(page) },
        action,
        " \u2192")); }
function SearchControls({ query, setQuery, filters, setFilters, options, sort, setSort, view, setView }) {
    return React.createElement("div", { className: "search-shell" },
        React.createElement("div", { className: "search-main" },
            React.createElement("span", null, "\u2315"),
            React.createElement("input", { value: query, onChange: e => setQuery(e.target.value), placeholder: "Search title, author, keyword, abstract, subject\u2026" })),
        React.createElement("div", { className: "filter-row" },
            React.createElement("select", { value: filters.type, onChange: e => setFilters(Object.assign(Object.assign({}, filters), { type: e.target.value })) },
                React.createElement("option", { value: "all" }, "All types"),
                React.createElement("option", { value: "book" }, "Books"),
                React.createElement("option", { value: "paper" }, "Papers"),
                React.createElement("option", { value: "partner" }, "Partner resources")),
            React.createElement("select", { value: filters.source, onChange: e => setFilters(Object.assign(Object.assign({}, filters), { source: e.target.value })) },
                React.createElement("option", { value: "all" }, "All sources"),
                options.sources.map(x => React.createElement("option", { key: x }, x))),
            React.createElement("select", { value: filters.subject, onChange: e => setFilters(Object.assign(Object.assign({}, filters), { subject: e.target.value })) },
                React.createElement("option", { value: "all" }, "All subjects"),
                options.subjects.map(x => React.createElement("option", { key: x }, x))),
            React.createElement("select", { value: filters.author, onChange: e => setFilters(Object.assign(Object.assign({}, filters), { author: e.target.value })) },
                React.createElement("option", { value: "all" }, "All authors"),
                options.authors.map(x => React.createElement("option", { key: x }, x))),
            React.createElement("select", { value: filters.year, onChange: e => setFilters(Object.assign(Object.assign({}, filters), { year: e.target.value })) },
                React.createElement("option", { value: "all" }, "All years"),
                options.years.map(x => React.createElement("option", { key: x }, x))),
            React.createElement("select", { value: sort, onChange: e => setSort(e.target.value) },
                React.createElement("option", { value: "relevance" }, "Most relevant"),
                React.createElement("option", { value: "newest" }, "Newest"),
                React.createElement("option", { value: "oldest" }, "Oldest"),
                React.createElement("option", { value: "az" }, "A\u2013Z"),
                React.createElement("option", { value: "paperNo" }, "Paper number")),
            React.createElement("div", { className: "segmented" },
                React.createElement("button", { className: view === 'grid' ? 'active' : '', onClick: () => setView('grid') }, "Grid"),
                React.createElement("button", { className: view === 'list' ? 'active' : '', onClick: () => setView('list') }, "List"))));
}
function useLibraryResults(data) {
    const { books, papers } = data;
    const partnerResources = partnerData('resources', []);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [view, setView] = useState('grid');
    const [filters, setFilters] = useState({ type: 'all', source: 'all', subject: 'all', author: 'all', year: 'all' });
    const options = useMemo(() => ({
        subjects: uniq([...papers.map(p => p.category), ...partnerResources.map(r => r.subject)]).sort(),
        sources: uniq(['AMRC Research Hub', ...partnerResources.map(r => r.partnerName)]).sort(),
        authors: uniq(papers.flatMap(p => String(p.authors || '').split(',').map(a => a.trim()))).sort().slice(0, 250),
        years: uniq([...papers.map(p => String(p.year || '')), ...books.map(b => String(b.publicationYear || '')), ...partnerResources.map(r => String(r.year || ''))]).sort((a, b) => b - a)
    }), [papers, books, partnerResources]);
    const results = useMemo(() => {
        const q = normalize(query);
        const bookItems = books.map(b => ({ kind: 'book', source: 'AMRC Research Hub', id: b.id, title: b.title, authors: b.editors || 'AMRC Editorial Team', year: b.publicationYear, subject: 'Publication', description: b.description, search: `${b.title} ${b.editors} ${b.description} ${b.publicationYear}` }));
        const paperItems = papers.map(p => ({ kind: 'paper', source: 'AMRC Research Hub', id: p.id, title: p.title, authors: p.authors, year: p.year, subject: p.category, description: p.abstract, keywords: p.keywords || [], num: p.num, search: `${p.title} ${p.authors} ${p.abstract} ${p.category} ${toText(p.keywords)} ${p.year}` }));
        const partnerItems = partnerResources.map(r => ({ kind: 'partner', source: r.partnerName, id: r.id, title: r.title, authors: r.partnerName, year: r.year, subject: r.subject, description: r.description, keywords: r.tags || [], url: r.url, search: `${r.title} ${r.partnerName} ${r.description} ${r.subject} ${toText(r.tags)} ${r.year}` }));
        let arr = [...bookItems, ...paperItems, ...partnerItems].filter(item => {
            if (filters.type !== 'all' && item.kind !== filters.type)
                return false;
            if (filters.source !== 'all' && item.source !== filters.source)
                return false;
            if (filters.subject !== 'all' && item.subject !== filters.subject)
                return false;
            if (filters.year !== 'all' && String(item.year) !== filters.year)
                return false;
            if (filters.author !== 'all' && !normalize(item.authors).includes(normalize(filters.author)))
                return false;
            if (q && !normalize(item.search).includes(q))
                return false;
            return true;
        });
        arr = arr.map(item => (Object.assign(Object.assign({}, item), { score: q ? scoreItem(item, q) : 1 })));
        if (sort === 'relevance')
            arr.sort((a, b) => b.score - a.score || (b.year || 0) - (a.year || 0));
        if (sort === 'newest')
            arr.sort((a, b) => (b.year || 0) - (a.year || 0));
        if (sort === 'oldest')
            arr.sort((a, b) => (a.year || 0) - (b.year || 0));
        if (sort === 'az')
            arr.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === 'paperNo')
            arr.sort((a, b) => (a.kind === 'book' ? 9999 : a.num || 0) - (b.kind === 'book' ? 9999 : b.num || 0));
        return arr;
    }, [books, papers, partnerResources, query, filters, sort]);
    return { query, setQuery, filters, setFilters, options, sort, setSort, view, setView, results };
}
function scoreItem(item, q) {
    let score = 0;
    const s = normalize(item.search);
    if (normalize(item.title).includes(q))
        score += 10;
    if (normalize(item.authors).includes(q))
        score += 6;
    if (normalize(item.subject).includes(q))
        score += 5;
    if (s.includes(q))
        score += 2;
    return score;
}
function ResearchHub({ data }) {
    const lib = useLibraryResults(data);
    const subjectCount = uniq(data.papers.map(p => p.category)).length;
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "AMRC Research Hub", title: "Search the full academic library", subtitle: "A unified research interface for books, chapters, individual papers, authors, categories, and PDF access." },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: data.papers.length, label: "Papers" }),
                React.createElement(Stat, { num: data.books.length, label: "Books" }),
                React.createElement(Stat, { num: subjectCount, label: "Subjects" }))),
        React.createElement("section", { className: "container section" },
            React.createElement(SearchControls, Object.assign({}, lib)),
            React.createElement("div", { className: "result-summary" },
                React.createElement("b", null, lib.results.length),
                " results \u00B7 organized as books and papers"),
            lib.results.length ? React.createElement("div", { className: lib.view === 'grid' ? 'library-grid' : 'library-list' }, lib.results.map(item => React.createElement(LibraryItem, { key: item.kind + item.id, item: item, data: data }))) : React.createElement(Empty, { title: "No research matched." })));
}
function LibraryItem({ item, data }) {
    if (item.kind === 'book') {
        const book = data.books.find(b => b.id === item.id);
        return React.createElement(BookCard, { book: book, data: data });
    }
    if (item.kind === 'partner')
        return React.createElement(PartnerResourceCard, { resource: item });
    const paper = data.papers.find(p => p.id === item.id);
    return React.createElement(PaperCard, { paper: paper, data: data });
}
function BookCard({ book, data }) {
    var _a;
    const papers = data.papers.filter(p => p.bookId === book.id);
    const club = data.clubs.find(c => c.id === book.clubId);
    const pdf = getBookPdf(book);
    return React.createElement("article", { className: "book-card", onClick: () => go('book', book.id) },
        React.createElement("div", { className: "book-cover" },
            React.createElement("span", null, book.publicationYear),
            React.createElement("h3", null, book.title),
            React.createElement("small", null,
                ((_a = club === null || club === void 0 ? void 0 : club.slug) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'AMRC',
                " Publication")),
        React.createElement("div", { className: "card-body" },
            React.createElement(MetaLine, { items: [`${papers.length} papers`, `${data.chapters.filter(c => c.bookId === book.id).length} sections`, (pdf === null || pdf === void 0 ? void 0 : pdf.pages) ? `${pdf.pages} pages` : null] }),
            React.createElement("p", null, short(book.description, 170))));
}
function PaperCard({ paper, data }) {
    const book = data.books.find(b => b.id === paper.bookId);
    return React.createElement("article", { className: "paper-card", onClick: () => go('paper', paper.id) },
        React.createElement("div", { className: "paper-kicker" },
            paper.num ? `Paper ${paper.num}` : 'Standalone',
            " \u00B7 ",
            paper.year),
        React.createElement("h3", null, paper.title),
        React.createElement("p", { className: "authors" }, paper.authors),
        React.createElement("p", null, short(paper.abstract, 150)),
        React.createElement(MetaLine, { items: [paper.category, (book === null || book === void 0 ? void 0 : book.title) ? `In ${short(book.title, 42)}` : 'Individual paper'] }));
}
function PartnerResourceCard({ resource }) {
    return React.createElement("article", { className: "partner-resource-card" },
        React.createElement("div", { className: "paper-kicker" },
            "Partner resource \u00B7 ",
            resource.source || resource.partnerName || 'AMTech'),
        React.createElement("h3", null, resource.title),
        React.createElement("p", null, short(resource.description, 170)),
        React.createElement(MetaLine, { items: [resource.subject, resource.year, resource.url ? 'External website' : null] }),
        React.createElement("div", { className: "tag-row" }, (resource.keywords || resource.tags || []).slice(0, 4).map(t => React.createElement("span", { key: t }, t))),
        resource.url && React.createElement("a", { className: "btn ghost small", href: resource.url, target: "_blank", rel: "noopener noreferrer" }, "Open partner resource"));
}
function Publications({ data }) {
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Publications", title: "Books, anthologies, and complete AMRC releases", subtitle: "Each publication now has a dedicated book page with full-book PDF support and paper-level navigation." }),
        React.createElement("section", { className: "container section" },
            React.createElement("div", { className: "book-grid" }, data.books.map(b => React.createElement(BookCard, { key: b.id, book: b, data: data })))));
}
function Subjects({ data }) {
    const groups = useMemo(() => uniq(data.papers.map(p => p.category)).sort().map(subject => ({ subject, papers: data.papers.filter(p => p.category === subject) })), [data.papers]);
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Subject collections", title: "Browse by academic area", subtitle: "A clean way to explore related student research without losing the publication structure." }),
        React.createElement("section", { className: "container section subject-grid" }, groups.map(g => React.createElement("article", { key: g.subject, className: "subject-card" },
            React.createElement("h3", null, g.subject),
            React.createElement("p", null,
                g.papers.length,
                " papers"),
            React.createElement("div", { className: "compact-list" }, g.papers.slice(0, 4).map(p => React.createElement("button", { key: p.id, onClick: () => go('paper', p.id) },
                React.createElement("b", null, p.title),
                React.createElement("span", null, p.authors)))),
            React.createElement("button", { className: "btn ghost", onClick: () => { go('research'); setTimeout(() => { }, 0); } }, "Explore subject")))));
}
function BookView({ id, data }) {
    const book = data.books.find(b => b.id === id);
    if (!book)
        return React.createElement(NotFound, null);
    const papers = data.papers.filter(p => p.bookId === book.id).sort((a, b) => (a.num || 0) - (b.num || 0));
    const chapters = data.chapters.filter(c => c.bookId === book.id).sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    const full = getBookPdf(book);
    const { url } = usePdfObject(full === null || full === void 0 ? void 0 : full.pdf);
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Book view", title: book.title, subtitle: book.description },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: papers.length, label: "Papers" }),
                React.createElement(Stat, { num: chapters.length, label: "Sections" }),
                React.createElement(Stat, { num: (full === null || full === void 0 ? void 0 : full.pages) || '—', label: "Pages" }))),
        React.createElement("section", { className: "container detail-layout" },
            React.createElement("article", { className: "main-col" },
                url && React.createElement("div", { className: "reader" },
                    React.createElement("div", { className: "reader-head" },
                        React.createElement("h3", null, "Full publication PDF"),
                        React.createElement("div", { className: "tools" },
                            React.createElement("a", { className: "btn ghost small", href: url, target: "_blank" }, "Open"),
                            React.createElement("a", { className: "btn ghost small", href: url, download: true }, "Download"),
                            React.createElement("button", { className: "btn ghost small", onClick: () => copyText(url) }, "Copy link"))),
                    React.createElement("div", { className: "pdf-frame" },
                        React.createElement("object", { data: url, type: "application/pdf" },
                            React.createElement("iframe", { src: url })))),
                React.createElement(SectionHead, { kicker: "Table of contents", title: "Papers inside this publication", subtitle: "Use sections to keep the book organized instead of scattering research across unrelated pages." }),
                book.backend ? (React.createElement("section", { className: "chapter-block" },
                    React.createElement("h3", null, "01 \u00B7 Uploaded papers"),
                    React.createElement("div", { className: "paper-rows" }, papers.length
                        ? papers.map(p => React.createElement(PaperRow, { key: p.id, paper: p }))
                        : React.createElement("p", { className: "muted" }, "No papers have been linked to this backend book yet.")))) : (chapters.map(ch => {
                    const cps = papers.filter(p => (p.partId === ch.partId && p.category === ch.title) || p.chapterId === ch.id);
                    const fallback = papers.filter(p => p.category === ch.title);
                    const rows = cps.length ? cps : fallback;
                    return (React.createElement("section", { key: ch.id, className: "chapter-block" },
                        React.createElement("h3", null,
                            String(ch.chapterNumber).padStart(2, '0'),
                            " \u00B7 ",
                            ch.title),
                        React.createElement("div", { className: "paper-rows" }, rows.length
                            ? rows.map(p => React.createElement(PaperRow, { key: p.id, paper: p }))
                            : React.createElement("p", { className: "muted" }, "No papers mapped to this section yet."))));
                }))),
            React.createElement("aside", { className: "side-col" },
                React.createElement("div", { className: "panel pad sticky" },
                    React.createElement("h3", null, "Publication details"),
                    React.createElement(MetaLine, { items: [book.publicationYear, book.editors, (full === null || full === void 0 ? void 0 : full.size) ? formatBytes(full.size) : null] }),
                    React.createElement("p", null, book.description),
                    React.createElement("button", { className: "btn primary full", onClick: () => go('research') }, "Search all research")))));
}
function PaperRow({ paper }) { return React.createElement("button", { className: "paper-row", onClick: () => go('paper', paper.id) },
    React.createElement("span", null, paper.num || '—'),
    React.createElement("div", null,
        React.createElement("b", null, paper.title),
        React.createElement("small", null, paper.authors)),
    React.createElement("em", null, "Open")); }
function CitationTools({ paper, book }) {
    const year = paper.year || new Date().getFullYear();
    const authors = paper.authors || 'Unknown Author';
    const apa = `${authors}. (${year}). ${paper.title}. ${book ? book.title + '. ' : ''}AMRC Research Hub.`;
    const mla = `${authors}. "${paper.title}." ${book ? book.title + ', ' : ''}AMRC Research Hub, ${year}.`;
    const chicago = `${authors}. "${paper.title}." In ${book ? book.title : 'AMRC Research Hub'}, ${year}.`;
    const [style, setStyle] = useState('APA');
    const val = style === 'APA' ? apa : style === 'MLA' ? mla : chicago;
    return React.createElement("div", { className: "citation-box" },
        React.createElement("div", { className: "citation-top" },
            React.createElement("h3", null, "Citation generator"),
            React.createElement("div", { className: "segmented" }, ['APA', 'MLA', 'Chicago'].map(s => React.createElement("button", { key: s, className: style === s ? 'active' : '', onClick: () => setStyle(s) }, s)))),
        React.createElement("p", null, val),
        React.createElement("button", { className: "btn ghost small", onClick: () => copyText(val) }, "Copy citation"));
}
function PaperView({ id, data, reading }) {
    const paper = data.papers.find(p => p.id === id);
    if (!paper)
        return React.createElement(NotFound, null);
    const book = data.books.find(b => b.id === paper.bookId);
    const related = data.papers.filter(p => p.id !== paper.id && (p.category === paper.category || p.bookId === paper.bookId)).slice(0, 5);
    const inBook = data.papers.filter(p => p.bookId === paper.bookId).sort((a, b) => (a.num || 0) - (b.num || 0));
    const idx = inBook.findIndex(p => p.id === paper.id);
    const prev = idx > 0 ? inBook[idx - 1] : null;
    const next = idx >= 0 && idx < inBook.length - 1 ? inBook[idx + 1] : null;
    const { url, status } = usePdfObject(paper.pdf);
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: book ? 'Research paper inside publication' : 'Individual research paper', title: paper.title, subtitle: paper.abstract },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: paper.year || '—', label: "Year" }),
                React.createElement(Stat, { num: paper.num || '—', label: "Paper #" }),
                React.createElement(Stat, { num: related.length, label: "Related" }))),
        React.createElement("section", { className: "container detail-layout" },
            React.createElement("article", { className: "main-col" },
                React.createElement("div", { className: "paper-meta-card" },
                    React.createElement("h3", null, paper.title),
                    React.createElement(MetaLine, { items: [paper.authors, paper.category, book === null || book === void 0 ? void 0 : book.title] }),
                    React.createElement("div", { className: "keyword-cloud" }, (paper.keywords || []).slice(0, 12).map(k => React.createElement("span", { key: k }, k)))),
                React.createElement("div", { className: "reader" },
                    React.createElement("div", { className: "reader-head" },
                        React.createElement("h3", null, "PDF viewer"),
                        React.createElement("div", { className: "tools" },
                            url && React.createElement(React.Fragment, null,
                                React.createElement("a", { className: "btn ghost small", href: url, target: "_blank" }, "Open PDF"),
                                React.createElement("a", { className: "btn ghost small", href: url, download: true }, "Download"),
                                React.createElement("button", { className: "btn ghost small", onClick: () => copyText(url) }, "Copy link")),
                            React.createElement("button", { className: "btn primary small", onClick: () => reading.toggle(paper.id) }, reading.has(paper.id) ? 'Saved' : 'Save'))),
                    url ? React.createElement("div", { className: "pdf-frame" },
                        React.createElement("object", { data: url, type: "application/pdf" },
                            React.createElement("iframe", { src: url }))) : React.createElement("div", { className: "pdf-missing" },
                        "PDF unavailable in this browser. Status: ",
                        status)),
                React.createElement("div", { className: "prev-next" },
                    prev ? React.createElement("button", { onClick: () => go('paper', prev.id) },
                        "\u2190 Previous",
                        React.createElement("br", null),
                        React.createElement("b", null, short(prev.title, 48))) : React.createElement("span", null),
                    next ? React.createElement("button", { onClick: () => go('paper', next.id) },
                        "Next \u2192",
                        React.createElement("br", null),
                        React.createElement("b", null, short(next.title, 48))) : React.createElement("span", null))),
            React.createElement("aside", { className: "side-col" },
                React.createElement("div", { className: "panel pad sticky" },
                    React.createElement("h3", null, "Academic tools"),
                    React.createElement(CitationTools, { paper: paper, book: book }),
                    React.createElement("h3", null, "Related papers"),
                    React.createElement("div", { className: "compact-list" }, related.map(p => React.createElement("button", { key: p.id, onClick: () => go('paper', p.id) },
                        React.createElement("b", null, p.title),
                        React.createElement("span", null, p.authors))))))));
}
function ReadingList({ data, reading }) {
    const saved = reading.list.map(id => data.papers.find(p => p.id === id)).filter(Boolean);
    const exportList = () => {
        const lines = saved.map(p => `${p.title} — ${p.authors} (${p.year})`).join('\n');
        const blob = new Blob([lines], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'amrc-reading-list.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    };
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Reading list", title: "Saved papers", subtitle: "A local browser reading list for students who want to continue research later." }),
        React.createElement("section", { className: "container section" }, saved.length ? React.createElement(React.Fragment, null,
            React.createElement("div", { className: "toolbar" },
                React.createElement("button", { className: "btn ghost", onClick: exportList }, "Export list"),
                React.createElement("button", { className: "btn ghost", onClick: reading.clear }, "Clear list")),
            React.createElement("div", { className: "library-grid" }, saved.map(p => React.createElement(PaperCard, { key: p.id, paper: p, data: data })))) : React.createElement(Empty, { title: "No saved papers yet.", text: "Open any paper and press Save to add it here." })));
}
const ASSISTANT_STARTER = [];
const STOPWORDS = new Set('the a an and or but if then with without for from into onto about above below between under over to of in on at by as is are was were be been being it this that these those i me my we our you your he she they them what which who where when why how can could should would do does did give show find tell explain compare recommend plan take throughout high school throughout'.split(' '));
const SYNONYMS = {
    medicine: ['medicine', 'medical', 'health', 'biology', 'psychology', 'chemistry', 'doctor', 'pre-med', 'health science'],
    stem: ['stem', 'engineering', 'computer science', 'technology', 'physics', 'calculus', 'math', 'data'],
    law: ['law', 'politics', 'policy', 'government', 'debate', 'international relations', 'global'],
    business: ['business', 'economics', 'finance', 'entrepreneurship', 'statistics', 'data'],
    humanities: ['history', 'writing', 'culture', 'literature', 'research', 'social science'],
    arts: ['art', 'design', 'music', 'drawing', 'architecture', 'portfolio']
};
function tokenizeQuestion(text) {
    return normalize(text).replace(/[^a-z0-9\s:-]/g, ' ').split(/\s+/).map(t => t.trim()).filter(t => t && !STOPWORDS.has(t) && t.length > 1);
}
function expandedTokens(text) {
    const base = new Set(tokenizeQuestion(text));
    const lower = normalize(text);
    Object.entries(SYNONYMS).forEach(([key, vals]) => { if (vals.some(v => lower.includes(v)))
        vals.forEach(v => tokenizeQuestion(v).forEach(t => base.add(t))); if (lower.includes(key))
        vals.forEach(v => tokenizeQuestion(v).forEach(t => base.add(t))); });
    return [...base];
}
function buildKnowledgeBase(data) {
    const partnerResources = partnerData('resources', []);
    const opportunities = partnerData('opportunities', []);
    const partners = partnerData('partners', []);
    const bookDocs = data.books.map(book => ({
        id: `book:${book.id}`, type: 'Book', title: book.title, year: book.publicationYear, source: 'AMRC Research Hub', url: `#/book/${book.id}`,
        text: `${book.title} ${book.description} ${book.editors} ${book.publicationYear} AMRC publication book anthology`,
        summary: `${book.title} is an AMRC publication from ${book.publicationYear || 'an unknown year'} edited by ${book.editors || 'the AMRC team'}. ${book.description || ''}`,
        action: () => go('book', book.id)
    }));
    const paperDocs = data.papers.map(paper => {
        const book = data.books.find(b => b.id === paper.bookId);
        return { id: `paper:${paper.id}`, type: 'Research paper', title: paper.title, year: paper.year, source: 'AMRC Research Hub', url: `#/paper/${paper.id}`,
            text: `${paper.title} ${paper.authors} ${paper.abstract} ${paper.category} ${toText(paper.keywords)} ${(book === null || book === void 0 ? void 0 : book.title) || ''} paper research article`,
            summary: `${paper.title} by ${paper.authors || 'unknown author(s)'}${paper.year ? ` (${paper.year})` : ''}. Subject: ${paper.category || 'Uncategorized'}. ${short(paper.abstract, 260)}`,
            action: () => go('paper', paper.id) };
    });
    const apDocs = AP_COURSES.map(course => ({
        id: `ap:${course.name}`, type: 'AP course', title: course.name, year: '', source: 'Advanced Placement Resources', url: '#/ap',
        text: `${course.name} ${course.area} ${course.summary} ${toText(course.interests)} ${toText(course.pathways)} difficulty ${course.difficulty} workload ${course.workload}`,
        summary: `${course.name}: ${course.summary} Difficulty ${course.difficulty}/5, workload ${course.workload}/5, usually suited for grades ${course.grades.join(', ')}.`,
        action: () => go('ap')
    }));
    const partnerDocs = partnerResources.map(resource => ({
        id: `partner:${resource.id}`, type: 'Partner resource', title: resource.title, year: resource.year, source: resource.partnerName || 'Partner', url: resource.url,
        text: `${resource.title} ${resource.description} ${resource.subject} ${resource.type} ${toText(resource.tags)} ${resource.partnerName}`,
        summary: `${resource.title} from ${resource.partnerName || 'a partner'}: ${resource.description}`,
        external: true
    }));
    const opportunityDocs = opportunities.map(opp => ({
        id: `opportunity:${opp.id}`, type: 'Opportunity', title: opp.title, year: '', source: opp.partnerName || 'Partner', url: opp.url,
        text: `${opp.title} ${opp.description} ${opp.type} ${opp.audience} ${opp.timeline} ${opp.partnerName} opportunity competition project`,
        summary: `${opp.title}: ${opp.description} Audience: ${opp.audience || 'students'}. Timeline: ${opp.timeline || 'not specified'}.`,
        external: true
    }));
    const partnerDocs2 = partners.map(partner => ({
        id: `partner-profile:${partner.id}`, type: 'Partner profile', title: partner.name, year: '', source: 'Collaborations', url: partner.website || '#/collaborations',
        text: `${partner.name} ${partner.description} ${toText(partner.focusAreas)} partner collaboration website`,
        summary: `${partner.name} is listed as ${partner.status || 'a partner'}. ${partner.description}`,
        external: !!partner.website
    }));
    const subjects = uniq(data.papers.map(p => p.category)).map(subject => {
        const count = data.papers.filter(p => p.category === subject).length;
        return { id: `subject:${subject}`, type: 'Subject', title: subject, source: 'AMRC Research Hub', url: '#/subjects',
            text: `${subject} subject category research papers ${data.papers.filter(p => p.category === subject).slice(0, 12).map(p => p.title).join(' ')}`,
            summary: `${subject} has ${count} research paper${count === 1 ? '' : 's'} in the AMRC library.`, action: () => go('subjects') };
    });
    return [...paperDocs, ...bookDocs, ...apDocs, ...partnerDocs, ...opportunityDocs, ...partnerDocs2, ...subjects];
}
function scoreKnowledgeDoc(doc, question) {
    const tokens = expandedTokens(question);
    const text = normalize(`${doc.title} ${doc.type} ${doc.source} ${doc.text}`);
    const title = normalize(doc.title);
    let score = 0;
    const q = normalize(question);
    if (title.includes(q) && q.length > 3)
        score += 20;
    tokens.forEach(t => { if (title.includes(t))
        score += 7; if (text.includes(t))
        score += 3; });
    if (/paper|research|article|pdf|citation|author/i.test(question) && doc.type === 'Research paper')
        score += 5;
    if (/book|publication|anthology|chapter/i.test(question) && doc.type === 'Book')
        score += 6;
    if (/ap|advanced placement|course|class|schedule|roadmap|plan/i.test(question) && doc.type === 'AP course')
        score += 8;
    if (/partner|amtech|collaboration|stem|technology/i.test(question) && /Partner/.test(doc.type))
        score += 6;
    if (/opportunit|competition|program|project|internship/i.test(question) && doc.type === 'Opportunity')
        score += 8;
    return score;
}
function findKnowledge(question, data, limit = 6) {
    return buildKnowledgeBase(data).map(doc => (Object.assign(Object.assign({}, doc), { score: scoreKnowledgeDoc(doc, question) }))).filter(doc => doc.score > 0).sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title))).slice(0, limit);
}
function guessAssistantProfile(question) {
    const q = normalize(question);
    const profile = Object.assign(Object.assign({}, DEFAULT_PROFILE), { grade: q.match(/grade\s*(9|10|11|12)|\b(9th|10th|11th|12th)\b/) ? Number((q.match(/grade\s*(9|10|11|12)/) || [])[1] || (q.includes('12th') ? 12 : q.includes('11th') ? 11 : q.includes('10th') ? 10 : 9)) : 9, interests: [], weaknesses: [], completed: [] });
    const pathway = Object.entries(SYNONYMS).find(([key, vals]) => vals.some(v => q.includes(v)) || q.includes(key));
    if (pathway)
        profile.pathway = pathway[0] === 'stem' ? 'stem' : pathway[0];
    if (q.includes('computer') || q.includes('coding') || q.includes('engineering'))
        profile.pathway = 'stem';
    if (q.includes('doctor') || q.includes('medical') || q.includes('health'))
        profile.pathway = 'medicine';
    if (q.includes('business') || q.includes('finance') || q.includes('economics'))
        profile.pathway = 'business';
    if (q.includes('law') || q.includes('politic') || q.includes('international'))
        profile.pathway = 'law';
    Object.values(SYNONYMS).flat().forEach(v => { if (q.includes(v))
        profile.interests.push(v); });
    if (q.includes('stress'))
        profile.stress = q.includes('low') ? 2 : q.includes('high') ? 5 : 3;
    if (q.includes('weak math') || q.includes('bad at math'))
        profile.weaknesses.push('math');
    if (q.includes('weak writing') || q.includes('bad at writing'))
        profile.weaknesses.push('writing');
    return profile;
}
function summarizeAPAnswer(question) {
    if (!/\bap\b|advanced placement|course|classes|roadmap|four-year|4-year|schedule/i.test(question))
        return null;
    const profile = guessAssistantProfile(question);
    const plan = generateAPPlan(profile);
    const courses = plan.plan.flatMap(y => y.courses).slice(0, 8);
    if (!courses.length)
        return null;
    const lines = plan.plan.map(y => `Grade ${y.grade}: ${y.courses.length ? y.courses.map(c => c.name).join(', ') : 'No APs recommended from these settings.'}`).join('\n');
    return {
        text: `Based only on the AP course data inside Student Support Hub, here is a suggested ${profile.pathway} AP direction. Workload risk: ${plan.risk}.\n\n${lines}\n\nBest first moves: ${courses.slice(0, 3).map(c => c.name).join(', ')}. Use the full AP Decider for a more precise plan with grade, GPA, stress tolerance, and completed APs.`,
        sources: courses.slice(0, 5).map(c => ({ id: `ap:${c.name}`, title: c.name, type: 'AP course', source: 'Advanced Placement Resources', url: '#/ap' }))
    };
}
function generateAssistantAnswer(question, data) {
    const trimmed = question.trim();
    if (!trimmed)
        return { text: 'Ask me about AMRC research, books, AP courses, AP planning, AMTech partner resources, opportunities, or how to use the site.', sources: [] };
    const lower = normalize(trimmed);
    if (/what can you do|help|how does this work|who are you/i.test(trimmed)) {
        return { text: 'I am a grounded site assistant. I can search the AMRC paper/book metadata, explain AP course fit, suggest an AP roadmap using the built-in AP Decider logic, surface AMTech partner resources, and point to opportunities. I do not browse the web or invent answers outside the site knowledge base.', sources: [{ id: 'site', title: 'Student Support Hub local knowledge base', type: 'Site data', source: 'Student Support Hub' }] };
    }
    const apAnswer = summarizeAPAnswer(trimmed);
    const matches = findKnowledge(trimmed, data, 7);
    if (apAnswer && matches.length < 3)
        return apAnswer;
    if (!matches.length) {
        return { text: 'I could not find that in the Student Support Hub knowledge base. Try asking about a paper title, subject, author, AP course, AMTech, partner resources, or opportunities already stored in the site.', sources: [] };
    }
    const grouped = matches.slice(0, 5).map((m, i) => `${i + 1}. ${m.summary}`).join('\n');
    const sourceNote = matches.some(m => m.external) ? 'Some results are partner/external links stored inside the site metadata.' : 'All results come from Student Support Hub local data.';
    const apExtra = apAnswer ? `\n\nAP planning note:\n${apAnswer.text}` : '';
    return { text: `I found these grounded results from the site knowledge base:\n\n${grouped}\n\n${sourceNote}${apExtra}`, sources: [...matches.slice(0, 5), ...((apAnswer === null || apAnswer === void 0 ? void 0 : apAnswer.sources) || [])].slice(0, 8) };
}
function AssistantSource({ source }) {
    const isHash = source.url && source.url.startsWith('#/');
    const content = React.createElement(React.Fragment, null,
        React.createElement("b", null, source.title),
        React.createElement("span", null,
            source.type,
            " \u00B7 ",
            source.source));
    if (source.action)
        return React.createElement("button", { className: "assistant-source", onClick: source.action }, content);
    if (isHash)
        return React.createElement("button", { className: "assistant-source", onClick: () => { location.hash = source.url; } }, content);
    if (source.url)
        return React.createElement("a", { className: "assistant-source", href: source.url, target: "_blank", rel: "noopener noreferrer" }, content);
    return React.createElement("div", { className: "assistant-source" }, content);
}
function KnowledgeAssistant({ data, reading }) {
    const [messages, setMessages] = useState(() => readJSON(STORAGE.assistant, ASSISTANT_STARTER));
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('Auto');
    const examples = ['Which papers discuss technology or scientific revolutions?', 'Build me an AP plan for medicine starting in grade 10.', 'What AMTech resources connect to computer science?', 'Show opportunities for STEM students.', 'Find books or papers about international relations.'];
    function save(next) { setMessages(next); writeJSON(STORAGE.assistant, next.slice(-24)); }
    function ask(text = input) {
        const question = text.trim();
        if (!question)
            return;
        const answer = generateAssistantAnswer(mode === 'Auto' ? question : `${mode}: ${question}`, data);
        save([...messages, { role: 'user', text: question, mode }, { role: 'assistant', text: answer.text, sources: answer.sources || [] }]);
        setInput('');
    }
    function clear() { save(ASSISTANT_STARTER); }
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Knowledge Assistant", title: "Student Support Hub Assistant", subtitle: "Ask targeted questions about the research library, AP planning, partners, opportunities, and site resources. The assistant only uses information stored inside this website." },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: data.papers.length, label: "Papers indexed" }),
                React.createElement(Stat, { num: AP_COURSES.length, label: "AP courses" }),
                React.createElement(Stat, { num: partnerData('resources', []).length, label: "Partner resources" }))),
        React.createElement("section", { className: "container section assistant-layout" },
            React.createElement("article", { className: "assistant-chat panel" },
                React.createElement("div", { className: "assistant-toolbar" },
                    React.createElement("div", null,
                        React.createElement(Badge, { tone: "gold" }, "Site data only"),
                        React.createElement("h2", null, "Ask a focused question")),
                    React.createElement("div", { className: "tools" },
                        React.createElement("select", { value: mode, onChange: e => setMode(e.target.value) },
                            React.createElement("option", null, "Auto"),
                            React.createElement("option", null, "Research"),
                            React.createElement("option", null, "AP Planning"),
                            React.createElement("option", null, "Partner Resources"),
                            React.createElement("option", null, "Opportunities")),
                        React.createElement("button", { className: "btn ghost small", onClick: clear }, "Clear"))),
                React.createElement("div", { className: "message-list" }, messages.map((m, i) => { var _a; return React.createElement("div", { key: i, className: `message ${m.role}` },
                    React.createElement("div", { className: "bubble" },
                        React.createElement("p", null, m.text),
                        ((_a = m.sources) === null || _a === void 0 ? void 0 : _a.length) > 0 && React.createElement("div", { className: "assistant-sources" },
                            React.createElement("small", null, "Sources used"),
                            m.sources.map((s, idx) => React.createElement(AssistantSource, { key: (s.id || s.title) + idx, source: s }))))); })),
                React.createElement("div", { className: "assistant-input" },
                    React.createElement("textarea", { value: input, onChange: e => setInput(e.target.value), onKeyDown: e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            ask();
                        } }, placeholder: "Ask about research, AP plans, AMTech, opportunities, or site content\u2026" }),
                    React.createElement("button", { className: "btn primary", onClick: () => ask() }, "Ask"))),
            React.createElement("aside", { className: "assistant-side panel pad sticky" },
                React.createElement("h2", null, "Try these"),
                React.createElement("div", { className: "prompt-list" }, examples.map(ex => React.createElement("button", { key: ex, onClick: () => ask(ex) }, ex))),
                React.createElement("div", { className: "notice" },
                    React.createElement("b", null, "Source rule:"),
                    " Answers are limited to the research, AP, partner, and opportunity data already included in the site."),
                React.createElement("h3", null, "Knowledge base"),
                React.createElement("ul", { className: "knowledge-list" },
                    React.createElement("li", null,
                        data.books.length,
                        " AMRC publications"),
                    React.createElement("li", null,
                        data.papers.length,
                        " research papers"),
                    React.createElement("li", null,
                        AP_COURSES.length,
                        " AP course profiles"),
                    React.createElement("li", null,
                        partnerData('resources', []).length,
                        " partner resources"),
                    React.createElement("li", null,
                        partnerData('opportunities', []).length,
                        " opportunities")))));
}
function Collaborations() {
    const partners = partnerData('partners', []);
    const resources = partnerData('resources', []);
    const opportunities = partnerData('opportunities', []);
    const [source, setSource] = useState('All');
    const [type, setType] = useState('All');
    const visibleResources = resources.filter(r => (source === 'All' || r.partnerId === source) && (type === 'All' || r.type === type));
    const partnerOptions = partners.map(p => p.id);
    const types = uniq(resources.map(r => r.type)).sort();
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Collaborations", title: "Partner network", subtitle: "A structured partner system for external educational websites, shared resources, STEM opportunities, and AP pathway support. AMTech is included as a standard partner entry rather than a homepage promotion." },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: partners.length, label: "Partners" }),
                React.createElement(Stat, { num: resources.length, label: "Partner resources" }),
                React.createElement(Stat, { num: opportunities.length, label: "Opportunities" }))),
        React.createElement("section", { className: "container section" },
            React.createElement(SectionHead, { kicker: "Partners", title: "Approved partner list", subtitle: "Partners can be added here without redesigning the website. Each partner can power resources, opportunities, and AP recommendations." }),
            React.createElement("div", { className: "partner-grid" }, partners.map(p => React.createElement("article", { className: "partner-card", key: p.id },
                React.createElement("div", { className: "partner-logo" }, p.logoText || initials(p.name)),
                React.createElement("div", null,
                    React.createElement(Badge, { tone: "gold" }, p.status || 'Partner'),
                    React.createElement("h3", null, p.name),
                    React.createElement("p", null, p.description),
                    React.createElement("div", { className: "tag-row" }, (p.focusAreas || []).map(t => React.createElement("span", { key: t }, t))),
                    p.website && React.createElement("a", { className: "btn ghost small", href: p.website, target: "_blank", rel: "noopener noreferrer" }, "Visit website")))))),
        React.createElement("section", { className: "container section" },
            React.createElement(SectionHead, { kicker: "Shared resources", title: "Partner resources directory", subtitle: "These resources are separated from AMRC research but can still appear in the Research Hub through the Source filter." }),
            React.createElement("div", { className: "partner-toolbar" },
                React.createElement("select", { value: source, onChange: e => setSource(e.target.value) },
                    React.createElement("option", { value: "All" }, "All partners"),
                    partnerOptions.map(id => { const p = partners.find(x => x.id === id); return React.createElement("option", { key: id, value: id }, (p === null || p === void 0 ? void 0 : p.name) || id); })),
                React.createElement("select", { value: type, onChange: e => setType(e.target.value) },
                    React.createElement("option", { value: "All" }, "All resource types"),
                    types.map(t => React.createElement("option", { key: t }, t))),
                React.createElement("button", { className: "btn primary", onClick: () => go('research') }, "Search with research")),
            React.createElement("div", { className: "resource-grid" }, visibleResources.map(r => React.createElement(PartnerResourceCard, { key: r.id, resource: Object.assign(Object.assign({}, r), { source: r.partnerName, authors: r.partnerName, year: r.year, subject: r.subject, keywords: r.tags }) })))),
        React.createElement("section", { className: "container section" },
            React.createElement(SectionHead, { kicker: "Student opportunities", title: "Opportunity board", subtitle: "A scalable board for competitions, STEM events, student projects, research openings, and partner-led opportunities." }),
            React.createElement("div", { className: "opportunity-grid" }, opportunities.map(o => React.createElement("article", { className: "opportunity-card", key: o.id },
                React.createElement(Badge, null, o.partnerName),
                React.createElement("h3", null, o.title),
                React.createElement("p", null, o.description),
                React.createElement(MetaLine, { items: [o.type, o.audience, o.timeline] }),
                o.url && React.createElement("a", { className: "link-btn", href: o.url, target: "_blank", rel: "noopener noreferrer" }, "Open opportunity \u2192"))))));
}
const ALUMNI_REGION_DEFAULTS = [
    { id: 'uae-middle-east', label: 'UAE & MENA', short: 'ME', countries: ['United Arab Emirates'], top: '56%', left: '58%' },
    { id: 'united-kingdom', label: 'United Kingdom', short: 'UK', countries: ['United Kingdom'], top: '35%', left: '47%' },
    { id: 'europe', label: 'Europe', short: 'EU', countries: ['Europe'], top: '39%', left: '51%' },
    { id: 'united-states', label: 'United States', short: 'US', countries: ['United States'], top: '43%', left: '22%' },
    { id: 'canada', label: 'Canada', short: 'CA', countries: ['Canada'], top: '30%', left: '22%' },
    { id: 'asia', label: 'Asia', short: 'AS', countries: ['Asia'], top: '47%', left: '72%' },
    { id: 'australia', label: 'Australia & New Zealand', short: 'ANZ', countries: ['Australia', 'New Zealand'], top: '72%', left: '79%' },
    { id: 'other', label: 'Africa', short: 'AF', countries: ['Other'], top: '64%', left: '45%' }
];
function getAlumniRegions() {
    const data = alumniSource();
    const supplied = Array.isArray(data.regions) ? data.regions : [];
    return ALUMNI_REGION_DEFAULTS.map(base => {
        var _a, _b;
        const match = supplied.find(r => r.id === base.id || normalize(r.label) === normalize(base.label));
        return Object.assign(Object.assign(Object.assign({}, base), (match || {})), { top: (match === null || match === void 0 ? void 0 : match.top) || ((_a = match === null || match === void 0 ? void 0 : match.map) === null || _a === void 0 ? void 0 : _a.top) || base.top, left: (match === null || match === void 0 ? void 0 : match.left) || ((_b = match === null || match === void 0 ? void 0 : match.map) === null || _b === void 0 ? void 0 : _b.left) || base.left, universities: Array.isArray(match === null || match === void 0 ? void 0 : match.universities) ? match.universities : [] });
    });
}
function alumniRegionCount(region) {
    return (region.universities || []).reduce((sum, u) => sum + (Number(u.alumni) || 0), 0);
}
function alumniRegionMetric(region, useUniversityCounts) {
    return useUniversityCounts ? (region.universities || []).length : alumniRegionCount(region);
}
function AlumniDestinations() {
    var _a, _b, _c, _d;
    const alumniData = alumniSource();
    const usesUniversityCounts = alumniData.countMode === 'universities' || alumniData.exactAlumniCounts === false;
    const regions = useMemo(() => getAlumniRegions(), []);
    const [active, setActive] = useState('all');
    const activeRegions = active === 'all' ? regions : regions.filter(r => r.id === active);
    const universities = activeRegions.flatMap(region => (region.universities || []).map(u => (Object.assign(Object.assign({}, u), { regionLabel: region.label }))));
    const totalMetric = regions.reduce((sum, r) => sum + alumniRegionMetric(r, usesUniversityCounts), 0);
    const totalUniversities = regions.reduce((sum, r) => sum + (r.universities || []).length, 0);
    const countries = uniq(regions.flatMap(r => (r.universities || []).map(u => { var _a; return u.country || ((_a = r.countries) === null || _a === void 0 ? void 0 : _a[0]); })));
    const graduateSchools = Array.isArray((_a = alumniData.graduates) === null || _a === void 0 ? void 0 : _a.schools) ? alumniData.graduates.schools : [];
    const graduateTotal = Number((_b = alumniData.graduates) === null || _b === void 0 ? void 0 : _b.total) || graduateSchools.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const graduateRange = ((_c = alumniData.graduates) === null || _c === void 0 ? void 0 : _c.yearRange) || '';
    const activeMetric = activeRegions.reduce((sum, r) => sum + alumniRegionMetric(r, usesUniversityCounts), 0);
    const activeCountryCount = uniq(universities.map(u => u.country).filter(Boolean)).length;
    const sortedUniversities = universities.slice().sort((a, b) => String(a.country || '').localeCompare(String(b.country || '')) || String(a.name || '').localeCompare(String(b.name || '')));
    const activeLabel = active === 'all' ? 'All destinations' : (((_d = regions.find(r => r.id === active)) === null || _d === void 0 ? void 0 : _d.label) || 'Selected region');
    const metricLabel = usesUniversityCounts ? 'University destinations' : 'Alumni records';
    const shortMetricLabel = usesUniversityCounts ? 'Destinations' : 'Alumni';
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Alumni destinations", title: "Where AMSI alumni go next", subtitle: "A map-style view built from the AMSI Alumni Around the World university list." },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: graduateTotal ? graduateTotal.toLocaleString() : totalMetric, label: graduateTotal ? 'AMSI graduates' : metricLabel }),
                React.createElement(Stat, { num: totalUniversities, label: "University destinations" }),
                React.createElement(Stat, { num: countries.length, label: "Countries" }))),
        graduateTotal ? React.createElement("section", { className: "container alumni-totals-strip" },
            React.createElement("article", { className: "panel pad alumni-total-card" },
                React.createElement("div", null,
                    React.createElement("p", { className: "kicker" }, "AMSI graduate totals"),
                    React.createElement("h2", null,
                        graduateTotal.toLocaleString(),
                        " graduates"),
                    React.createElement("p", { className: "muted" },
                        "From the AMSI Graduates Per Year chart",
                        graduateRange ? `, ${graduateRange}` : '',
                        ". These are total graduates across the AMSI schools shown in the PDF, not per-university counts.")),
                React.createElement("div", { className: "alumni-school-totals" }, graduateSchools.map(s => React.createElement("div", { key: s.id },
                    React.createElement("b", null, Number(s.total || 0).toLocaleString()),
                    React.createElement("span", null, s.name)))))) : null,
        React.createElement("section", { className: "container section alumni-layout" },
            React.createElement("article", { className: "panel pad alumni-map-card" },
                React.createElement(SectionHead, { kicker: "Interactive map", title: "Choose a region", subtitle: "Press a map marker or region button to show the verified university destinations for that region." }),
                alumniData.note && React.createElement("div", { className: "notice info" },
                    React.createElement("b", null, "Totals from the uploaded PDF"),
                    React.createElement("span", null, alumniData.note)),
                React.createElement("div", { className: "alumni-map alumni-map-graphic", "aria-label": "AMSI Alumni Around the World map graphic" },
                    React.createElement("img", { src: "assets/img/amsi-alumni-map.png", alt: "AMSI Alumni Around the World map graphic" }),
                    React.createElement("div", { className: "alumni-map-overlay" }, regions.map(region => React.createElement("button", { key: region.id, className: `map-pin ${active === region.id ? 'active' : ''}`, style: { top: region.top, left: region.left }, onClick: () => setActive(region.id), title: `${region.label}: ${alumniRegionMetric(region, usesUniversityCounts)} ${usesUniversityCounts ? 'university destinations' : 'alumni'}` },
                        React.createElement("span", null, region.short),
                        React.createElement("b", null, alumniRegionMetric(region, usesUniversityCounts)))))),
                React.createElement("div", { className: "alumni-region-buttons" },
                    React.createElement("button", { className: active === 'all' ? 'active' : '', onClick: () => setActive('all') },
                        "All destinations ",
                        React.createElement("b", null, totalMetric)),
                    regions.map(region => React.createElement("button", { key: region.id, className: active === region.id ? 'active' : '', onClick: () => setActive(region.id) },
                        region.label,
                        React.createElement("b", null, alumniRegionMetric(region, usesUniversityCounts)))))),
            React.createElement("aside", { className: "panel pad alumni-details-card" },
                React.createElement("p", { className: "kicker" }, "Selected view"),
                React.createElement("h2", null, activeLabel),
                React.createElement("div", { className: "alumni-mini-stats" },
                    React.createElement(Stat, { num: activeMetric, label: shortMetricLabel }),
                    React.createElement(Stat, { num: sortedUniversities.length, label: "Universities" }),
                    React.createElement(Stat, { num: activeCountryCount, label: "Countries" })),
                alumniData.source && React.createElement("p", { className: "alumni-source-note" },
                    "Source: ",
                    alumniData.source),
                React.createElement("div", { className: "alumni-university-list" }, sortedUniversities.length ? sortedUniversities.map((u, i) => React.createElement("article", { className: "alumni-university", key: `${u.name}-${i}` },
                    React.createElement("div", null,
                        React.createElement("b", null, u.name),
                        React.createElement("span", null, [u.city, u.country].filter(Boolean).join(', ') || u.regionLabel),
                        u.notes && React.createElement("small", null, u.notes)),
                    usesUniversityCounts ? React.createElement("strong", { className: "destination-dot" }, "\u2713") : React.createElement("strong", null, Number(u.alumni) || 0))) : React.createElement(Empty, { title: "No universities in this view yet.", text: "Once real alumni data is added, this panel will show the university names and alumni numbers for the selected region." })))));
}
function APPlanning() {
    const [tab, setTab] = useState('resources');
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "AP Planning", title: "Advanced Placement hub", subtitle: "The AP course library and AP Decider are now combined into one cleaner planning workspace." },
            React.createElement("div", { className: "hero-stats" },
                React.createElement(Stat, { num: AP_COURSES.filter(c => !c.emerging).length, label: "AP courses" }),
                React.createElement(Stat, { num: AP_AREAS.length, label: "Subject areas" }),
                React.createElement(Stat, { num: PATHWAYS.length, label: "Pathways" }))),
        React.createElement("section", { className: "container section" },
            React.createElement("div", { className: "ap-combined-tabs", role: "tablist", "aria-label": "AP planning tools" },
                React.createElement("button", { className: tab === 'resources' ? 'active' : '', onClick: () => setTab('resources') }, "Course library + comparison"),
                React.createElement("button", { className: tab === 'decider' ? 'active' : '', onClick: () => setTab('decider') }, "AP Decider roadmap")),
            tab === 'resources' ? React.createElement(APResources, { embedded: true }) : React.createElement(APDecider, { embedded: true })));
}
function APResources({ embedded = false } = {}) {
    const [area, setArea] = useState('All');
    const [compare, setCompare] = useState(['AP Biology', 'AP Chemistry', 'AP Statistics']);
    const visible = AP_COURSES.filter(c => area === 'All' || c.area === area);
    const chosen = compare.map(n => AP_COURSES.find(c => c.name === n)).filter(Boolean);
    const setSlot = (i, value) => setCompare(compare.map((x, idx) => idx === i ? value : x));
    const content = React.createElement("div", { className: "ap-dashboard" },
        React.createElement("div", { className: "panel pad" },
            React.createElement(SectionHead, { kicker: "Course library", title: "AP subjects by area", subtitle: "Browse courses, compare workload, and understand fit before building a roadmap." }),
            React.createElement("div", { className: "area-tabs" },
                React.createElement("button", { className: area === 'All' ? 'active' : '', onClick: () => setArea('All') }, "All"),
                AP_AREAS.map(a => React.createElement("button", { key: a, className: area === a ? 'active' : '', onClick: () => setArea(a) }, a))),
            React.createElement("div", { className: "course-grid" }, visible.map(c => React.createElement(CourseCard, { key: c.name, course: c })))),
        React.createElement("aside", { className: "panel pad sticky" },
            React.createElement("h2", null, "AP comparison tool"),
            React.createElement("p", { className: "muted" }, "Compare up to three courses side by side before building a plan."),
            [0, 1, 2].map(i => React.createElement("select", { key: i, value: compare[i], onChange: e => setSlot(i, e.target.value) }, AP_COURSES.map(c => React.createElement("option", { key: c.name }, c.name)))),
            React.createElement("div", { className: "compare-stack" }, chosen.map(c => React.createElement("div", { className: "compare-card", key: c.name },
                React.createElement("b", null, c.name),
                React.createElement("span", null, c.area),
                React.createElement("meter", { min: "1", max: "5", value: c.difficulty }),
                React.createElement("small", null,
                    "Difficulty ",
                    c.difficulty,
                    "/5 \u00B7 Workload ",
                    c.workload,
                    "/5"),
                React.createElement("p", null, c.summary)))),
            React.createElement(RecommendedPartnerResources, { courses: chosen, compact: true })));
    if (embedded)
        return content;
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Advanced Placement Resources", title: "Plan AP courses with clarity", subtitle: "Browse AP subjects, understand fit, compare workload, and connect choices to future academic pathways." }),
        React.createElement("section", { className: "container section" }, content));
}
function CourseCard({ course }) { return React.createElement("article", { className: "course-card" },
    React.createElement("div", { className: "course-top" },
        React.createElement(Badge, null, course.area),
        course.emerging && React.createElement(Badge, { tone: "gold" }, "Emerging")),
    React.createElement("h3", null, course.name),
    React.createElement("p", null, course.summary),
    React.createElement(MetaLine, { items: [`Difficulty ${course.difficulty}/5`, `Workload ${course.workload}/5`, `Grades ${course.grades.join(', ')}`] }),
    React.createElement("div", { className: "skill-bars" },
        React.createElement(Skill, { label: "Writing", value: course.writing }),
        React.createElement(Skill, { label: "Math", value: course.math }),
        React.createElement(Skill, { label: "Memory", value: course.memorization }))); }
function Skill({ label, value }) { return React.createElement("div", { className: "skill" },
    React.createElement("span", null, label),
    React.createElement("i", null,
        React.createElement("b", { style: { width: `${value * 20}%` } }))); }
function RecommendedPartnerResources({ courses = [], profile = null, compact = false }) {
    const resources = partnerData('resources', []);
    const signals = new Set();
    courses.forEach(c => { (c.interests || []).forEach(x => signals.add(x)); (c.pathways || []).forEach(x => signals.add(x)); signals.add(c.area); });
    ((profile === null || profile === void 0 ? void 0 : profile.interests) || []).forEach(x => signals.add(x));
    if (profile === null || profile === void 0 ? void 0 : profile.pathway)
        signals.add(profile.pathway);
    const matches = resources.map(r => {
        const tags = [r.subject, r.type, ...(r.tags || [])].map(x => normalize(x));
        const score = [...signals].reduce((n, s) => n + (tags.some(t => t.includes(normalize(s)) || normalize(s).includes(t)) ? 1 : 0), 0);
        return Object.assign(Object.assign({}, r), { score });
    }).filter(r => r.score > 0 || /stem|technology|computer|engineering|ap/i.test(`${r.subject} ${toText(r.tags)}`)).sort((a, b) => b.score - a.score).slice(0, compact ? 2 : 4);
    if (!matches.length)
        return null;
    return React.createElement("div", { className: "partner-recommendations" },
        React.createElement("h3", null, "Recommended partner resources"),
        React.createElement("p", { className: "muted" }, "Because of the selected AP interests, these partner resources may be useful next steps."),
        React.createElement("div", { className: "compact-list" }, matches.map(r => React.createElement("a", { key: r.id, href: r.url, target: "_blank", rel: "noopener noreferrer" },
            React.createElement("b", null, r.title),
            React.createElement("span", null,
                r.partnerName,
                " \u00B7 ",
                r.subject)))));
}
function scoreCourse(course, profile) {
    let score = 0;
    const pathway = PATHWAYS.find(p => p.id === profile.pathway) || PATHWAYS[0];
    if (course.emerging)
        score -= 3;
    if (course.grades.includes(Number(profile.grade)))
        score += 4;
    if (course.grades.some(g => g > Number(profile.grade)))
        score += 2;
    course.interests.forEach(i => { if (profile.interests.includes(i) || pathway.interests.includes(i))
        score += 3; });
    if (course.pathways.includes(profile.pathway))
        score += 5;
    if (pathway.priority.includes(course.name))
        score += 6;
    if (profile.completed.includes(course.name))
        score -= 100;
    if (profile.weaknesses.includes('math') && course.math >= 4)
        score -= 5;
    if (profile.weaknesses.includes('writing') && course.writing >= 4)
        score -= 4;
    if (profile.weaknesses.includes('memorization') && course.memorization >= 4)
        score -= 3;
    if (course.math > Number(profile.math))
        score -= (course.math - Number(profile.math)) * 4;
    if (course.writing > Number(profile.writing))
        score -= (course.writing - Number(profile.writing)) * 3;
    if (course.difficulty > Number(profile.stress) + 2)
        score -= 3;
    if (course.workload > Math.ceil(Number(profile.time) / 2) + 1)
        score -= 2;
    return score;
}
function generateAPPlan(profile) {
    const loadCap = profile.goal === 'elite' ? 5 : profile.goal === 'ambitious' ? 4 : profile.goal === 'balanced' ? 3 : 2;
    const ranked = AP_COURSES.filter(c => !c.emerging).map(c => (Object.assign(Object.assign({}, c), { score: scoreCourse(c, profile) }))).sort((a, b) => b.score - a.score);
    const plan = [];
    const used = new Set(profile.completed);
    for (let grade = Number(profile.grade); grade <= 12; grade++) {
        const cap = Math.max(1, Math.min(loadCap, grade === 9 ? 2 : grade === 10 ? loadCap : loadCap + 1));
        const courses = ranked.filter(c => !used.has(c.name) && c.grades.includes(grade) && c.score > -5).slice(0, cap);
        courses.forEach(c => used.add(c.name));
        plan.push({ grade, courses });
    }
    const avoided = ranked.filter(c => !used.has(c.name) && (c.math > Number(profile.math) + 1 || c.writing > Number(profile.writing) + 1 || c.difficulty > Number(profile.stress) + 2)).slice(0, 5);
    const total = plan.reduce((n, y) => n + y.courses.length, 0);
    const avg = total ? plan.flatMap(y => y.courses).reduce((n, c) => n + c.difficulty, 0) / total : 0;
    const risk = avg >= 4.3 || total >= 12 ? 'High' : avg >= 3.6 || total >= 8 ? 'Moderate' : 'Controlled';
    return { plan, avoided, risk, total };
}
function APDecider({ embedded = false } = {}) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);
    const [result, setResult] = useState(() => generateAPPlan(DEFAULT_PROFILE));
    const interests = uniq(AP_COURSES.flatMap(c => c.interests)).sort();
    const toggle = (field, value) => setProfile(p => (Object.assign(Object.assign({}, p), { [field]: p[field].includes(value) ? p[field].filter(x => x !== value) : [...p[field], value] })));
    const update = patch => setProfile(p => (Object.assign(Object.assign({}, p), patch)));
    const content = React.createElement("div", { className: "ap-decider-grid" },
        React.createElement("div", { className: "panel pad" },
            React.createElement(SectionHead, { kicker: "Student profile", title: "Tell the Decider what kind of plan you need" }),
            React.createElement("div", { className: "form-grid" },
                React.createElement(Field, { label: "Current grade" },
                    React.createElement("select", { value: profile.grade, onChange: e => update({ grade: e.target.value }) }, [9, 10, 11, 12].map(g => React.createElement("option", { key: g }, g)))),
                React.createElement(Field, { label: "GPA range" },
                    React.createElement("select", { value: profile.gpa, onChange: e => update({ gpa: e.target.value }) },
                        React.createElement("option", null, "3.0-3.4"),
                        React.createElement("option", null, "3.5-3.8"),
                        React.createElement("option", null, "3.9-4.0+"))),
                React.createElement(Field, { label: "Plan intensity" },
                    React.createElement("select", { value: profile.goal, onChange: e => update({ goal: e.target.value }) },
                        React.createElement("option", { value: "protected" }, "Protected / low stress"),
                        React.createElement("option", { value: "balanced" }, "Balanced"),
                        React.createElement("option", { value: "ambitious" }, "Ambitious"),
                        React.createElement("option", { value: "elite" }, "Elite rigor"))),
                React.createElement(Field, { label: "Pathway" },
                    React.createElement("select", { value: profile.pathway, onChange: e => update({ pathway: e.target.value }) }, PATHWAYS.map(p => React.createElement("option", { key: p.id, value: p.id }, p.label)))),
                React.createElement(Field, { label: "Stress tolerance" },
                    React.createElement("input", { type: "range", min: "1", max: "5", value: profile.stress, onChange: e => update({ stress: e.target.value }) })),
                React.createElement(Field, { label: "Weekly AP study hours" },
                    React.createElement("input", { type: "range", min: "2", max: "14", value: profile.time, onChange: e => update({ time: e.target.value }) }),
                    React.createElement("small", null,
                        profile.time,
                        " hours/week")),
                React.createElement(Field, { label: "Math readiness" },
                    React.createElement("input", { type: "range", min: "1", max: "5", value: profile.math, onChange: e => update({ math: e.target.value }) })),
                React.createElement(Field, { label: "Writing readiness" },
                    React.createElement("input", { type: "range", min: "1", max: "5", value: profile.writing, onChange: e => update({ writing: e.target.value }) }))),
            React.createElement("h3", null, "Interests"),
            React.createElement("div", { className: "choice-cloud" }, interests.map(i => React.createElement("button", { key: i, type: "button", className: profile.interests.includes(i) ? 'choice active' : 'choice', onClick: () => toggle('interests', i) }, i))),
            React.createElement("h3", null, "Areas to protect"),
            React.createElement("div", { className: "choice-cloud" }, ['math', 'writing', 'memorization', 'heavy reading', 'lab science'].map(i => React.createElement("button", { key: i, type: "button", className: profile.weaknesses.includes(i) ? 'choice active' : 'choice', onClick: () => toggle('weaknesses', i) }, i))),
            React.createElement("h3", null, "Already completed/current APs"),
            React.createElement("div", { className: "choice-cloud scroll" }, AP_COURSES.filter(c => !c.emerging).map(c => React.createElement("button", { key: c.name, type: "button", className: profile.completed.includes(c.name) ? 'choice active' : 'choice', onClick: () => toggle('completed', c.name) }, c.name.replace('AP ', '')))),
            React.createElement("button", { className: "btn primary", onClick: () => setResult(generateAPPlan(profile)) }, "Generate updated plan")),
        React.createElement("aside", { className: "panel pad sticky" },
            React.createElement("h2", null, "Recommendation"),
            React.createElement("div", { className: `risk ${result.risk.toLowerCase()}` },
                result.risk,
                " workload risk"),
            React.createElement("p", { className: "muted" },
                result.total,
                " recommended APs across the remaining high school timeline."),
            React.createElement("div", { className: "timeline" }, result.plan.map(y => React.createElement("div", { className: "year-plan", key: y.grade },
                React.createElement("b", null,
                    "Grade ",
                    y.grade),
                y.courses.length ? y.courses.map(c => React.createElement("div", { className: "mini-plan", key: c.name },
                    React.createElement("span", null, c.name),
                    React.createElement("small", null,
                        c.area,
                        " \u00B7 difficulty ",
                        c.difficulty,
                        "/5"))) : React.createElement("small", null, "No APs recommended from current settings.")))),
            result.avoided.length > 0 && React.createElement(React.Fragment, null,
                React.createElement("h3", null, "APs to avoid for now"),
                React.createElement("ul", { className: "avoid-list" }, result.avoided.map(c => React.createElement("li", { key: c.name }, c.name)))),
            React.createElement(RecommendedPartnerResources, { courses: result.plan.flatMap(y => y.courses), profile: profile })));
    if (embedded)
        return content;
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "AP Decider v2", title: "Build a smarter four-year AP roadmap", subtitle: "The algorithm balances grade level, pathway, strengths, weak points, workload, stress tolerance, and AP readiness." }),
        React.createElement("section", { className: "container section" }, content));
}
function Field({ label, children }) { return React.createElement("label", { className: "field" },
    React.createElement("span", null, label),
    children); }
function Admin({ data, auth, onLogin }) {
    var _a, _b, _c, _d;
    const [msg, setMsg] = useState('');
    const [book, setBook] = useState({ title: '', editors: '', description: '', publicationYear: new Date().getFullYear(), clubId: (_a = data.clubs[0]) === null || _a === void 0 ? void 0 : _a.id, academicYearId: (_b = data.years[0]) === null || _b === void 0 ? void 0 : _b.id, sections: 'Introduction' });
    const [paper, setPaper] = useState({ title: '', authors: '', abstract: '', keywords: '', category: '', year: new Date().getFullYear(), bookId: '', clubId: (_c = data.clubs[0]) === null || _c === void 0 ? void 0 : _c.id, academicYearId: (_d = data.years[0]) === null || _d === void 0 ? void 0 : _d.id });
    const [bookFile, setBookFile] = useState(null);
    const [paperFile, setPaperFile] = useState(null);
    async function addBook(e) { e.preventDefault(); const id = 'book_' + Date.now(); let pdf = ''; if (bookFile)
        pdf = await saveLocalPDF(bookFile, 'book'); const newBook = Object.assign(Object.assign({}, book), { id, pdf, publicationYear: Number(book.publicationYear), size: (bookFile === null || bookFile === void 0 ? void 0 : bookFile.size) || 0, pages: 0, papers: 0 }); const newParts = [...data.parts, { id: 'part_' + id, title: 'Full Book', partNumber: 1, bookId: id }]; const newChapters = book.sections.split('\n').filter(Boolean).map((title, i) => ({ id: `ch_${id}_${i}`, title, chapterNumber: i + 1, bookId: id, partId: 'part_' + id })); data.setBooks([...data.books, newBook]); data.setParts(newParts); data.setChapters([...data.chapters, ...newChapters]); setMsg('Publication saved locally.'); }
    async function addPaper(e) { e.preventDefault(); let pdf = ''; if (paperFile)
        pdf = await saveLocalPDF(paperFile, 'paper'); const newPaper = Object.assign(Object.assign({}, paper), { id: 'paper_' + Date.now(), num: data.papers.length + 1, year: Number(paper.year), keywords: paper.keywords.split(',').map(x => x.trim()).filter(Boolean), pdf }); data.setPapers([...data.papers, newPaper]); setMsg('Paper saved locally.'); }
    const exportMeta = () => { const blob = new Blob([JSON.stringify({ books: data.books, papers: data.papers, parts: data.parts, chapters: data.chapters, partners: partnerData('partners', []), partnerResources: partnerData('resources', []), opportunities: partnerData('opportunities', []) }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'amrc-metadata-export.json'; a.click(); URL.revokeObjectURL(a.href); };
    if (!auth)
        return React.createElement("main", null,
            React.createElement(PageHeader, { eyebrow: "Management Portal", title: "Admin access required", subtitle: "Sign in to manage publication metadata and local prototype uploads." }),
            React.createElement("section", { className: "container section" },
                React.createElement("button", { className: "btn primary", onClick: onLogin }, "Sign in")));
    return React.createElement("main", null,
        React.createElement(PageHeader, { eyebrow: "Management Portal", title: "Research operations dashboard", subtitle: "Prototype tools for adding publications, uploading individual papers, and exporting metadata." }),
        React.createElement("section", { className: "container section" },
            React.createElement("div", { className: "ops-grid" },
                React.createElement(Stat, { num: data.books.length, label: "Publications" }),
                React.createElement(Stat, { num: data.papers.length, label: "Papers" }),
                React.createElement(Stat, { num: uniq(data.papers.map(p => p.category)).length, label: "Subjects" }),
                React.createElement(Stat, { num: data.papers.filter(p => !p.pdf).length, label: "Missing PDFs" })),
            msg && React.createElement("div", { className: "notice success" }, msg),
            React.createElement("div", { className: "admin-grid" },
                React.createElement("form", { className: "panel pad", onSubmit: addBook },
                    React.createElement("h2", null, "Add publication"),
                    React.createElement(Field, { label: "Title" },
                        React.createElement("input", { value: book.title, onChange: e => setBook(Object.assign(Object.assign({}, book), { title: e.target.value })) })),
                    React.createElement(Field, { label: "Editors" },
                        React.createElement("input", { value: book.editors, onChange: e => setBook(Object.assign(Object.assign({}, book), { editors: e.target.value })) })),
                    React.createElement(Field, { label: "Description" },
                        React.createElement("textarea", { value: book.description, onChange: e => setBook(Object.assign(Object.assign({}, book), { description: e.target.value })) })),
                    React.createElement(Field, { label: "Sections, one per line" },
                        React.createElement("textarea", { value: book.sections, onChange: e => setBook(Object.assign(Object.assign({}, book), { sections: e.target.value })) })),
                    React.createElement(Field, { label: "PDF" },
                        React.createElement("input", { type: "file", accept: "application/pdf", onChange: e => setBookFile(e.target.files[0]) })),
                    React.createElement("button", { className: "btn primary" }, "Save publication")),
                React.createElement("form", { className: "panel pad", onSubmit: addPaper },
                    React.createElement("h2", null, "Add paper"),
                    React.createElement(Field, { label: "Title" },
                        React.createElement("input", { value: paper.title, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { title: e.target.value })) })),
                    React.createElement(Field, { label: "Authors" },
                        React.createElement("input", { value: paper.authors, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { authors: e.target.value })) })),
                    React.createElement(Field, { label: "Abstract" },
                        React.createElement("textarea", { value: paper.abstract, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { abstract: e.target.value })) })),
                    React.createElement(Field, { label: "Category" },
                        React.createElement("input", { value: paper.category, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { category: e.target.value })) })),
                    React.createElement(Field, { label: "Book" },
                        React.createElement("select", { value: paper.bookId, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { bookId: e.target.value })) },
                            React.createElement("option", { value: "" }, "Standalone"),
                            data.books.map(b => React.createElement("option", { key: b.id, value: b.id }, b.title)))),
                    React.createElement(Field, { label: "Keywords" },
                        React.createElement("input", { value: paper.keywords, onChange: e => setPaper(Object.assign(Object.assign({}, paper), { keywords: e.target.value })) })),
                    React.createElement(Field, { label: "PDF" },
                        React.createElement("input", { type: "file", accept: "application/pdf", onChange: e => setPaperFile(e.target.files[0]) })),
                    React.createElement("button", { className: "btn primary" }, "Save paper"))),
            React.createElement("div", { className: "panel pad" },
                React.createElement("h2", null, "Data operations"),
                React.createElement("button", { className: "btn ghost", onClick: exportMeta }, "Export metadata JSON"))));
}
function LoginModal({ onClose, onSuccess }) {
    const [name, setName] = useState('admin');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    function submit(e) { e.preventDefault(); const u = USERS[name]; if (u && u.password === password) {
        onSuccess(Object.assign({ username: name }, u));
    }
    else
        setErr('Invalid username or password.'); }
    return React.createElement("div", { className: "modal-back" },
        React.createElement("form", { className: "modal", onSubmit: submit },
            React.createElement("h2", null, "Admin sign in"),
            React.createElement(Field, { label: "Username" },
                React.createElement("input", { value: name, onChange: e => setName(e.target.value) })),
            React.createElement(Field, { label: "Password" },
                React.createElement("input", { type: "password", value: password, onChange: e => setPassword(e.target.value) })),
            err && React.createElement("p", { className: "error" }, err),
            React.createElement("div", { className: "toolbar" },
                React.createElement("button", { className: "btn primary" }, "Sign in"),
                React.createElement("button", { type: "button", className: "btn ghost", onClick: onClose }, "Cancel"))));
}
function LegacyPage() {
  var data = window.LEGACY_DATA || {};
  var timeline = data.timeline || [];
  var contributors = data.contributors || [];
  var stats = data.stats || {};
  var transparency = data.transparency || {};
  var hasTimeline = timeline.length > 0;
  var hasContributors = contributors.length > 0;
  var hasStats = Object.values(stats).some(function(v) { return v !== null; });
  var ranked = contributors.slice().sort(function(a, b) {
    var scoreA = (a.papers || 0) * 2 + (a.years || 0) + (a.publications || 0) * 3;
    var scoreB = (b.papers || 0) * 2 + (b.years || 0) + (b.publications || 0) * 3;
    return scoreB - scoreA;
  });
  var e = React.createElement;
  function EmptyState(icon, title, desc) {
    return e('div', { className: 'legacy-empty-state' },
      e('div', { className: 'legacy-empty-icon' }, icon),
      e('p', { className: 'legacy-empty-title' }, title),
      e('p', { className: 'legacy-empty-desc' }, desc)
    );
  }
  return e('div', { className: 'legacy-page page-section' },
    e('div', { className: 'legacy-header' },
      e('h1', { className: 'legacy-title' }, 'Legacy & Impact'),
      e('p', { className: 'legacy-subtitle' }, 'A living record of AMRC\'s history, its contributors, and the research that defines our school\'s academic identity.')
    ),
    e('section', { className: 'legacy-section' },
      e('h2', { className: 'legacy-section-title' }, 'By the Numbers'),
      hasStats ? e('div', { className: 'legacy-stats-grid' }) : EmptyState('📊', 'Statistics coming soon', 'Verified totals for researchers, papers, and publications will appear here once confirmed by the AMRC team.')
    ),
    e('section', { className: 'legacy-section' },
      e('h2', { className: 'legacy-section-title' }, 'AMRC Timeline'),
      hasTimeline ? e('div', { className: 'legacy-timeline' }) : EmptyState('🗓️', 'Timeline data coming soon', 'Canon events and milestones in AMRC\'s history will be added here after verification.')
    ),
    e('section', { className: 'legacy-section' },
      e('h2', { className: 'legacy-section-title' }, 'Contributor Recognition'),
      e('p', { className: 'legacy-section-desc' }, 'Rankings are calculated from verified data: research papers contributed, years in AMRC, publications included, and leadership roles held.'),
      hasContributors ? e('div', { className: 'legacy-contributors' }) : EmptyState('🏅', 'Contributor data will appear after verification', 'Once contributor names, years of service, and paper counts are confirmed by the AMRC team, rankings will be calculated and displayed here automatically.')
    ),
    e('section', { className: 'legacy-transparency-notice' },
      e('div', { className: 'legacy-transparency-icon' }, '🔍'),
      e('div', null,
        e('p', { className: 'legacy-transparency-text' }, transparency.message || 'All data on this page is sourced from verified AMRC records only. No estimates or approximations are used.'),
        transparency.lastUpdated ? e('p', { className: 'legacy-transparency-updated' }, 'Last updated: ' + transparency.lastUpdated) : null
      )
    )
  );
}
function NotFound() { return React.createElement("main", { className: "container section" },
    React.createElement(Empty, { title: "Page not found.", text: "The requested record does not exist in this release." })); }
function Footer() { return React.createElement("footer", { className: "footer" },
    React.createElement("div", { className: "container" },
        React.createElement("div", null,
            React.createElement("b", null, "Student Support Hub"),
            React.createElement("span", null, "AMRC Research Hub \u00B7 AP Planning \u00B7 Alumni Map \u00B7 Collaborations")),
        React.createElement("div", null, "Academic research library \u00B7 Student publications \u00B7 Planning resources"))); }
function App() {
    const route = useRoute();
    const data = useLocalData();
    const reading = useReadingList();
    let page = null;
    if (route.page === 'home')
        page = React.createElement(Home, { data: data });
    if (route.page === 'research')
        page = React.createElement(ResearchHub, { data: data });
    if (route.page === 'publications')
        page = React.createElement(Publications, { data: data });
    if (route.page === 'subjects')
        page = React.createElement(Subjects, { data: data });
    if (route.page === 'collaborations')
        page = React.createElement(Collaborations, null);
    if (route.page === 'alumni')
        page = React.createElement(AlumniDestinations, null);
    if (route.page === 'assistant')
        page = React.createElement(KnowledgeAssistant, { data: data, reading: reading });
    if (route.page === 'book')
        page = React.createElement(BookView, { id: route.id, data: data });
    if (route.page === 'paper')
        page = React.createElement(PaperView, { id: route.id, data: data, reading: reading });
    if (route.page === 'ap')
        page = React.createElement(APPlanning, null);
    if (route.page === 'ap-resources')
        page = React.createElement(APPlanning, null);
    if (route.page === 'ap-decider')
        page = React.createElement(APPlanning, null);
    if (route.page === 'reading-list')
        page = React.createElement(ReadingList, { data: data, reading: reading });
    if (route.page === 'legacy')
    page = React.createElement(LegacyPage, null);
    return React.createElement(React.Fragment, null,
        React.createElement(TopBar, { route: route }),
        page || React.createElement(NotFound, null),
        React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
