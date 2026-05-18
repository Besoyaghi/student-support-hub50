const { useEffect, useMemo, useState } = React;

const ROUTES = ['home','research','publications','subjects','collaborations','assistant','ap-resources','ap-decider','reading-list','admin','book','paper'];
const STORAGE = {
  readingList: 'ssh_reading_list_v3',
  auth: 'ssh_admin_auth_v3',
  assistant: 'ssh_ai_assistant_history_v1'
};

function parseRoute(){
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [page='home', ...rest] = raw.split('/');
  return { page: ROUTES.includes(page) ? page : 'home', id: rest.length ? decodeURIComponent(rest.join('/')) : null };
}
function go(page, id){ location.hash = id ? `#/${page}/${encodeURIComponent(id)}` : `#/${page}`; }
function readJSON(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function appData(key, fallback){ try { return DB?.get(key, fallback) ?? fallback; } catch { return fallback; } }
function setAppData(key, value){ try { DB?.set(key, value); } catch { localStorage.setItem(key, JSON.stringify(value)); } }
function partnerData(key, fallback){ try { return window.SSH_PARTNER_DATA?.[key] || fallback; } catch { return fallback; } }
function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }
function short(text, len=160){ if(!text) return ''; return text.length > len ? text.slice(0, len).trim() + '…' : text; }
function toText(value){ return Array.isArray(value) ? value.join(', ') : (value || ''); }
function normalize(s){ return String(s || '').toLowerCase().trim(); }
function initials(name){ return String(name || 'AMRC').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
function baseUrl(){ return location.href.split('#')[0]; }
function pdfUrl(path){ if(!path) return ''; if(path.startsWith('idb:')) return path; try { return new URL(path, baseUrl()).href; } catch { return path; } }
function getBookPdf(book){ return book?.pdf ? {pdf:book.pdf,pages:book.pages||0,papers:book.papers||0,size:book.size||0} : (FULL_BOOK_PDFS[book?.id] || null); }
function formatBytes(bytes){ if(!bytes) return ''; const mb = bytes / 1024 / 1024; return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
function copyText(text){ navigator.clipboard?.writeText(text); }

const AP_AREAS = [
  'Arts','English','History & Social Sciences','Math & Computer Science','Sciences','World Languages & Cultures','AP Capstone','AP Career Kickstart'
];
const AP_COURSES = [
  {name:'AP 2-D Art and Design',area:'Arts',difficulty:3,workload:3,writing:2,math:1,memorization:2,grades:[10,11,12],interests:['arts','design','architecture'],pathways:['arts'],summary:'Portfolio-driven design course for students who can create consistently over time.'},
  {name:'AP 3-D Art and Design',area:'Arts',difficulty:3,workload:3,writing:1,math:1,memorization:1,grades:[10,11,12],interests:['arts','design','architecture'],pathways:['arts'],summary:'Best for sculpture, product design, architecture, and spatial portfolio work.'},
  {name:'AP Drawing',area:'Arts',difficulty:3,workload:3,writing:1,math:1,memorization:1,grades:[10,11,12],interests:['arts','design'],pathways:['arts'],summary:'Portfolio course for students building a drawing-centered creative body of work.'},
  {name:'AP Art History',area:'Arts',difficulty:3,workload:4,writing:3,math:1,memorization:4,grades:[10,11,12],interests:['arts','history','culture'],pathways:['humanities','arts'],summary:'Strong for students who like art, history, culture, and visual analysis.'},
  {name:'AP Music Theory',area:'Arts',difficulty:3,workload:3,writing:1,math:2,memorization:3,grades:[10,11,12],interests:['music','arts'],pathways:['arts'],summary:'Best for musicians who want composition, harmony, ear training, and notation.'},
  {name:'AP English Language and Composition',area:'English',difficulty:4,workload:4,writing:5,math:1,memorization:2,grades:[11,12],interests:['writing','law','debate','media','research'],pathways:['humanities','law','business'],summary:'Excellent for argument, rhetoric, nonfiction reading, and college writing readiness.'},
  {name:'AP English Literature and Composition',area:'English',difficulty:4,workload:4,writing:5,math:1,memorization:2,grades:[11,12],interests:['literature','writing','arts'],pathways:['humanities','arts'],summary:'Best for students who enjoy novels, poetry, close reading, and interpretation.'},
  {name:'AP African American Studies',area:'History & Social Sciences',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[10,11,12],interests:['history','culture','justice'],pathways:['humanities','law'],summary:'Interdisciplinary course for history, culture, politics, and social analysis.'},
  {name:'AP Comparative Government and Politics',area:'History & Social Sciences',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[11,12],interests:['policy','law','global','debate'],pathways:['law','humanities'],summary:'Good for global politics, international systems, law, and comparative institutions.'},
  {name:'AP European History',area:'History & Social Sciences',difficulty:4,workload:4,writing:4,math:1,memorization:4,grades:[10,11,12],interests:['history','culture','law'],pathways:['humanities','law'],summary:'Reading-heavy course for students ready for historical argument and evidence.'},
  {name:'AP Human Geography',area:'History & Social Sciences',difficulty:2,workload:2,writing:2,math:1,memorization:3,grades:[9,10],interests:['global','policy','environment','culture'],pathways:['humanities','business'],summary:'A strong first AP for students who like societies, cities, migration, and global issues.'},
  {name:'AP Macroeconomics',area:'History & Social Sciences',difficulty:3,workload:3,writing:2,math:3,memorization:3,grades:[11,12],interests:['economics','finance','business'],pathways:['business','stem'],summary:'Useful for business, finance, policy, and understanding national economies.'},
  {name:'AP Microeconomics',area:'History & Social Sciences',difficulty:3,workload:3,writing:2,math:3,memorization:3,grades:[11,12],interests:['economics','business','entrepreneurship'],pathways:['business','stem'],summary:'Great for markets, incentives, entrepreneurship, and decision-making.'},
  {name:'AP Psychology',area:'History & Social Sciences',difficulty:2,workload:2,writing:2,math:1,memorization:4,grades:[10,11,12],interests:['psychology','medicine','people','education'],pathways:['medicine','humanities'],summary:'Accessible option for behavior, mental processes, health, and social science interests.'},
  {name:'AP United States Government and Politics',area:'History & Social Sciences',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[11,12],interests:['law','policy','debate'],pathways:['law','humanities'],summary:'Strong for law, leadership, public policy, debate, and current events.'},
  {name:'AP United States History',area:'History & Social Sciences',difficulty:4,workload:4,writing:4,math:1,memorization:4,grades:[11,12],interests:['history','law','policy'],pathways:['law','humanities'],summary:'Best after AP-style writing practice; excellent rigor for history-oriented students.'},
  {name:'AP World History: Modern',area:'History & Social Sciences',difficulty:3,workload:4,writing:4,math:1,memorization:4,grades:[10,11],interests:['history','global','policy'],pathways:['humanities','law'],summary:'Good foundation for document-based writing and global historical thinking.'},
  {name:'AP Calculus AB',area:'Math & Computer Science',difficulty:4,workload:4,writing:1,math:5,memorization:2,grades:[11,12],interests:['engineering','science','finance','math'],pathways:['stem','medicine','business'],summary:'Core STEM and quantitative AP; best after precalculus readiness.'},
  {name:'AP Calculus BC',area:'Math & Computer Science',difficulty:5,workload:5,writing:1,math:5,memorization:2,grades:[11,12],interests:['engineering','physics','math','computer science'],pathways:['stem'],summary:'Choose only with very strong math readiness and capacity for intense pace.'},
  {name:'AP Computer Science A',area:'Math & Computer Science',difficulty:4,workload:4,writing:1,math:4,memorization:2,grades:[10,11,12],interests:['computer science','technology','engineering'],pathways:['stem'],summary:'Java-style programming and problem solving for serious CS/STEM students.'},
  {name:'AP Computer Science Principles',area:'Math & Computer Science',difficulty:2,workload:2,writing:2,math:2,memorization:2,grades:[9,10,11,12],interests:['technology','business','creativity','data'],pathways:['stem','business'],summary:'Friendly first tech AP for coding, data, internet, and digital creativity.'},
  {name:'AP Precalculus',area:'Math & Computer Science',difficulty:3,workload:3,writing:1,math:4,memorization:2,grades:[10,11,12],interests:['engineering','science','finance','math'],pathways:['stem','business'],summary:'Strong bridge into calculus for STEM, economics, and quantitative majors.'},
  {name:'AP Statistics',area:'Math & Computer Science',difficulty:3,workload:3,writing:2,math:3,memorization:3,grades:[10,11,12],interests:['medicine','business','psychology','research','data'],pathways:['medicine','business','humanities','stem'],summary:'Highly flexible AP for research, medicine, business, psychology, and data.'},
  {name:'AP Biology',area:'Sciences',difficulty:4,workload:4,writing:2,math:2,memorization:4,grades:[10,11,12],interests:['medicine','biology','environment'],pathways:['medicine','stem'],summary:'Recommended for pre-med, biology, health science, and environmental paths.'},
  {name:'AP Chemistry',area:'Sciences',difficulty:5,workload:5,writing:2,math:4,memorization:3,grades:[11,12],interests:['medicine','chemistry','engineering'],pathways:['medicine','stem'],summary:'Rigorous science AP; best after strong chemistry and algebra foundations.'},
  {name:'AP Environmental Science',area:'Sciences',difficulty:3,workload:3,writing:2,math:2,memorization:3,grades:[10,11,12],interests:['environment','policy','biology','global'],pathways:['medicine','humanities','stem'],summary:'Good for sustainability, ecology, public policy, and global issues.'},
  {name:'AP Physics 1: Algebra-Based',area:'Sciences',difficulty:4,workload:4,writing:1,math:4,memorization:2,grades:[10,11,12],interests:['engineering','physics','architecture'],pathways:['stem'],summary:'Algebra-based physics foundation for engineering and applied science.'},
  {name:'AP Physics 2: Algebra-Based',area:'Sciences',difficulty:4,workload:4,writing:1,math:4,memorization:2,grades:[11,12],interests:['engineering','physics','medicine'],pathways:['stem','medicine'],summary:'Continues algebra-based physics into fluids, electricity, optics, and modern physics.'},
  {name:'AP Physics C: Electricity and Magnetism',area:'Sciences',difficulty:5,workload:5,writing:1,math:5,memorization:2,grades:[11,12],interests:['engineering','physics'],pathways:['stem'],summary:'Calculus-based physics for advanced engineering and physics students.'},
  {name:'AP Physics C: Mechanics',area:'Sciences',difficulty:5,workload:5,writing:1,math:5,memorization:2,grades:[11,12],interests:['engineering','physics'],pathways:['stem'],summary:'Best with calculus or concurrent calculus; key for physics and engineering.'},
  {name:'AP Chinese Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:2,math:1,memorization:3,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','business'],summary:'For students with language background or strong continuing study.'},
  {name:'AP French Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','business'],summary:'Strengthens communication, culture, and global readiness.'},
  {name:'AP German Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','business'],summary:'For students continuing German with a focus on cultural communication.'},
  {name:'AP Italian Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','arts'],summary:'Good fit for students with Italian background or extended language study.'},
  {name:'AP Japanese Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:3,math:1,memorization:4,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','business'],summary:'For students continuing Japanese with strong commitment to language practice.'},
  {name:'AP Latin',area:'World Languages & Cultures',difficulty:4,workload:4,writing:3,math:1,memorization:4,grades:[10,11,12],interests:['language','history','law'],pathways:['humanities','law'],summary:'Strong humanities AP for classics, law, history, and close textual analysis.'},
  {name:'AP Spanish Language and Culture',area:'World Languages & Cultures',difficulty:3,workload:3,writing:3,math:1,memorization:3,grades:[10,11,12],interests:['language','culture','global'],pathways:['humanities','business','medicine'],summary:'Broadly useful for communication, healthcare, business, and global pathways.'},
  {name:'AP Spanish Literature and Culture',area:'World Languages & Cultures',difficulty:4,workload:4,writing:4,math:1,memorization:3,grades:[11,12],interests:['language','literature','culture'],pathways:['humanities','arts'],summary:'Advanced Spanish option for literature, analysis, and cultural interpretation.'},
  {name:'AP Research',area:'AP Capstone',difficulty:4,workload:4,writing:5,math:2,memorization:1,grades:[11,12],interests:['research','science','humanities','writing'],pathways:['medicine','stem','law','humanities','business'],summary:'Independent research course best after AP Seminar or strong research maturity.'},
  {name:'AP Seminar',area:'AP Capstone',difficulty:3,workload:3,writing:4,math:1,memorization:1,grades:[10,11],interests:['research','debate','writing'],pathways:['medicine','stem','law','humanities','business'],summary:'Excellent foundation for research, presentations, academic discussion, and evidence.'},
  {name:'AP Business with Personal Finance',area:'AP Career Kickstart',difficulty:3,workload:3,writing:2,math:3,memorization:2,grades:[10,11,12],interests:['business','finance','entrepreneurship'],pathways:['business'],summary:'Career-focused business and finance course; marked as emerging/availability dependent.',emerging:true},
  {name:'AP Cybersecurity',area:'AP Career Kickstart',difficulty:4,workload:4,writing:1,math:3,memorization:2,grades:[10,11,12],interests:['technology','cybersecurity','computer science'],pathways:['stem'],summary:'Career-focused cybersecurity course; school availability may vary during launch.',emerging:true},
  {name:'AP Networking',area:'AP Career Kickstart',difficulty:4,workload:4,writing:1,math:3,memorization:2,grades:[11,12],interests:['technology','networking','computer science'],pathways:['stem'],summary:'Career-focused networking course; future availability depends on school adoption.',emerging:true}
];

