// assets/js/search.js
// Client-side search engine with relevance scoring, multi-facet filtering, URL synchronization, and keyboard-accessible suggestions.

const StudyHubSearch = {
  STOP_WORDS: new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with']),

  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0 && !this.STOP_WORDS.has(w));
  },

  search(resources, query = '', filters = {}, sortBy = 'relevance') {
    if (!Array.isArray(resources)) return [];

    const rawQuery = (query || '').trim();
    const queryLower = rawQuery.toLowerCase();
    const tokens = this.tokenize(rawQuery);

    let results = [];

    // 1. Scoring & Matching
    if (!rawQuery) {
      // If no query, all resources start with baseline score
      results = resources.map(r => ({ resource: r, score: 1 }));
    } else {
      // Extract numeric class hints if present (e.g. "class 10", "12th")
      const classMatch = rawQuery.match(/(?:class|grade|standard|std)\s*(\d{1,2})|(\d{1,2})(?:th|st|nd|rd)\b/i);
      const queryClassNum = classMatch ? parseInt(classMatch[1] || classMatch[2], 10) : null;

      resources.forEach(item => {
        let score = 0;
        const titleLower = (item.title || '').toLowerCase();
        const descLower = (item.description || '').toLowerCase();
        const sourceLower = (item.sourceName || '').toLowerCase();
        const typeLower = (item.resourceType || '').toLowerCase();
        const subjectsLower = (item.subjects || []).map(s => s.toLowerCase());
        const examsLower = (item.exams || []).map(e => e.toLowerCase());
        const chaptersLower = (item.chapters || []).map(c => c.toLowerCase());
        const tagsLower = (item.tags || []).map(t => t.toLowerCase());

        // Exact phrase boost
        if (titleLower === queryLower) score += 120;
        else if (titleLower.includes(queryLower)) score += 60;

        // Class number matching
        if (queryClassNum && Array.isArray(item.classes) && item.classes.includes(queryClassNum)) {
          score += 45;
        }

        // Exam matching
        for (const exam of examsLower) {
          if (queryLower.includes(exam) || exam.includes(queryLower)) {
            score += 40;
            break;
          }
        }

        // Subject matching
        for (const subj of subjectsLower) {
          if (queryLower.includes(subj) || subj.includes(queryLower)) {
            score += 35;
            break;
          }
        }

        // Token-level scoring
        let matchedTokensCount = 0;
        tokens.forEach(token => {
          let tokenMatched = false;

          if (titleLower.includes(token)) {
            score += 25;
            tokenMatched = true;
          }
          if (subjectsLower.some(s => s.includes(token))) {
            score += 20;
            tokenMatched = true;
          }
          if (examsLower.some(e => e.includes(token))) {
            score += 20;
            tokenMatched = true;
          }
          if (typeLower.includes(token)) {
            score += 15;
            tokenMatched = true;
          }
          if (chaptersLower.some(c => c.includes(token))) {
            score += 15;
            tokenMatched = true;
          }
          if (sourceLower.includes(token)) {
            score += 12;
            tokenMatched = true;
          }
          if (tagsLower.some(t => t.includes(token))) {
            score += 10;
            tokenMatched = true;
          }
          if (descLower.includes(token)) {
            score += 6;
            tokenMatched = true;
          }

          if (tokenMatched) matchedTokensCount++;
        });

        // Completeness bonus: all tokens matched
        if (tokens.length > 1 && matchedTokensCount === tokens.length) {
          score += 30;
        }

        if (score > 0) {
          results.push({ resource: item, score });
        }
      });
    }

    // 2. Filter Application
    let filtered = results.filter(({ resource: r }) => {
      // Class filter
      if (filters.classes && filters.classes.length > 0) {
        const itemClasses = r.classes || [];
        const hasMatchingClass = filters.classes.some(c => itemClasses.includes(parseInt(c, 10)));
        if (!hasMatchingClass) return false;
      }

      // Exam filter
      if (filters.exams && filters.exams.length > 0) {
        const itemExams = (r.exams || []).map(e => e.toLowerCase());
        const hasMatchingExam = filters.exams.some(e => itemExams.includes(e.toLowerCase()));
        if (!hasMatchingExam) return false;
      }

      // Subject filter
      if (filters.subjects && filters.subjects.length > 0) {
        const itemSubjects = (r.subjects || []).map(s => s.toLowerCase());
        const hasMatchingSubject = filters.subjects.some(s => itemSubjects.includes(s.toLowerCase()));
        if (!hasMatchingSubject) return false;
      }

      // Resource Type filter
      if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        const itemType = (r.resourceType || '').toLowerCase();
        const hasMatchingType = filters.resourceTypes.some(t => itemType === t.toLowerCase());
        if (!hasMatchingType) return false;
      }

      // Board filter
      if (filters.boards && filters.boards.length > 0) {
        const itemBoard = (r.board || '').toLowerCase();
        const hasMatchingBoard = filters.boards.some(b => b.toLowerCase() === 'all' || itemBoard === b.toLowerCase());
        if (!hasMatchingBoard) return false;
      }

      // Language filter
      if (filters.languages && filters.languages.length > 0) {
        const itemLang = (r.language || '').toLowerCase();
        const hasMatchingLang = filters.languages.some(l => itemLang === l.toLowerCase() || itemLang === 'bilingual');
        if (!hasMatchingLang) return false;
      }

      return true;
    });

    // 3. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.resource.lastVerifiedDate || a.resource.publishedDate || 0);
        const dateB = new Date(b.resource.lastVerifiedDate || b.resource.publishedDate || 0);
        return dateB - dateA;
      }
      if (sortBy === 'title-asc') {
        return (a.resource.title || '').localeCompare(b.resource.title || '');
      }
      if (sortBy === 'title-desc') {
        return (b.resource.title || '').localeCompare(a.resource.title || '');
      }
      // Default: relevance
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.resource.title || '').localeCompare(b.resource.title || '');
    });

    return filtered.map(item => item.resource);
  },

  getSuggestions(resources, query = '', limit = 6) {
    if (!query || query.trim().length < 2 || !Array.isArray(resources)) return [];
    const qLower = query.trim().toLowerCase();
    const suggestions = [];
    const seen = new Set();

    // 1. Direct Title Matches
    for (const r of resources) {
      if (r.title && r.title.toLowerCase().includes(qLower)) {
        if (!seen.has(r.title)) {
          seen.add(r.title);
          suggestions.push({
            type: 'Resource',
            label: r.title,
            meta: `${(r.subjects || []).join(', ')} • ${r.resourceType || 'Resource'}`,
            url: `search.html?q=${encodeURIComponent(r.title)}`
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    // 2. Subject Matches
    for (const r of resources) {
      for (const subj of (r.subjects || [])) {
        if (subj.toLowerCase().includes(qLower) && !seen.has(subj)) {
          seen.add(subj);
          suggestions.push({
            type: 'Subject',
            label: subj,
            meta: 'Subject Resources',
            url: `search.html?subject=${encodeURIComponent(subj)}`
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    // 3. Exam Matches
    for (const r of resources) {
      for (const exam of (r.exams || [])) {
        if (exam.toLowerCase().includes(qLower) && !seen.has(exam)) {
          seen.add(exam);
          suggestions.push({
            type: 'Examination',
            label: exam,
            meta: 'Competitive Examination',
            url: `search.html?exam=${encodeURIComponent(exam)}`
          });
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    return suggestions;
  },

  // Parse URL search parameters into query + filters state
  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      classes: params.getAll('class').filter(Boolean),
      exams: params.getAll('exam').filter(Boolean),
      subjects: params.getAll('subject').filter(Boolean),
      resourceTypes: params.getAll('type').filter(Boolean),
      boards: params.getAll('board').filter(Boolean),
      languages: params.getAll('lang').filter(Boolean),
      sort: params.get('sort') || 'relevance'
    };
  },

  // Sync state to URL without reloading page
  syncUrlParams(state, replace = false) {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.classes) state.classes.forEach(c => params.append('class', c));
    if (state.exams) state.exams.forEach(e => params.append('exam', e));
    if (state.subjects) state.subjects.forEach(s => params.append('subject', s));
    if (state.resourceTypes) state.resourceTypes.forEach(t => params.append('type', t));
    if (state.boards) state.boards.forEach(b => params.append('board', b));
    if (state.languages) state.languages.forEach(l => params.append('lang', l));
    if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort);

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
    
    if (replace) {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }
  }
};
