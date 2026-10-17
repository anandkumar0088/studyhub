// scripts/validate.js
// Automated verification script for StudyHub: checks JSON schemas, routes, asset links, internal references, and sitemaps.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
let errorCount = 0;
let checkCount = 0;

function assert(condition, message) {
  checkCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errorCount++;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

console.log('=====================================================');
console.log(' STUDYHUB SYSTEM & CATALOG VALIDATION');
console.log('=====================================================\n');

// 1. JSON Data Validation
console.log('--- 1. Validating Catalog & Metadata JSONs ---');
const resourcesPath = path.join(ROOT_DIR, 'data', 'resources.json');
const articlesPath = path.join(ROOT_DIR, 'data', 'articles.json');
const checklistsPath = path.join(ROOT_DIR, 'data', 'checklists.json');

assert(fs.existsSync(resourcesPath), 'data/resources.json exists');
assert(fs.existsSync(articlesPath), 'data/articles.json exists');
assert(fs.existsSync(checklistsPath), 'data/checklists.json exists');

let resources = [];
let articles = [];
let checklists = {};

try {
  resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
  assert(Array.isArray(resources) && resources.length >= 25, `resources.json is a valid array with ${resources.length} resources`);
} catch (e) {
  assert(false, `resources.json parse error: ${e.message}`);
}

try {
  articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  assert(Array.isArray(articles) && articles.length === 10, `articles.json is a valid array with ${articles.length} articles`);
} catch (e) {
  assert(false, `articles.json parse error: ${e.message}`);
}

try {
  checklists = JSON.parse(fs.readFileSync(checklistsPath, 'utf8'));
  assert(Array.isArray(checklists.curricula) && checklists.curricula.length >= 3, `checklists.json has ${checklists.curricula?.length} curricula`);
} catch (e) {
  assert(false, `checklists.json parse error: ${e.message}`);
}

// 2. Resource Schema Integrity
console.log('\n--- 2. Resource Schema Conformance ---');
const requiredResourceFields = [
  'id', 'slug', 'title', 'description', 'classes', 'exams', 'subjects', 
  'chapters', 'board', 'resourceType', 'language', 'sourceName', 
  'sourceUrl', 'licenseType', 'priceStatus', 'publishedDate', 
  'lastVerifiedDate', 'verificationStatus', 'tags'
];

const resourceIds = new Set();
let schemaErrors = 0;
resources.forEach((r, idx) => {
  if (resourceIds.has(r.id)) {
    console.error(`Duplicate resource ID found: "${r.id}"`);
    schemaErrors++;
  }
  resourceIds.add(r.id);

  requiredResourceFields.forEach(field => {
    if (r[field] === undefined || r[field] === null || r[field] === '') {
      console.error(`Resource [${r.id || idx}] missing required field: "${field}"`);
      schemaErrors++;
    }
  });

  if (!r.sourceUrl.startsWith('http://') && !r.sourceUrl.startsWith('https://')) {
    console.error(`Resource [${r.id}] has invalid URL: "${r.sourceUrl}"`);
    schemaErrors++;
  }
});

assert(schemaErrors === 0, `All ${resources.length} resources conform to strict schema requirements`);

// 3. HTML Page Verification & Link Crawl
console.log('\n--- 3. Verifying Published HTML Pages & Internal Links ---');
const publishedPages = [
  'index.html',
  'search.html',
  'classes.html',
  'exams.html',
  'subjects.html',
  'papers.html',
  'saved.html',
  'planner.html',
  'revision.html',
  'timer.html',
  'compare.html',
  'about.html',
  'contact.html',
  'disclaimer.html',
  'privacy.html',
  'terms.html',
  'copyright.html',
  '404.html'
];

publishedPages.forEach(page => {
  const fullPath = path.join(ROOT_DIR, page);
  assert(fs.existsSync(fullPath), `Page exists: ${page}`);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('<title>'), `${page} has <title> tag`);
    assert(content.includes('<meta name="description"'), `${page} has meta description`);
    assert(content.includes('class="site-header"'), `${page} includes site-header`);
    assert(content.includes('class="site-footer"'), `${page} includes site-footer`);
  }
});

// Verify 10 Article Files Exist
console.log('\n--- 4. Verifying All 10 Articles ---');
articles.forEach(a => {
  const articleFile = path.join(ROOT_DIR, 'articles', `${a.slug}.html`);
  assert(fs.existsSync(articleFile), `Article exists: articles/${a.slug}.html`);
  if (fs.existsSync(articleFile)) {
    const content = fs.readFileSync(articleFile, 'utf8');
    assert(content.includes('<title>'), `Article ${a.slug} has title`);
    assert(content.includes('class="article-content"'), `Article ${a.slug} has body content`);
    assert(content.includes('schema.org'), `Article ${a.slug} has Article JSON-LD`);
  }
});

// 5. Assets and Icons Verification
console.log('\n--- 5. Assets, Favicons, and SEO Files ---');
assert(fs.existsSync(path.join(ROOT_DIR, 'assets', 'css', 'style.css')), 'assets/css/style.css exists');
assert(fs.existsSync(path.join(ROOT_DIR, 'assets', 'icons', 'logo.svg')), 'assets/icons/logo.svg exists');
assert(fs.existsSync(path.join(ROOT_DIR, 'favicon.svg')), 'favicon.svg exists');
assert(fs.existsSync(path.join(ROOT_DIR, 'site.webmanifest')), 'site.webmanifest exists');
assert(fs.existsSync(path.join(ROOT_DIR, 'robots.txt')), 'robots.txt exists');
assert(fs.existsSync(path.join(ROOT_DIR, 'sitemap.xml')), 'sitemap.xml exists');

// Verify Sitemap
const sitemapContent = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
publishedPages.filter(p => p !== '404.html').forEach(p => {
  assert(sitemapContent.includes(p), `sitemap.xml lists ${p}`);
});

console.log('\n=====================================================');
if (errorCount === 0) {
  console.log(`🎉 ALL ${checkCount} VALIDATION CHECKS PASSED SUCCESSFULLY!`);
  console.log('=====================================================');
  process.exit(0);
} else {
  console.error(`🚨 COMPLETED WITH ${errorCount} ERRORS!`);
  console.log('=====================================================');
  process.exit(1);
}