const PATHWAYS = [
  {id:'balanced', label:'Balanced / undecided', interests:['research','writing','technology','global'], priority:['AP English Language and Composition','AP Statistics','AP Seminar','AP Psychology','AP Computer Science Principles']},
  {id:'medicine', label:'Medicine / health science', interests:['medicine','biology','psychology','research'], priority:['AP Biology','AP Chemistry','AP Statistics','AP Psychology','AP English Language and Composition']},
  {id:'stem', label:'Engineering / computer science', interests:['engineering','computer science','physics','technology','math'], priority:['AP Calculus AB','AP Calculus BC','AP Physics 1: Algebra-Based','AP Computer Science A','AP Computer Science Principles','AP Statistics']},
  {id:'business', label:'Business / economics / finance', interests:['business','finance','economics','entrepreneurship','data'], priority:['AP Microeconomics','AP Macroeconomics','AP Statistics','AP Calculus AB','AP Computer Science Principles','AP English Language and Composition']},
  {id:'law', label:'Law / politics / international relations', interests:['law','policy','debate','history','global'], priority:['AP United States Government and Politics','AP Comparative Government and Politics','AP United States History','AP English Language and Composition','AP World History: Modern']},
  {id:'humanities', label:'Humanities / social science', interests:['history','culture','writing','research','psychology'], priority:['AP English Literature and Composition','AP World History: Modern','AP Psychology','AP Art History','AP Seminar']},
  {id:'arts', label:'Arts / design / architecture', interests:['arts','design','architecture','music'], priority:['AP 2-D Art and Design','AP Art History','AP Drawing','AP Music Theory','AP English Literature and Composition']}
];
const DEFAULT_PROFILE = {grade:9,gpa:'3.5-3.8',goal:'balanced',pathway:'balanced',stress:3,time:6,math:3,writing:3,science:3,reading:3,interests:[],weaknesses:[],completed:[]};

