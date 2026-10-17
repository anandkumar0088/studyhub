// assets/js/catalog.js
// Handles fetching, caching, and querying the structured resource catalog.

const StudyHubCatalog = {
  _resources: null,
  _loadingPromise: null,

  async init(basePath = '') {
    if (this._resources) return this._resources;
    if (this._loadingPromise) return this._loadingPromise;

    this._loadingPromise = (async () => {
      try {
        // Resolve path whether running from root, articles/, or a GitHub Pages subfolder
        const possiblePaths = [
          `${basePath}data/resources.json`,
          './data/resources.json',
          '../data/resources.json',
          '/data/resources.json'
        ];

        let response = null;
        for (const p of possiblePaths) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              response = res;
              break;
            }
          } catch (err) {}
        }

        if (!response) {
          throw new Error('Failed to load resources.json from candidate paths.');
        }

        const data = await response.json();
        this._resources = Array.isArray(data) ? data : [];
        return this._resources;
      } catch (e) {
        console.error('Catalog initialization failed:', e);
        this._resources = [];
        return [];
      }
    })();

    return this._loadingPromise;
  },

  getAll() {
    return this._resources || [];
  },

  getById(id) {
    if (!this._resources) return null;
    return this._resources.find(r => r.id === id || r.slug === id) || null;
  },

  getByClass(classNumber) {
    const num = parseInt(classNumber, 10);
    return this.getAll().filter(r => Array.isArray(r.classes) && r.classes.includes(num));
  },

  getByExam(examName) {
    if (!examName) return [];
    const normalized = examName.toLowerCase().trim();
    return this.getAll().filter(r => 
      Array.isArray(r.exams) && r.exams.some(e => e.toLowerCase() === normalized || e.toLowerCase().includes(normalized))
    );
  },

  getBySubject(subjectName) {
    if (!subjectName) return [];
    const normalized = subjectName.toLowerCase().trim();
    return this.getAll().filter(r => 
      Array.isArray(r.subjects) && r.subjects.some(s => s.toLowerCase() === normalized || s.toLowerCase().includes(normalized))
    );
  },

  getByResourceType(type) {
    if (!type) return [];
    const normalized = type.toLowerCase().trim();
    return this.getAll().filter(r => (r.resourceType || '').toLowerCase() === normalized);
  },

  getFeatured(limit = 6) {
    // Curated high-utility items
    const featuredIds = [
      'ncert-class10-science-textbook',
      'ncert-class12-physics-part1-part2',
      'nta-neet-ug-pyq-archive',
      'nta-jee-main-previous-papers-archive',
      'cbse-class10-science-sqp-2025',
      'upsc-civil-services-prelims-pyq'
    ];
    const items = featuredIds.map(id => this.getById(id)).filter(Boolean);
    if (items.length < limit) {
      const rest = this.getAll().filter(r => !featuredIds.includes(r.id));
      return [...items, ...rest.slice(0, limit - items.length)];
    }
    return items.slice(0, limit);
  },

  getRecent(limit = 6) {
    // Sorted by publishedDate / lastVerifiedDate descending
    return [...this.getAll()]
      .sort((a, b) => new Date(b.lastVerifiedDate || b.publishedDate || 0) - new Date(a.lastVerifiedDate || a.publishedDate || 0))
      .slice(0, limit);
  },

  getStats() {
    const all = this.getAll();
    const subjects = new Set();
    const exams = new Set();
    const sources = new Set();

    all.forEach(r => {
      (r.subjects || []).forEach(s => subjects.add(s));
      (r.exams || []).forEach(e => exams.add(e));
      if (r.sourceName) sources.add(r.sourceName);
    });

    return {
      totalResources: all.length,
      totalSubjects: subjects.size,
      totalExams: exams.size,
      totalSources: sources.size
    };
  }
};