function useRoute(){
  const [route, setRoute] = useState(parseRoute());
  useEffect(()=>{ const h=()=>setRoute(parseRoute()); window.addEventListener('hashchange', h); return()=>window.removeEventListener('hashchange', h); }, []);
  return route;
}
function useLocalData(){
  const [books,setBooks] = useState(()=>appData('books', SEED_BOOKS));
  const [papers,setPapers] = useState(()=>appData('papers', SEED_PAPERS));
  const [parts,setParts] = useState(()=>appData('parts', SEED_PARTS));
  const [chapters,setChapters] = useState(()=>appData('chapters', SEED_CHAPTERS));
  const [clubs,setClubs] = useState(()=>appData('clubs', SEED_CLUBS));
  const [years,setYears] = useState(()=>appData('years', SEED_YEARS));
  const [backendStatus,setBackendStatus] = useState('Local data loaded');

  useEffect(()=>{
    let active = true;

    async function loadBackend(){
      if(!window.SSHUB_BACKEND){
        setBackendStatus('Backend bridge not found');
        return;
      }

      setBackendStatus('Connecting to Supabase…');

      const bookResult = window.SSHUB_BACKEND.loadBooks
        ? await window.SSHUB_BACKEND.loadBooks()
        : { ok:false, books:[], message:'Book loader not found' };

      const paperResult = window.SSHUB_BACKEND.loadPapers
        ? await window.SSHUB_BACKEND.loadPapers()
        : { ok:false, papers:[], message:'Paper loader not found' };

      if(!active) return;

      if(bookResult.ok && bookResult.books.length){
        setBooks(current => {
          const existing = new Set(current.map(b => b.id));
          const backendOnly = bookResult.books.filter(b => !existing.has(b.id));
          return [...backendOnly, ...current];
        });

        const newParts = bookResult.books.map(book => ({
          id: 'part_' + book.id,
          title: 'Full Book',
          partNumber: 1,
          bookId: book.id
        }));

        const newChapters = bookResult.books.map(book => ({
          id: 'ch_' + book.id,
          title: 'Uploaded Publication',
          chapterNumber: 1,
          bookId: book.id,
          partId: 'part_' + book.id
        }));

        setParts(current => {
          const existing = new Set(current.map(p => p.id));
          return [...newParts.filter(p => !existing.has(p.id)), ...current];
        });

        setChapters(current => {
          const existing = new Set(current.map(c => c.id));
          return [...newChapters.filter(c => !existing.has(c.id)), ...current];
        });
      }

      if(paperResult.ok && paperResult.papers.length){
        setPapers(current => {
          const existing = new Set(current.map(p => p.id));
          const backendOnly = paperResult.papers.filter(p => !existing.has(p.id));
          return [...backendOnly, ...current];
        });
      }

      setBackendStatus(
        `${bookResult.message || ''} ${paperResult.message || ''}`.trim()
      );
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
    setBooks: save('books',setBooks),
    setPapers: save('papers',setPapers),
    setParts: save('parts',setParts),
    setChapters: save('chapters',setChapters),
    setClubs: save('clubs',setClubs),
    setYears: save('years',setYears)
  };
}

   function useReadingList(){
  const [list,setList] = useState(()=>readJSON(STORAGE.readingList, []));
  const save = next => { setList(next); writeJSON(STORAGE.readingList, next); };
  const has = id => list.includes(id);
  const toggle = id => save(has(id) ? list.filter(x=>x!==id) : [...list, id]);
  return {list, has, toggle, clear:()=>save([])};
}
function usePdfObject(path){
  const [url,setUrl] = useState('');
  const [status,setStatus] = useState('ready');
  useEffect(()=>{
    let active = true; let obj = '';
    async function resolve(){
      if(!path){ setUrl(''); setStatus('missing'); return; }
      if(path.startsWith('idb:')){
        try { setStatus('loading'); const blob = await loadLocalPDF(path.replace('idb:','')); obj = URL.createObjectURL(blob); if(active){ setUrl(obj); setStatus('ready'); } }
        catch { if(active){ setStatus('missing'); setUrl(''); } }
      } else { setStatus('ready'); setUrl(pdfUrl(path)); }
    }
    resolve();
    return ()=>{ active=false; if(obj) URL.revokeObjectURL(obj); };
  }, [path]);
  return {url,status};
}

function TopBar({route, auth, onLogin, onLogout}){
  const nav = [
    ['home','Home'],
    ['research','Research Hub'],
    ['publications','Publications'],
    ['collaborations','Collaborations'],
    ['assistant','AI Assistant'],
    ['ap-resources','Advanced Placement Resources'],
    ['ap-decider','AP Decider'],
    ['reading-list','Reading List']
  ];

  const active = route.page;

  return <header className="topbar">
    <button className="brand" onClick={()=>go('home')} aria-label="Go home">
      <span className="brand-mark">A</span>
      <span><b>Student Support Hub</b><small>AMRC Academic Library</small></span>
    </button>

    <nav className="nav">
      {nav.map(([id,label]) =>
        <button
          key={id}
          className={(active===id || (id==='research' && ['paper','subjects'].includes(active)) || (id==='publications' && active==='book')) ? 'active' : ''}
          onClick={()=>go(id)}
        >
          {label}
        </button>
      )}
    </nav>

    <div className="nav-actions">
      {auth
        ? <button className="btn ghost small" onClick={onLogout}>Sign out</button>
        : <button className="btn ghost small" onClick={onLogin}>Admin sign in</button>
      }
    </div>
  </header>;
}

function Badge({children, tone=''}){ return <span className={`badge ${tone}`}>{children}</span>; }
function PageHeader({eyebrow,title,subtitle,children}){ return <section className="page-hero"><div className="container page-hero-inner"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p className="lead">{subtitle}</p>}</div>{children}</div></section>; }
function Stat({num,label}){ return <div className="stat"><b>{num}</b><span>{label}</span></div>; }
function SectionHead({kicker,title,subtitle,actions}){ return <div className="section-head"><div><p className="kicker">{kicker}</p><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{actions}</div>; }
function MetaLine({items}){ return <div className="meta-line">{items.filter(Boolean).map((x,i)=><span key={i}>{x}</span>)}</div>; }
function Empty({title='Nothing here yet.', text='Try changing the filters or search terms.'}){ return <div className="empty"><h3>{title}</h3><p>{text}</p></div>; }

function Home({data}){
  const {books,papers,chapters} = data;
  const featured = books.slice().sort((a,b)=>(b.publicationYear||0)-(a.publicationYear||0)).slice(0,3);
  const recent = papers.slice().sort((a,b)=>(b.year||0)-(a.year||0) || (b.num||0)-(a.num||0)).slice(0,5);
  const categories = uniq(papers.map(p=>p.category)).length;
  return <main>
    <section className="home-hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Badge tone="gold">Student academic platform</Badge>
          <h1>One polished hub for research, AP planning, and student academic growth.</h1>
          <p>Browse AMRC publications, open individual research papers, build a reading list, generate citations, compare AP courses, and create a smarter four-year AP plan.</p>
          <div className="hero-actions">
            <button className="btn primary" onClick={()=>go('research')}>Explore Research</button>
            <button className="btn dark" onClick={()=>go('ap-decider')}>Try AP Decider</button>
          </div>
        </div>
        <aside className="command-card">
          <div className="command-top"><span></span><span></span><span></span></div>
          <h3>Academic Command Center</h3>
          <div className="quick-search" onClick={()=>go('research')}>Search 200 papers, 4 publications, subjects, authors…</div>
          <div className="stat-grid">
            <Stat num={books.length} label="Publications" />
            <Stat num={papers.length} label="Research papers" />
            <Stat num={chapters.length} label="Sections" />
            <Stat num={categories} label="Subjects" />
          </div>
        </aside>
      </div>
    </section>

    <section className="container section">
      <SectionHead kicker="Platform modules" title="A cleaner structure, not a crowded PDF dump" subtitle="Each feature now has a proper place in the site architecture." />
      <div className="module-grid">
        <FeatureCard title="AMRC Research Hub" desc="Unified search, filters, subject collections, books, standalone papers, PDF tools, and academic layouts." action="Open library" page="research" />
        <FeatureCard title="Advanced Placement Resources" desc="AP course library by subject area, course fit cards, and a new comparison workspace." action="Browse APs" page="ap-resources" />
        <FeatureCard title="AP Decider" desc="A multi-factor algorithm that recommends APs and builds a four-year roadmap based on student profile." action="Build roadmap" page="ap-decider" />
        <FeatureCard title="Reading List" desc="Students can save research papers locally, continue later, and export their list." action="View saved papers" page="reading-list" />
        <FeatureCard title="Knowledge Assistant" desc="A controlled helper for research discovery, AP planning, partner resources, and opportunities using only site data." action="Ask assistant" page="assistant" />
      </div>
    </section>

    <section className="container section two-col">
      <div>
        <SectionHead kicker="Featured publications" title="Books now feel like publications" subtitle="Research is grouped by books, sections, and paper relationships so it feels intentional." />
        <div className="book-strip">{featured.map(b=><BookCard key={b.id} book={b} data={data} />)}</div>
      </div>
      <aside className="panel pad">
        <SectionHead kicker="Recently indexed" title="Latest papers" />
        <div className="compact-list">{recent.map(p=><button key={p.id} onClick={()=>go('paper',p.id)}><b>{p.title}</b><span>{p.authors}</span></button>)}</div>
      </aside>
    </section>
  </main>;
}
function FeatureCard({title,desc,action,page}){ return <article className="feature-card"><div className="feature-icon">{initials(title)}</div><h3>{title}</h3><p>{desc}</p><button className="link-btn" onClick={()=>go(page)}>{action} →</button></article>; }

function SearchControls({query,setQuery,filters,setFilters,options,sort,setSort,view,setView}){
  return <div className="search-shell">
    <div className="search-main"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, author, keyword, abstract, subject…" /></div>
    <div className="filter-row">
      <select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}><option value="all">All types</option><option value="book">Books</option><option value="paper">Papers</option><option value="partner">Partner resources</option></select>
      <select value={filters.source} onChange={e=>setFilters({...filters,source:e.target.value})}><option value="all">All sources</option>{options.sources.map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.subject} onChange={e=>setFilters({...filters,subject:e.target.value})}><option value="all">All subjects</option>{options.subjects.map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.author} onChange={e=>setFilters({...filters,author:e.target.value})}><option value="all">All authors</option>{options.authors.map(x=><option key={x}>{x}</option>)}</select>
      <select value={filters.year} onChange={e=>setFilters({...filters,year:e.target.value})}><option value="all">All years</option>{options.years.map(x=><option key={x}>{x}</option>)}</select>
      <select value={sort} onChange={e=>setSort(e.target.value)}><option value="relevance">Most relevant</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="az">A–Z</option><option value="paperNo">Paper number</option></select>
      <div className="segmented"><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>Grid</button><button className={view==='list'?'active':''} onClick={()=>setView('list')}>List</button></div>
    </div>
  </div>;
}
function useLibraryResults(data){
  const {books,papers} = data;
  const partnerResources = partnerData('resources', []);
  const [query,setQuery] = useState('');
  const [sort,setSort] = useState('relevance');
  const [view,setView] = useState('grid');
  const [filters,setFilters] = useState({type:'all',source:'all',subject:'all',author:'all',year:'all'});
  const options = useMemo(()=>({
    subjects: uniq([...papers.map(p=>p.category), ...partnerResources.map(r=>r.subject)]).sort(),
    sources: uniq(['AMRC Research Hub', ...partnerResources.map(r=>r.partnerName)]).sort(),
    authors: uniq(papers.flatMap(p=>String(p.authors||'').split(',').map(a=>a.trim()))).sort().slice(0,250),
    years: uniq([...papers.map(p=>String(p.year||'')), ...books.map(b=>String(b.publicationYear||'')), ...partnerResources.map(r=>String(r.year||''))]).sort((a,b)=>b-a)
  }), [papers,books,partnerResources]);
  const results = useMemo(()=>{
    const q = normalize(query);
    const bookItems = books.map(b=>({kind:'book',source:'AMRC Research Hub',id:b.id,title:b.title,authors:b.editors||'AMRC Editorial Team',year:b.publicationYear,subject:'Publication',description:b.description,search:`${b.title} ${b.editors} ${b.description} ${b.publicationYear}`}));
    const paperItems = papers.map(p=>({kind:'paper',source:'AMRC Research Hub',id:p.id,title:p.title,authors:p.authors,year:p.year,subject:p.category,description:p.abstract,keywords:p.keywords||[],num:p.num,search:`${p.title} ${p.authors} ${p.abstract} ${p.category} ${toText(p.keywords)} ${p.year}`}));
    const partnerItems = partnerResources.map(r=>({kind:'partner',source:r.partnerName,id:r.id,title:r.title,authors:r.partnerName,year:r.year,subject:r.subject,description:r.description,keywords:r.tags||[],url:r.url,search:`${r.title} ${r.partnerName} ${r.description} ${r.subject} ${toText(r.tags)} ${r.year}`}));
    let arr = [...bookItems,...paperItems,...partnerItems].filter(item=>{
      if(filters.type !== 'all' && item.kind !== filters.type) return false;
      if(filters.source !== 'all' && item.source !== filters.source) return false;
      if(filters.subject !== 'all' && item.subject !== filters.subject) return false;
      if(filters.year !== 'all' && String(item.year) !== filters.year) return false;
      if(filters.author !== 'all' && !normalize(item.authors).includes(normalize(filters.author))) return false;
      if(q && !normalize(item.search).includes(q)) return false;
      return true;
    });
    arr = arr.map(item=>({ ...item, score: q ? scoreItem(item,q) : 1 }));
    if(sort==='relevance') arr.sort((a,b)=>b.score-a.score || (b.year||0)-(a.year||0));
    if(sort==='newest') arr.sort((a,b)=>(b.year||0)-(a.year||0));
    if(sort==='oldest') arr.sort((a,b)=>(a.year||0)-(b.year||0));
    if(sort==='az') arr.sort((a,b)=>a.title.localeCompare(b.title));
    if(sort==='paperNo') arr.sort((a,b)=>(a.kind==='book'?9999:a.num||0)-(b.kind==='book'?9999:b.num||0));
    return arr;
  }, [books,papers,partnerResources,query,filters,sort]);
  return {query,setQuery,filters,setFilters,options,sort,setSort,view,setView,results};
}
function scoreItem(item,q){
  let score = 0; const s = normalize(item.search);
  if(normalize(item.title).includes(q)) score += 10;
  if(normalize(item.authors).includes(q)) score += 6;
  if(normalize(item.subject).includes(q)) score += 5;
  if(s.includes(q)) score += 2;
  return score;
}
function ResearchHub({data}){
  const lib = useLibraryResults(data);
  const subjectCount = uniq(data.papers.map(p=>p.category)).length;
  return <main>
    <PageHeader eyebrow="AMRC Research Hub" title="Search the full academic library" subtitle="A unified research interface for books, chapters, individual papers, authors, categories, and PDF access.">
      <div className="hero-stats"><Stat num={data.papers.length} label="Papers"/><Stat num={data.books.length} label="Books"/><Stat num={subjectCount} label="Subjects"/></div>
    </PageHeader>
    <section className="container section">
      <SearchControls {...lib} />
      <div className="result-summary"><b>{lib.results.length}</b> results · organized as books and papers</div>
      {lib.results.length ? <div className={lib.view==='grid'?'library-grid':'library-list'}>{lib.results.map(item=><LibraryItem key={item.kind+item.id} item={item} data={data} />)}</div> : <Empty title="No research matched." />}
    </section>
  </main>;
}
function LibraryItem({item,data}){
  if(item.kind==='book'){ const book=data.books.find(b=>b.id===item.id); return <BookCard book={book} data={data}/>; }
  if(item.kind==='partner') return <PartnerResourceCard resource={item}/>;
  const paper=data.papers.find(p=>p.id===item.id); return <PaperCard paper={paper} data={data}/>;
}
function BookCard({book,data}){
  const papers = data.papers.filter(p=>p.bookId===book.id);
  const club = data.clubs.find(c=>c.id===book.clubId);
  const pdf = getBookPdf(book);
  return <article className="book-card" onClick={()=>go('book',book.id)}>
    <div className="book-cover"><span>{book.publicationYear}</span><h3>{book.title}</h3><small>{club?.slug?.toUpperCase() || 'AMRC'} Publication</small></div>
    <div className="card-body"><MetaLine items={[`${papers.length} papers`, `${data.chapters.filter(c=>c.bookId===book.id).length} sections`, pdf?.pages ? `${pdf.pages} pages` : null]} />
    <p>{short(book.description,170)}</p></div>
  </article>;
}
function PaperCard({paper,data}){
  const book = data.books.find(b=>b.id===paper.bookId);
  return <article className="paper-card" onClick={()=>go('paper',paper.id)}>
    <div className="paper-kicker">{paper.num ? `Paper ${paper.num}` : 'Standalone'} · {paper.year}</div>
    <h3>{paper.title}</h3>
    <p className="authors">{paper.authors}</p>
    <p>{short(paper.abstract,150)}</p>
    <MetaLine items={[paper.category, book?.title ? `In ${short(book.title,42)}` : 'Individual paper']} />
  </article>;
}

function PartnerResourceCard({resource}){
  return <article className="partner-resource-card">
    <div className="paper-kicker">Partner resource · {resource.source || resource.partnerName || 'AMTech'}</div>
    <h3>{resource.title}</h3>
    <p>{short(resource.description,170)}</p>
    <MetaLine items={[resource.subject, resource.year, resource.url ? 'External website' : null]} />
    <div className="tag-row">{(resource.keywords||resource.tags||[]).slice(0,4).map(t=><span key={t}>{t}</span>)}</div>
    {resource.url && <a className="btn ghost small" href={resource.url} target="_blank" rel="noopener noreferrer">Open partner resource</a>}
  </article>;
}

function Publications({data}){
  return <main>
    <PageHeader eyebrow="Publications" title="Books, anthologies, and complete AMRC releases" subtitle="Each publication now has a dedicated book page with full-book PDF support and paper-level navigation." />
    <section className="container section">
      <div className="book-grid">{data.books.map(b=><BookCard key={b.id} book={b} data={data}/>)}</div>
    </section>
  </main>;
}
function Subjects({data}){
  const groups = useMemo(()=>uniq(data.papers.map(p=>p.category)).sort().map(subject=>({subject, papers:data.papers.filter(p=>p.category===subject)})), [data.papers]);
  return <main>
    <PageHeader eyebrow="Subject collections" title="Browse by academic area" subtitle="A clean way to explore related student research without losing the publication structure." />
    <section className="container section subject-grid">{groups.map(g=><article key={g.subject} className="subject-card"><h3>{g.subject}</h3><p>{g.papers.length} papers</p><div className="compact-list">{g.papers.slice(0,4).map(p=><button key={p.id} onClick={()=>go('paper',p.id)}><b>{p.title}</b><span>{p.authors}</span></button>)}</div><button className="btn ghost" onClick={()=>{go('research'); setTimeout(()=>{},0)}}>Explore subject</button></article>)}</section>
  </main>;
}

function BookView({id,data}){
  const book = data.books.find(b=>b.id===id);
  if(!book) return <NotFound />;
  const papers = data.papers.filter(p=>p.bookId===book.id).sort((a,b)=>(a.num||0)-(b.num||0));
  const chapters = data.chapters.filter(c=>c.bookId===book.id).sort((a,b)=>(a.chapterNumber||0)-(b.chapterNumber||0));
  const full = getBookPdf(book);
  const {url} = usePdfObject(full?.pdf);
  return <main>
    <PageHeader eyebrow="Book view" title={book.title} subtitle={book.description}>
      <div className="hero-stats"><Stat num={papers.length} label="Papers"/><Stat num={chapters.length} label="Sections"/><Stat num={full?.pages || '—'} label="Pages"/></div>
    </PageHeader>
    <section className="container detail-layout">
      <article className="main-col">
        {url && <div className="reader"><div className="reader-head"><h3>Full publication PDF</h3><div className="tools"><a className="btn ghost small" href={url} target="_blank">Open</a><a className="btn ghost small" href={url} download>Download</a><button className="btn ghost small" onClick={()=>copyText(url)}>Copy link</button></div></div><div className="pdf-frame"><object data={url} type="application/pdf"><iframe src={url}></iframe></object></div></div>}
        <SectionHead kicker="Table of contents" title="Papers inside this publication" subtitle="Use sections to keep the book organized instead of scattering research across unrelated pages." />
        {book.backend ? (
  <section className="chapter-block">
    <h3>01 · Uploaded papers</h3>
    <div className="paper-rows">
      {papers.length
        ? papers.map(p => <PaperRow key={p.id} paper={p} />)
        : <p className="muted">No papers have been linked to this backend book yet.</p>
      }
    </div>
  </section>
) : (
  chapters.map(ch => {
    const cps = papers.filter(p =>
      (p.partId === ch.partId && p.category === ch.title) || p.chapterId === ch.id
    );
    const fallback = papers.filter(p => p.category === ch.title);
    const rows = cps.length ? cps : fallback;

    return (
      <section key={ch.id} className="chapter-block">
        <h3>{String(ch.chapterNumber).padStart(2,'0')} · {ch.title}</h3>
        <div className="paper-rows">
          {rows.length
            ? rows.map(p => <PaperRow key={p.id} paper={p} />)
            : <p className="muted">No papers mapped to this section yet.</p>
          }
        </div>
      </section>
    );
  })
)}
      </article>
      <aside className="side-col"><div className="panel pad sticky"><h3>Publication details</h3><MetaLine items={[book.publicationYear, book.editors, full?.size ? formatBytes(full.size) : null]} /><p>{book.description}</p><button className="btn primary full" onClick={()=>go('research')}>Search all research</button></div></aside>
    </section>
  </main>;
}
function PaperRow({paper}){ return <button className="paper-row" onClick={()=>go('paper',paper.id)}><span>{paper.num || '—'}</span><div><b>{paper.title}</b><small>{paper.authors}</small></div><em>Open</em></button>; }

function CitationTools({paper,book}){
  const year = paper.year || new Date().getFullYear();
  const authors = paper.authors || 'Unknown Author';
  const apa = `${authors}. (${year}). ${paper.title}. ${book ? book.title + '. ' : ''}AMRC Research Hub.`;
  const mla = `${authors}. "${paper.title}." ${book ? book.title + ', ' : ''}AMRC Research Hub, ${year}.`;
  const chicago = `${authors}. "${paper.title}." In ${book ? book.title : 'AMRC Research Hub'}, ${year}.`;
  const [style,setStyle] = useState('APA');
  const val = style==='APA'?apa:style==='MLA'?mla:chicago;
  return <div className="citation-box"><div className="citation-top"><h3>Citation generator</h3><div className="segmented">{['APA','MLA','Chicago'].map(s=><button key={s} className={style===s?'active':''} onClick={()=>setStyle(s)}>{s}</button>)}</div></div><p>{val}</p><button className="btn ghost small" onClick={()=>copyText(val)}>Copy citation</button></div>;
}
function PaperView({id,data,reading}){
  const paper = data.papers.find(p=>p.id===id);
  if(!paper) return <NotFound />;
  const book = data.books.find(b=>b.id===paper.bookId);
  const related = data.papers.filter(p=>p.id!==paper.id && (p.category===paper.category || p.bookId===paper.bookId)).slice(0,5);
  const inBook = data.papers.filter(p=>p.bookId===paper.bookId).sort((a,b)=>(a.num||0)-(b.num||0));
  const idx = inBook.findIndex(p=>p.id===paper.id);
  const prev = idx>0 ? inBook[idx-1] : null;
  const next = idx>=0 && idx<inBook.length-1 ? inBook[idx+1] : null;
  const {url,status} = usePdfObject(paper.pdf);
  return <main>
    <PageHeader eyebrow={book ? 'Research paper inside publication' : 'Individual research paper'} title={paper.title} subtitle={paper.abstract}>
      <div className="hero-stats"><Stat num={paper.year || '—'} label="Year"/><Stat num={paper.num || '—'} label="Paper #"/><Stat num={related.length} label="Related"/></div>
    </PageHeader>
    <section className="container detail-layout">
      <article className="main-col">
        <div className="paper-meta-card"><h3>{paper.title}</h3><MetaLine items={[paper.authors, paper.category, book?.title]} /><div className="keyword-cloud">{(paper.keywords||[]).slice(0,12).map(k=><span key={k}>{k}</span>)}</div></div>
        <div className="reader"><div className="reader-head"><h3>PDF viewer</h3><div className="tools">{url && <><a className="btn ghost small" href={url} target="_blank">Open PDF</a><a className="btn ghost small" href={url} download>Download</a><button className="btn ghost small" onClick={()=>copyText(url)}>Copy link</button></>}<button className="btn primary small" onClick={()=>reading.toggle(paper.id)}>{reading.has(paper.id)?'Saved':'Save'}</button></div></div>{url ? <div className="pdf-frame"><object data={url} type="application/pdf"><iframe src={url}></iframe></object></div> : <div className="pdf-missing">PDF unavailable in this browser. Status: {status}</div>}</div>
        <div className="prev-next">{prev?<button onClick={()=>go('paper',prev.id)}>← Previous<br/><b>{short(prev.title,48)}</b></button>:<span></span>}{next?<button onClick={()=>go('paper',next.id)}>Next →<br/><b>{short(next.title,48)}</b></button>:<span></span>}</div>
      </article>
      <aside className="side-col"><div className="panel pad sticky"><h3>Academic tools</h3><CitationTools paper={paper} book={book}/><h3>Related papers</h3><div className="compact-list">{related.map(p=><button key={p.id} onClick={()=>go('paper',p.id)}><b>{p.title}</b><span>{p.authors}</span></button>)}</div></div></aside>
    </section>
  </main>;
}

function ReadingList({data,reading}){
  const saved = reading.list.map(id=>data.papers.find(p=>p.id===id)).filter(Boolean);
  const exportList = () => {
    const lines = saved.map(p=>`${p.title} — ${p.authors} (${p.year})`).join('\n');
    const blob = new Blob([lines], {type:'text/plain'}); const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='amrc-reading-list.txt'; a.click(); URL.revokeObjectURL(a.href);
  };
  return <main>
    <PageHeader eyebrow="Reading list" title="Saved papers" subtitle="A local browser reading list for students who want to continue research later." />
    <section className="container section">{saved.length ? <><div className="toolbar"><button className="btn ghost" onClick={exportList}>Export list</button><button className="btn ghost" onClick={reading.clear}>Clear list</button></div><div className="library-grid">{saved.map(p=><PaperCard key={p.id} paper={p} data={data}/>)}</div></> : <Empty title="No saved papers yet." text="Open any paper and press Save to add it here." />}</section>
  </main>;
}


const ASSISTANT_STARTER = [];
const STOPWORDS = new Set('the a an and or but if then with without for from into onto about above below between under over to of in on at by as is are was were be been being it this that these those i me my we our you your he she they them what which who where when why how can could should would do does did give show find tell explain compare recommend plan take throughout high school throughout'.split(' '));
const SYNONYMS = {
  medicine:['medicine','medical','health','biology','psychology','chemistry','doctor','pre-med','health science'],
  stem:['stem','engineering','computer science','technology','physics','calculus','math','data'],
  law:['law','politics','policy','government','debate','international relations','global'],
  business:['business','economics','finance','entrepreneurship','statistics','data'],
  humanities:['history','writing','culture','literature','research','social science'],
  arts:['art','design','music','drawing','architecture','portfolio']
};
function tokenizeQuestion(text){
  return normalize(text).replace(/[^a-z0-9\s:-]/g,' ').split(/\s+/).map(t=>t.trim()).filter(t=>t && !STOPWORDS.has(t) && t.length>1);
}
function expandedTokens(text){
  const base = new Set(tokenizeQuestion(text));
  const lower = normalize(text);
  Object.entries(SYNONYMS).forEach(([key, vals])=>{ if(vals.some(v=>lower.includes(v))) vals.forEach(v=>tokenizeQuestion(v).forEach(t=>base.add(t))); if(lower.includes(key)) vals.forEach(v=>tokenizeQuestion(v).forEach(t=>base.add(t))); });
  return [...base];
}
function buildKnowledgeBase(data){
  const partnerResources = partnerData('resources', []);
  const opportunities = partnerData('opportunities', []);
  const partners = partnerData('partners', []);
  const bookDocs = data.books.map(book=>({
    id:`book:${book.id}`, type:'Book', title:book.title, year:book.publicationYear, source:'AMRC Research Hub', url:`#/book/${book.id}`,
    text:`${book.title} ${book.description} ${book.editors} ${book.publicationYear} AMRC publication book anthology`,
    summary:`${book.title} is an AMRC publication from ${book.publicationYear || 'an unknown year'} edited by ${book.editors || 'the AMRC team'}. ${book.description || ''}`,
    action:()=>go('book', book.id)
  }));
  const paperDocs = data.papers.map(paper=>{
    const book = data.books.find(b=>b.id===paper.bookId);
    return { id:`paper:${paper.id}`, type:'Research paper', title:paper.title, year:paper.year, source:'AMRC Research Hub', url:`#/paper/${paper.id}`,
      text:`${paper.title} ${paper.authors} ${paper.abstract} ${paper.category} ${toText(paper.keywords)} ${book?.title || ''} paper research article`,
      summary:`${paper.title} by ${paper.authors || 'unknown author(s)'}${paper.year ? ` (${paper.year})` : ''}. Subject: ${paper.category || 'Uncategorized'}. ${short(paper.abstract, 260)}`,
      action:()=>go('paper', paper.id)
    };
  });
  const apDocs = AP_COURSES.map(course=>({
    id:`ap:${course.name}`, type:'AP course', title:course.name, year:'', source:'Advanced Placement Resources', url:'#/ap-resources',
    text:`${course.name} ${course.area} ${course.summary} ${toText(course.interests)} ${toText(course.pathways)} difficulty ${course.difficulty} workload ${course.workload}`,
    summary:`${course.name}: ${course.summary} Difficulty ${course.difficulty}/5, workload ${course.workload}/5, usually suited for grades ${course.grades.join(', ')}.`,
    action:()=>go('ap-resources')
  }));
  const partnerDocs = partnerResources.map(resource=>({
    id:`partner:${resource.id}`, type:'Partner resource', title:resource.title, year:resource.year, source:resource.partnerName || 'Partner', url:resource.url,
    text:`${resource.title} ${resource.description} ${resource.subject} ${resource.type} ${toText(resource.tags)} ${resource.partnerName}`,
    summary:`${resource.title} from ${resource.partnerName || 'a partner'}: ${resource.description}`,
    external: true
  }));
  const opportunityDocs = opportunities.map(opp=>({
    id:`opportunity:${opp.id}`, type:'Opportunity', title:opp.title, year:'', source:opp.partnerName || 'Partner', url:opp.url,
    text:`${opp.title} ${opp.description} ${opp.type} ${opp.audience} ${opp.timeline} ${opp.partnerName} opportunity competition project`,
    summary:`${opp.title}: ${opp.description} Audience: ${opp.audience || 'students'}. Timeline: ${opp.timeline || 'not specified'}.`,
    external: true
  }));
  const partnerDocs2 = partners.map(partner=>({
    id:`partner-profile:${partner.id}`, type:'Partner profile', title:partner.name, year:'', source:'Collaborations', url:partner.website || '#/collaborations',
    text:`${partner.name} ${partner.description} ${toText(partner.focusAreas)} partner collaboration website`,
    summary:`${partner.name} is listed as ${partner.status || 'a partner'}. ${partner.description}`,
    external: !!partner.website
  }));
  const subjects = uniq(data.papers.map(p=>p.category)).map(subject=>{
    const count = data.papers.filter(p=>p.category===subject).length;
    return { id:`subject:${subject}`, type:'Subject', title:subject, source:'AMRC Research Hub', url:'#/subjects',
      text:`${subject} subject category research papers ${data.papers.filter(p=>p.category===subject).slice(0,12).map(p=>p.title).join(' ')}`,
      summary:`${subject} has ${count} research paper${count===1?'':'s'} in the AMRC library.`, action:()=>go('subjects') };
  });
  return [...paperDocs, ...bookDocs, ...apDocs, ...partnerDocs, ...opportunityDocs, ...partnerDocs2, ...subjects];
}
function scoreKnowledgeDoc(doc, question){
  const tokens = expandedTokens(question);
  const text = normalize(`${doc.title} ${doc.type} ${doc.source} ${doc.text}`);
  const title = normalize(doc.title);
  let score = 0;
  const q = normalize(question);
  if(title.includes(q) && q.length>3) score += 20;
  tokens.forEach(t=>{ if(title.includes(t)) score += 7; if(text.includes(t)) score += 3; });
  if(/paper|research|article|pdf|citation|author/i.test(question) && doc.type==='Research paper') score += 5;
  if(/book|publication|anthology|chapter/i.test(question) && doc.type==='Book') score += 6;
  if(/ap|advanced placement|course|class|schedule|roadmap|plan/i.test(question) && doc.type==='AP course') score += 8;
  if(/partner|amtech|collaboration|stem|technology/i.test(question) && /Partner/.test(doc.type)) score += 6;
  if(/opportunit|competition|program|project|internship/i.test(question) && doc.type==='Opportunity') score += 8;
  return score;
}
function findKnowledge(question, data, limit=6){
  return buildKnowledgeBase(data).map(doc=>({...doc, score:scoreKnowledgeDoc(doc, question)})).filter(doc=>doc.score>0).sort((a,b)=>b.score-a.score || String(a.title).localeCompare(String(b.title))).slice(0, limit);
}
function guessAssistantProfile(question){
  const q = normalize(question);
  const profile = {...DEFAULT_PROFILE, grade: q.match(/grade\s*(9|10|11|12)|\b(9th|10th|11th|12th)\b/) ? Number((q.match(/grade\s*(9|10|11|12)/)||[])[1] || (q.includes('12th')?12:q.includes('11th')?11:q.includes('10th')?10:9)) : 9, interests:[], weaknesses:[], completed:[]};
  const pathway = Object.entries(SYNONYMS).find(([key, vals])=> vals.some(v=>q.includes(v)) || q.includes(key));
  if(pathway) profile.pathway = pathway[0] === 'stem' ? 'stem' : pathway[0];
  if(q.includes('computer') || q.includes('coding') || q.includes('engineering')) profile.pathway='stem';
  if(q.includes('doctor') || q.includes('medical') || q.includes('health')) profile.pathway='medicine';
  if(q.includes('business') || q.includes('finance') || q.includes('economics')) profile.pathway='business';
  if(q.includes('law') || q.includes('politic') || q.includes('international')) profile.pathway='law';
  Object.values(SYNONYMS).flat().forEach(v=>{ if(q.includes(v)) profile.interests.push(v); });
  if(q.includes('stress')) profile.stress = q.includes('low') ? 2 : q.includes('high') ? 5 : 3;
  if(q.includes('weak math') || q.includes('bad at math')) profile.weaknesses.push('math');
  if(q.includes('weak writing') || q.includes('bad at writing')) profile.weaknesses.push('writing');
  return profile;
}
function summarizeAPAnswer(question){
  if(!/\bap\b|advanced placement|course|classes|roadmap|four-year|4-year|schedule/i.test(question)) return null;
  const profile = guessAssistantProfile(question);
  const plan = generateAPPlan(profile);
  const courses = plan.plan.flatMap(y=>y.courses).slice(0,8);
  if(!courses.length) return null;
  const lines = plan.plan.map(y=>`Grade ${y.grade}: ${y.courses.length ? y.courses.map(c=>c.name).join(', ') : 'No APs recommended from these settings.'}`).join('\n');
  return {
    text:`Based only on the AP course data inside Student Support Hub, here is a suggested ${profile.pathway} AP direction. Workload risk: ${plan.risk}.\n\n${lines}\n\nBest first moves: ${courses.slice(0,3).map(c=>c.name).join(', ')}. Use the full AP Decider for a more precise plan with grade, GPA, stress tolerance, and completed APs.`,
    sources:courses.slice(0,5).map(c=>({id:`ap:${c.name}`, title:c.name, type:'AP course', source:'Advanced Placement Resources', url:'#/ap-resources'}))
  };
}
function generateAssistantAnswer(question, data){
  const trimmed = question.trim();
  if(!trimmed) return {text:'Ask me about AMRC research, books, AP courses, AP planning, AMTech partner resources, opportunities, or how to use the site.', sources:[]};
  const lower = normalize(trimmed);
  if(/what can you do|help|how does this work|who are you/i.test(trimmed)){
    return {text:'I am a grounded site assistant. I can search the AMRC paper/book metadata, explain AP course fit, suggest an AP roadmap using the built-in AP Decider logic, surface AMTech partner resources, and point to opportunities. I do not browse the web or invent answers outside the site knowledge base.', sources:[{id:'site',title:'Student Support Hub local knowledge base',type:'Site data',source:'Student Support Hub'}]};
  }
  const apAnswer = summarizeAPAnswer(trimmed);
  const matches = findKnowledge(trimmed, data, 7);
  if(apAnswer && matches.length < 3) return apAnswer;
  if(!matches.length){
    return {text:'I could not find that in the Student Support Hub knowledge base. Try asking about a paper title, subject, author, AP course, AMTech, partner resources, or opportunities already stored in the site.', sources:[]};
  }
  const grouped = matches.slice(0,5).map((m,i)=>`${i+1}. ${m.summary}`).join('\n');
  const sourceNote = matches.some(m=>m.external) ? 'Some results are partner/external links stored inside the site metadata.' : 'All results come from Student Support Hub local data.';
  const apExtra = apAnswer ? `\n\nAP planning note:\n${apAnswer.text}` : '';
  return {text:`I found these grounded results from the site knowledge base:\n\n${grouped}\n\n${sourceNote}${apExtra}`, sources:[...matches.slice(0,5), ...(apAnswer?.sources||[])].slice(0,8)};
}
function AssistantSource({source}){
  const isHash = source.url && source.url.startsWith('#/');
  const content = <><b>{source.title}</b><span>{source.type} · {source.source}</span></>;
  if(source.action) return <button className="assistant-source" onClick={source.action}>{content}</button>;
  if(isHash) return <button className="assistant-source" onClick={()=>{ location.hash = source.url; }}>{content}</button>;
  if(source.url) return <a className="assistant-source" href={source.url} target="_blank" rel="noopener noreferrer">{content}</a>;
  return <div className="assistant-source">{content}</div>;
}
function KnowledgeAssistant({data,reading}){
  const [messages,setMessages] = useState(()=>readJSON(STORAGE.assistant, ASSISTANT_STARTER));
  const [input,setInput] = useState('');
  const [mode,setMode] = useState('Auto');
  const examples = ['Which papers discuss technology or scientific revolutions?','Build me an AP plan for medicine starting in grade 10.','What AMTech resources connect to computer science?','Show opportunities for STEM students.','Find books or papers about international relations.'];
  function save(next){ setMessages(next); writeJSON(STORAGE.assistant, next.slice(-24)); }
  function ask(text=input){
    const question = text.trim(); if(!question) return;
    const answer = generateAssistantAnswer(mode==='Auto' ? question : `${mode}: ${question}`, data);
    save([...messages, {role:'user', text:question, mode}, {role:'assistant', text:answer.text, sources:answer.sources || []}]);
    setInput('');
  }
  function clear(){ save(ASSISTANT_STARTER); }
  return <main>
    <PageHeader eyebrow="Knowledge Assistant" title="Student Support Hub Assistant" subtitle="Ask targeted questions about the research library, AP planning, partners, opportunities, and site resources. The assistant only uses information stored inside this website.">
      <div className="hero-stats"><Stat num={data.papers.length} label="Papers indexed"/><Stat num={AP_COURSES.length} label="AP courses"/><Stat num={partnerData('resources', []).length} label="Partner resources"/></div>
    </PageHeader>
    <section className="container section assistant-layout">
      <article className="assistant-chat panel">
        <div className="assistant-toolbar"><div><Badge tone="gold">Site data only</Badge><h2>Ask a focused question</h2></div><div className="tools"><select value={mode} onChange={e=>setMode(e.target.value)}><option>Auto</option><option>Research</option><option>AP Planning</option><option>Partner Resources</option><option>Opportunities</option></select><button className="btn ghost small" onClick={clear}>Clear</button></div></div>
        <div className="message-list">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><div className="bubble"><p>{m.text}</p>{m.sources?.length>0 && <div className="assistant-sources"><small>Sources used</small>{m.sources.map((s,idx)=><AssistantSource key={(s.id||s.title)+idx} source={s}/>)}</div>}</div></div>)}</div>
        <div className="assistant-input"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && (e.metaKey || e.ctrlKey)){ ask(); } }} placeholder="Ask about research, AP plans, AMTech, opportunities, or site content…"/><button className="btn primary" onClick={()=>ask()}>Ask</button></div>
      </article>
      <aside className="assistant-side panel pad sticky">
        <h2>Try these</h2>
        <div className="prompt-list">{examples.map(ex=><button key={ex} onClick={()=>ask(ex)}>{ex}</button>)}</div>
        <div className="notice"><b>Source rule:</b> Answers are limited to the research, AP, partner, and opportunity data already included in the site.</div>
        <h3>Knowledge base</h3>
        <ul className="knowledge-list"><li>{data.books.length} AMRC publications</li><li>{data.papers.length} research papers</li><li>{AP_COURSES.length} AP course profiles</li><li>{partnerData('resources', []).length} partner resources</li><li>{partnerData('opportunities', []).length} opportunities</li></ul>
      </aside>
    </section>
  </main>;
}


function Collaborations(){
  const partners = partnerData('partners', []);
  const resources = partnerData('resources', []);
  const opportunities = partnerData('opportunities', []);
  const [source,setSource] = useState('All');
  const [type,setType] = useState('All');
  const visibleResources = resources.filter(r=>(source==='All'||r.partnerId===source) && (type==='All'||r.type===type));
  const partnerOptions = partners.map(p=>p.id);
  const types = uniq(resources.map(r=>r.type)).sort();
  return <main>
    <PageHeader eyebrow="Collaborations" title="Partner network" subtitle="A structured partner system for external educational websites, shared resources, STEM opportunities, and AP pathway support. AMTech is included as a standard partner entry rather than a homepage promotion.">
      <div className="hero-stats"><Stat num={partners.length} label="Partners"/><Stat num={resources.length} label="Partner resources"/><Stat num={opportunities.length} label="Opportunities"/></div>
    </PageHeader>
    <section className="container section">
      <SectionHead kicker="Partners" title="Approved partner list" subtitle="Partners can be added here without redesigning the website. Each partner can power resources, opportunities, and AP recommendations." />
      <div className="partner-grid">{partners.map(p=><article className="partner-card" key={p.id}>
        <div className="partner-logo">{p.logoText || initials(p.name)}</div>
        <div><Badge tone="gold">{p.status || 'Partner'}</Badge><h3>{p.name}</h3><p>{p.description}</p><div className="tag-row">{(p.focusAreas||[]).map(t=><span key={t}>{t}</span>)}</div>{p.website && <a className="btn ghost small" href={p.website} target="_blank" rel="noopener noreferrer">Visit website</a>}</div>
      </article>)}</div>
    </section>
    <section className="container section">
      <SectionHead kicker="Shared resources" title="Partner resources directory" subtitle="These resources are separated from AMRC research but can still appear in the Research Hub through the Source filter." />
      <div className="partner-toolbar"><select value={source} onChange={e=>setSource(e.target.value)}><option value="All">All partners</option>{partnerOptions.map(id=>{ const p=partners.find(x=>x.id===id); return <option key={id} value={id}>{p?.name || id}</option>;})}</select><select value={type} onChange={e=>setType(e.target.value)}><option value="All">All resource types</option>{types.map(t=><option key={t}>{t}</option>)}</select><button className="btn primary" onClick={()=>go('research')}>Search with research</button></div>
      <div className="resource-grid">{visibleResources.map(r=><PartnerResourceCard key={r.id} resource={{...r,source:r.partnerName,authors:r.partnerName,year:r.year,subject:r.subject,keywords:r.tags}} />)}</div>
    </section>
    <section className="container section">
      <SectionHead kicker="Student opportunities" title="Opportunity board" subtitle="A scalable board for competitions, STEM events, student projects, research openings, and partner-led opportunities." />
      <div className="opportunity-grid">{opportunities.map(o=><article className="opportunity-card" key={o.id}><Badge>{o.partnerName}</Badge><h3>{o.title}</h3><p>{o.description}</p><MetaLine items={[o.type,o.audience,o.timeline]} />{o.url && <a className="link-btn" href={o.url} target="_blank" rel="noopener noreferrer">Open opportunity →</a>}</article>)}</div>
    </section>
  </main>;
}

function APResources(){
  const [area,setArea] = useState('All');
  const [compare,setCompare] = useState(['AP Biology','AP Chemistry','AP Statistics']);
  const visible = AP_COURSES.filter(c=>area==='All' || c.area===area);
  const chosen = compare.map(n=>AP_COURSES.find(c=>c.name===n)).filter(Boolean);
  const setSlot = (i,value)=>setCompare(compare.map((x,idx)=>idx===i?value:x));
  return <main>
    <PageHeader eyebrow="Advanced Placement Resources" title="Plan AP courses with clarity" subtitle="Browse AP subjects, understand fit, compare workload, and connect choices to future academic pathways." />
    <section className="container section">
      <div className="ap-dashboard">
        <div className="panel pad"><SectionHead kicker="Course library" title="AP subjects by area" subtitle="Course list aligns with College Board AP subject categories, with local planning ratings added for the hub." actions={<button className="btn primary" onClick={()=>go('ap-decider')}>Open AP Decider</button>} />
          <div className="area-tabs"><button className={area==='All'?'active':''} onClick={()=>setArea('All')}>All</button>{AP_AREAS.map(a=><button key={a} className={area===a?'active':''} onClick={()=>setArea(a)}>{a}</button>)}</div>
          <div className="course-grid">{visible.map(c=><CourseCard key={c.name} course={c}/>)}</div>
        </div>
        <aside className="panel pad sticky"><h2>AP comparison tool</h2><p className="muted">Compare up to three courses side by side before building a plan.</p>{[0,1,2].map(i=><select key={i} value={compare[i]} onChange={e=>setSlot(i,e.target.value)}>{AP_COURSES.map(c=><option key={c.name}>{c.name}</option>)}</select>)}<div className="compare-stack">{chosen.map(c=><div className="compare-card" key={c.name}><b>{c.name}</b><span>{c.area}</span><meter min="1" max="5" value={c.difficulty}></meter><small>Difficulty {c.difficulty}/5 · Workload {c.workload}/5</small><p>{c.summary}</p></div>)}</div><RecommendedPartnerResources courses={chosen} compact={true}/></aside>
      </div>
    </section>
  </main>;
}
function CourseCard({course}){ return <article className="course-card"><div className="course-top"><Badge>{course.area}</Badge>{course.emerging && <Badge tone="gold">Emerging</Badge>}</div><h3>{course.name}</h3><p>{course.summary}</p><MetaLine items={[`Difficulty ${course.difficulty}/5`, `Workload ${course.workload}/5`, `Grades ${course.grades.join(', ')}`]} /><div className="skill-bars"><Skill label="Writing" value={course.writing}/><Skill label="Math" value={course.math}/><Skill label="Memory" value={course.memorization}/></div></article>; }
function Skill({label,value}){ return <div className="skill"><span>{label}</span><i><b style={{width:`${value*20}%`}}></b></i></div>; }


function RecommendedPartnerResources({courses=[], profile=null, compact=false}){
  const resources = partnerData('resources', []);
  const signals = new Set();
  courses.forEach(c=>{ (c.interests||[]).forEach(x=>signals.add(x)); (c.pathways||[]).forEach(x=>signals.add(x)); signals.add(c.area); });
  (profile?.interests||[]).forEach(x=>signals.add(x));
  if(profile?.pathway) signals.add(profile.pathway);
  const matches = resources.map(r=>{
    const tags = [r.subject, r.type, ...(r.tags||[])].map(x=>normalize(x));
    const score = [...signals].reduce((n,s)=> n + (tags.some(t=>t.includes(normalize(s)) || normalize(s).includes(t)) ? 1 : 0), 0);
    return {...r, score};
  }).filter(r=>r.score>0 || /stem|technology|computer|engineering|ap/i.test(`${r.subject} ${toText(r.tags)}`)).sort((a,b)=>b.score-a.score).slice(0, compact?2:4);
  if(!matches.length) return null;
  return <div className="partner-recommendations"><h3>Recommended partner resources</h3><p className="muted">Because of the selected AP interests, these partner resources may be useful next steps.</p><div className="compact-list">{matches.map(r=><a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"><b>{r.title}</b><span>{r.partnerName} · {r.subject}</span></a>)}</div></div>;
}

function scoreCourse(course, profile){
  let score = 0;
  const pathway = PATHWAYS.find(p=>p.id===profile.pathway) || PATHWAYS[0];
  if(course.emerging) score -= 3;
  if(course.grades.includes(Number(profile.grade))) score += 4;
  if(course.grades.some(g=>g>Number(profile.grade))) score += 2;
  course.interests.forEach(i=>{ if(profile.interests.includes(i) || pathway.interests.includes(i)) score += 3; });
  if(course.pathways.includes(profile.pathway)) score += 5;
  if(pathway.priority.includes(course.name)) score += 6;
  if(profile.completed.includes(course.name)) score -= 100;
  if(profile.weaknesses.includes('math') && course.math>=4) score -= 5;
  if(profile.weaknesses.includes('writing') && course.writing>=4) score -= 4;
  if(profile.weaknesses.includes('memorization') && course.memorization>=4) score -= 3;
  if(course.math > Number(profile.math)) score -= (course.math-Number(profile.math))*4;
  if(course.writing > Number(profile.writing)) score -= (course.writing-Number(profile.writing))*3;
  if(course.difficulty > Number(profile.stress)+2) score -= 3;
  if(course.workload > Math.ceil(Number(profile.time)/2)+1) score -= 2;
  return score;
}
function generateAPPlan(profile){
  const loadCap = profile.goal==='elite' ? 5 : profile.goal==='ambitious' ? 4 : profile.goal==='balanced' ? 3 : 2;
  const ranked = AP_COURSES.filter(c=>!c.emerging).map(c=>({...c,score:scoreCourse(c,profile)})).sort((a,b)=>b.score-a.score);
  const plan = [];
  const used = new Set(profile.completed);
  for(let grade=Number(profile.grade); grade<=12; grade++){
    const cap = Math.max(1, Math.min(loadCap, grade===9 ? 2 : grade===10 ? loadCap : loadCap+1));
    const courses = ranked.filter(c=>!used.has(c.name) && c.grades.includes(grade) && c.score>-5).slice(0, cap);
    courses.forEach(c=>used.add(c.name));
    plan.push({grade,courses});
  }
  const avoided = ranked.filter(c=>!used.has(c.name) && (c.math>Number(profile.math)+1 || c.writing>Number(profile.writing)+1 || c.difficulty>Number(profile.stress)+2)).slice(0,5);
  const total = plan.reduce((n,y)=>n+y.courses.length,0);
  const avg = total ? plan.flatMap(y=>y.courses).reduce((n,c)=>n+c.difficulty,0)/total : 0;
  const risk = avg>=4.3 || total>=12 ? 'High' : avg>=3.6 || total>=8 ? 'Moderate' : 'Controlled';
  return {plan, avoided, risk, total};
}
function APDecider(){
  const [profile,setProfile] = useState(DEFAULT_PROFILE);
  const [result,setResult] = useState(()=>generateAPPlan(DEFAULT_PROFILE));
  const interests = uniq(AP_COURSES.flatMap(c=>c.interests)).sort();
  const toggle = (field,value)=>setProfile(p=>({...p,[field]:p[field].includes(value)?p[field].filter(x=>x!==value):[...p[field],value]}));
  const update = patch=>setProfile(p=>({...p,...patch}));
  return <main>
    <PageHeader eyebrow="AP Decider v2" title="Build a smarter four-year AP roadmap" subtitle="The algorithm balances grade level, pathway, strengths, weak points, workload, stress tolerance, and AP readiness." />
    <section className="container section ap-decider-grid">
      <div className="panel pad">
        <SectionHead kicker="Student profile" title="Tell the Decider what kind of plan you need" />
        <div className="form-grid">
          <Field label="Current grade"><select value={profile.grade} onChange={e=>update({grade:e.target.value})}>{[9,10,11,12].map(g=><option key={g}>{g}</option>)}</select></Field>
          <Field label="GPA range"><select value={profile.gpa} onChange={e=>update({gpa:e.target.value})}><option>3.0-3.4</option><option>3.5-3.8</option><option>3.9-4.0+</option></select></Field>
          <Field label="Plan intensity"><select value={profile.goal} onChange={e=>update({goal:e.target.value})}><option value="protected">Protected / low stress</option><option value="balanced">Balanced</option><option value="ambitious">Ambitious</option><option value="elite">Elite rigor</option></select></Field>
          <Field label="Pathway"><select value={profile.pathway} onChange={e=>update({pathway:e.target.value})}>{PATHWAYS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
          <Field label="Stress tolerance"><input type="range" min="1" max="5" value={profile.stress} onChange={e=>update({stress:e.target.value})}/></Field>
          <Field label="Weekly AP study hours"><input type="range" min="2" max="14" value={profile.time} onChange={e=>update({time:e.target.value})}/><small>{profile.time} hours/week</small></Field>
          <Field label="Math readiness"><input type="range" min="1" max="5" value={profile.math} onChange={e=>update({math:e.target.value})}/></Field>
          <Field label="Writing readiness"><input type="range" min="1" max="5" value={profile.writing} onChange={e=>update({writing:e.target.value})}/></Field>
        </div>
        <h3>Interests</h3><div className="choice-cloud">{interests.map(i=><button key={i} type="button" className={profile.interests.includes(i)?'choice active':'choice'} onClick={()=>toggle('interests',i)}>{i}</button>)}</div>
        <h3>Areas to protect</h3><div className="choice-cloud">{['math','writing','memorization','heavy reading','lab science'].map(i=><button key={i} type="button" className={profile.weaknesses.includes(i)?'choice active':'choice'} onClick={()=>toggle('weaknesses',i)}>{i}</button>)}</div>
        <h3>Already completed/current APs</h3><div className="choice-cloud scroll">{AP_COURSES.filter(c=>!c.emerging).map(c=><button key={c.name} type="button" className={profile.completed.includes(c.name)?'choice active':'choice'} onClick={()=>toggle('completed',c.name)}>{c.name.replace('AP ','')}</button>)}</div>
        <button className="btn primary" onClick={()=>setResult(generateAPPlan(profile))}>Generate updated plan</button>
      </div>
      <aside className="panel pad sticky"><h2>Recommendation</h2><div className={`risk ${result.risk.toLowerCase()}`}>{result.risk} workload risk</div><p className="muted">{result.total} recommended APs across the remaining high school timeline.</p><div className="timeline">{result.plan.map(y=><div className="year-plan" key={y.grade}><b>Grade {y.grade}</b>{y.courses.length?y.courses.map(c=><div className="mini-plan" key={c.name}><span>{c.name}</span><small>{c.area} · difficulty {c.difficulty}/5</small></div>):<small>No APs recommended from current settings.</small>}</div>)}</div>{result.avoided.length>0 && <><h3>APs to avoid for now</h3><ul className="avoid-list">{result.avoided.map(c=><li key={c.name}>{c.name}</li>)}</ul></>}<RecommendedPartnerResources courses={result.plan.flatMap(y=>y.courses)} profile={profile}/></aside>
    </section>
  </main>;
}
function Field({label,children}){ return <label className="field"><span>{label}</span>{children}</label>; }

function Admin({data,auth,onLogin}){
  const [msg,setMsg] = useState('');
  const [book,setBook] = useState({title:'',editors:'',description:'',publicationYear:new Date().getFullYear(),clubId:data.clubs[0]?.id,academicYearId:data.years[0]?.id,sections:'Introduction'});
  const [paper,setPaper] = useState({title:'',authors:'',abstract:'',keywords:'',category:'',year:new Date().getFullYear(),bookId:'',clubId:data.clubs[0]?.id,academicYearId:data.years[0]?.id});
  const [bookFile,setBookFile] = useState(null); const [paperFile,setPaperFile] = useState(null);
  async function addBook(e){ e.preventDefault(); const id='book_'+Date.now(); let pdf=''; if(bookFile) pdf=await saveLocalPDF(bookFile,'book'); const newBook={...book,id,pdf,publicationYear:Number(book.publicationYear),size:bookFile?.size||0,pages:0,papers:0}; const newParts=[...data.parts,{id:'part_'+id,title:'Full Book',partNumber:1,bookId:id}]; const newChapters=book.sections.split('\n').filter(Boolean).map((title,i)=>({id:`ch_${id}_${i}`,title,chapterNumber:i+1,bookId:id,partId:'part_'+id})); data.setBooks([...data.books,newBook]); data.setParts(newParts); data.setChapters([...data.chapters,...newChapters]); setMsg('Publication saved locally.'); }
  async function addPaper(e){ e.preventDefault(); let pdf=''; if(paperFile) pdf=await saveLocalPDF(paperFile,'paper'); const newPaper={...paper,id:'paper_'+Date.now(),num:data.papers.length+1,year:Number(paper.year),keywords:paper.keywords.split(',').map(x=>x.trim()).filter(Boolean),pdf}; data.setPapers([...data.papers,newPaper]); setMsg('Paper saved locally.'); }
  const exportMeta = () => { const blob = new Blob([JSON.stringify({books:data.books,papers:data.papers,parts:data.parts,chapters:data.chapters,partners:partnerData('partners', []),partnerResources:partnerData('resources', []),opportunities:partnerData('opportunities', [])}, null, 2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='amrc-metadata-export.json'; a.click(); URL.revokeObjectURL(a.href); };
  if(!auth) return <main><PageHeader eyebrow="Management Portal" title="Admin access required" subtitle="Sign in to manage publication metadata and local prototype uploads."/><section className="container section"><button className="btn primary" onClick={onLogin}>Sign in</button></section></main>;
  return <main><PageHeader eyebrow="Management Portal" title="Research operations dashboard" subtitle="Prototype tools for adding publications, uploading individual papers, and exporting metadata."/><section className="container section"><div className="ops-grid"><Stat num={data.books.length} label="Publications"/><Stat num={data.papers.length} label="Papers"/><Stat num={uniq(data.papers.map(p=>p.category)).length} label="Subjects"/><Stat num={data.papers.filter(p=>!p.pdf).length} label="Missing PDFs"/></div>{msg&&<div className="notice success">{msg}</div>}<div className="admin-grid"><form className="panel pad" onSubmit={addBook}><h2>Add publication</h2><Field label="Title"><input value={book.title} onChange={e=>setBook({...book,title:e.target.value})}/></Field><Field label="Editors"><input value={book.editors} onChange={e=>setBook({...book,editors:e.target.value})}/></Field><Field label="Description"><textarea value={book.description} onChange={e=>setBook({...book,description:e.target.value})}/></Field><Field label="Sections, one per line"><textarea value={book.sections} onChange={e=>setBook({...book,sections:e.target.value})}/></Field><Field label="PDF"><input type="file" accept="application/pdf" onChange={e=>setBookFile(e.target.files[0])}/></Field><button className="btn primary">Save publication</button></form><form className="panel pad" onSubmit={addPaper}><h2>Add paper</h2><Field label="Title"><input value={paper.title} onChange={e=>setPaper({...paper,title:e.target.value})}/></Field><Field label="Authors"><input value={paper.authors} onChange={e=>setPaper({...paper,authors:e.target.value})}/></Field><Field label="Abstract"><textarea value={paper.abstract} onChange={e=>setPaper({...paper,abstract:e.target.value})}/></Field><Field label="Category"><input value={paper.category} onChange={e=>setPaper({...paper,category:e.target.value})}/></Field><Field label="Book"><select value={paper.bookId} onChange={e=>setPaper({...paper,bookId:e.target.value})}><option value="">Standalone</option>{data.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></Field><Field label="Keywords"><input value={paper.keywords} onChange={e=>setPaper({...paper,keywords:e.target.value})}/></Field><Field label="PDF"><input type="file" accept="application/pdf" onChange={e=>setPaperFile(e.target.files[0])}/></Field><button className="btn primary">Save paper</button></form></div><div className="panel pad"><h2>Data operations</h2><button className="btn ghost" onClick={exportMeta}>Export metadata JSON</button></div></section></main>;
}
function LoginModal({onClose,onSuccess}){
  const [name,setName]=useState('admin'); const [password,setPassword]=useState(''); const [err,setErr]=useState('');
  function submit(e){ e.preventDefault(); const u=USERS[name]; if(u && u.password===password){ onSuccess({username:name,...u}); } else setErr('Invalid username or password.'); }
  return <div className="modal-back"><form className="modal" onSubmit={submit}><h2>Admin sign in</h2><Field label="Username"><input value={name} onChange={e=>setName(e.target.value)}/></Field><Field label="Password"><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></Field>{err&&<p className="error">{err}</p>}<div className="toolbar"><button className="btn primary">Sign in</button><button type="button" className="btn ghost" onClick={onClose}>Cancel</button></div></form></div>;
}
function NotFound(){ return <main className="container section"><Empty title="Page not found." text="The requested record does not exist in this release." /></main>; }
function Footer(){ return <footer className="footer"><div className="container"><div><b>Student Support Hub</b><span>AMRC Research Hub · AP Resources · Collaborations · Academic planning</span></div><div>Netlify-ready static release · Knowledge assistant · PDFs included</div></div></footer>; }

function App(){
  const route = useRoute();
  const data = useLocalData();
  const reading = useReadingList();
  const [auth,setAuth] = useState(()=>readJSON(STORAGE.auth, null));
  const [loginOpen,setLoginOpen] = useState(false);
  const onLoginSuccess = user => { setAuth(user); writeJSON(STORAGE.auth, user); setLoginOpen(false); };
  const onLogout = () => { setAuth(null); localStorage.removeItem(STORAGE.auth); };
  let page = null;
  if(route.page==='home') page=<Home data={data}/>;
  if(route.page==='research') page=<ResearchHub data={data}/>;
  if(route.page==='publications') page=<Publications data={data}/>;
  if(route.page==='subjects') page=<Subjects data={data}/>;
  if(route.page==='collaborations') page=<Collaborations/>;
  if(route.page==='assistant') page=<KnowledgeAssistant data={data} reading={reading}/>;
  if(route.page==='book') page=<BookView id={route.id} data={data}/>;
  if(route.page==='paper') page=<PaperView id={route.id} data={data} reading={reading}/>;
  if(route.page==='ap-resources') page=<APResources/>;
  if(route.page==='ap-decider') page=<APDecider/>;
  if(route.page==='reading-list') page=<ReadingList data={data} reading={reading}/>;
  if(route.page==='admin') page=<Admin data={data} auth={auth} onLogin={()=>setLoginOpen(true)}/>;
  return <><TopBar route={route} auth={auth} onLogin={()=>setLoginOpen(true)} onLogout={onLogout}/>{page || <NotFound/>}<Footer/>{loginOpen&&<LoginModal onClose={()=>setLoginOpen(false)} onSuccess={onLoginSuccess}/>}</>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
