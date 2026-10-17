# StudyHub — Educational Resource Discovery Platform

StudyHub is an editorial-style, lightweight, and open educational resource discovery platform tailored for Indian students across Classes 1–12, CBSE, ICSE, state boards, NEET, JEE Main, JEE Advanced, CUET, UPSC, SSC, Banking, and Railway examinations.

Students can search, filter, discover, bookmark, plan, and open verified study notes, textbooks, previous-year question papers (PYQs), sample papers, and chapter summaries directly from their official statutory sources (NCERT, CBSE Academic, NTA, UPSC, CISCE, and state education boards).

---

## Key Features & Highlights

- **100% Frontend & Zero-Backend Architecture**: No database, no user tracking, no authentication, no required paid APIs. Suitable for free static hosting.
- **Client-Side Discovery Engine**: Instant search with tokenization, weighted multi-field relevance scoring (title, subject, exams, classes, chapters, topics, tags), facet filtering, and URL query persistence.
- **Authentic Statutory Index**: Over 50+ curated official resources linked directly to statutory bodies (NCERT, CBSE Academic, NTA, UPSC, DIKSHA, ePathshala, CISCE).
- **Interactive Student Utilities (Saved in LocalStorage)**:
  - **Bookmarks & History**: Save resources for quick access with JSON and CSV export capabilities.
  - **Study Planner**: Add daily/weekly study targets with deadlines and priority badges, calculating real-time completion progress.
  - **Revision Checklist**: Interactive chapter tracker (Not Started → In Progress → Completed) with live curriculum coverage progress bars.
  - **Focus Study Timer**: Monotonic timestamp Pomodoro timer (`Date.now()` arithmetic immune to background browser tab throttling) with synthesized Web Audio harmonic chimes.
  - **Resource Comparator**: Side-by-side metadata comparisons of up to 3 selected resources.
- **Editorial Publishing Hub**: 10 comprehensive, original study guides and exam preparation articles featuring reading-time estimates, sticky tables of contents, and Schema.org `Article` structured data.
- **Professional Editorial Design System**: Warm neutral surfaces (`#fbfaf8`), near-black typography (`#181b1f`), deep navy (`#0f2942`) and muted blue (`#2d5075`), with subtle amber highlights (`#d97706`). Full support for system and manual dark mode preferences.
- **Technical SEO & Accessibility**: Semantic HTML5, WCAG AA contrast compliance, keyboard shortcuts (`/` or `Ctrl+K`), XML sitemaps, robots.txt, Open Graph cards, and Web App manifest.

---

## Directory Structure

```
studyhub/
├── index.html                   # Content-rich homepage with search & quick links
├── search.html                  # Advanced discovery engine with sidebar filters
├── classes.html                 # Class 1–12 curriculum hub
├── exams.html                   # Competitive examinations directory
├── subjects.html                # 13-discipline subject index
├── papers.html                  # Previous Year & Sample Question Papers hub
├── saved.html                   # Bookmarks manager & recent history
├── planner.html                 # Interactive study target planner
├── revision.html                # Chapter-level revision checklist
├── timer.html                   # Focus study timer (Pomodoro)
├── compare.html                 # Resource comparison tool
├── about.html                   # Independent project disclosure & mission
├── contact.html                 # Validated mailto & clipboard contact form
├── disclaimer.html              # Statutory disclaimers & non-affiliation notices
├── privacy.html                 # Transparent client-side privacy policy
├── terms.html                   # Terms of use
├── copyright.html               # DMCA and copyright attribution report guide
├── 404.html                     # Custom 404 error page
├── sitemap.xml                  # Full XML sitemap of all published routes
├── robots.txt                   # Production crawler configuration
├── site.webmanifest             # Progressive web app manifest
├── favicon.svg                  # Vector brand favicon
├── package.json                 # Scripts and metadata
│
├── articles/                    # Editorial Guides
│   ├── index.html               # Searchable article repository
│   ├── effective-study-notes.html
│   ├── class-10-board-preparation.html
│   ├── neet-biology-revision.html
│   ├── jee-main-physics-routine.html
│   ├── revising-ncert-textbooks.html
│   ├── using-previous-year-papers.html
│   ├── active-recall-spaced-repetition.html
│   ├── realistic-study-timetable.html
│   ├── finding-reliable-study-materials.html
│   └── common-exam-mistakes.html
│
├── assets/
│   ├── css/
│   │   └── style.css            # Complete design system & responsive styling
│   ├── js/
│   │   ├── storage.js           # Safe LocalStorage wrapper
│   │   ├── catalog.js           # Catalog loader & query functions
│   │   ├── search.js            # Discovery search & filtering engine
│   │   ├── ui.js                # Navigation, drawer, theme, card renderer
│   │   ├── planner.js           # Study planner logic
│   │   ├── checklist.js         # Revision checklist logic
│   │   ├── timer.js             # Monotonic Pomodoro focus timer
│   │   ├── compare.js           # Resource comparison table renderer
│   │   └── contact.js           # Form validation & mailto/clipboard generator
│   └── icons/
│       ├── logo.svg             # Primary geometric shield & beacon logo
│       ├── favicon-32x32.png    # Standard favicon
│       ├── apple-touch-icon.png # iOS touch icon
│       ├── icon-192.png         # PWA icon (192px)
│       └── icon-512.png         # PWA icon (512px)
│
├── data/
│   ├── resources.json           # 59 authentic curated educational resources
│   ├── articles.json            # Metadata for 10 educational articles
│   └── checklists.json          # Chapter syllabi for revision trackers
│
└── scripts/
    ├── validate.js              # Comprehensive automated validation test suite
    └── generate-icons.js        # PNG asset generator script
```

---

## Getting Started Locally

Because StudyHub is built entirely with standard web technologies and zero external runtime dependencies, you can run it with any static web server.

### Option 1: Using the Built-in Node Server

```bash
# 1. Clone the repository
git clone https://github.com/your-username/studyhub.git
cd studyhub

# 2. Start the local server
npm start
# (Runs on http://localhost:3000/)
```

### Option 2: Using Python

```bash
# Python 3
python -m http.server 3000
```

### Option 3: Using VS Code Live Server
Simply right-click on `index.html` in VS Code and select **"Open with Live Server"**.

---

## Validation & Quality Assurance

StudyHub includes a strict automated validation script that verifies catalog integrity, schema conformance, route existence, meta tags, and sitemap entries.

Run the test suite:
```bash
npm test
# or
node scripts/validate.js
```

The script runs **160 automated tests** checking:
1. Integrity of `data/resources.json`, `data/articles.json`, and `data/checklists.json`.
2. Exact schema compliance for all 19 required resource attributes (`id, slug, title, description, classes, exams, subjects, chapters, board, resourceType, language, sourceName, sourceUrl, licenseType, priceStatus, publishedDate, lastVerifiedDate, verificationStatus, tags`).
3. Correctness of `<title>`, meta descriptions, headers, footers, and canonical URLs on all 28 HTML pages.
4. Article body content, breadcrumbs, and Schema.org `Article` JSON-LD structured data.
5. Sitemaps, robots.txt, web manifest, and image assets.

---

## How to Edit & Extend the Resource Catalog

### Adding a Resource (`data/resources.json`)

To add a new verified educational resource, append an entry to `data/resources.json` adhering to this schema:

```json
{
  "id": "res-cbse-10-maths-sqp-2025",
  "slug": "cbse-class-10-mathematics-standard-sample-paper-2025",
  "title": "CBSE Class 10 Mathematics Standard Sample Question Paper 2024-25",
  "description": "Official CBSE sample question paper and marking scheme for Class 10 Board Examinations.",
  "classes": [10],
  "exams": ["CBSE Board"],
  "subjects": ["Mathematics"],
  "chapters": ["Full Syllabus"],
  "board": "CBSE",
  "resourceType": "Sample Question Paper",
  "language": "English",
  "sourceName": "CBSE Academic",
  "sourceUrl": "https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html",
  "licenseType": "Official Public Portal",
  "priceStatus": "Free",
  "publishedDate": "2024-09-01",
  "lastVerifiedDate": "2025-01-15",
  "verificationStatus": "Official Verified",
  "tags": ["CBSE", "Class 10", "Maths", "Sample Paper", "Marking Scheme"]
}
```

> **Important**: Always verify destinations prior to labeling any entry as `"Official Verified"`. Do not rehost copyrighted third-party PDFs; always link directly to the official statutory portal.

---

## Free Static Deployment Guide

StudyHub uses relative paths (`./` and `../`) throughout the application, guaranteeing zero path breakage whether hosted at an apex domain (`https://studyhub.org/`) or within a repository subpath (e.g. `https://username.github.io/studyhub/`).

### Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial release of StudyHub"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`.
   - Click **Save**.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Deploying to Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - Framework preset: `None`
   - Build command: *(leave empty or `npm test`)*
   - Build output directory: `/` (root)
5. Click **Save and Deploy**.

### Deploying to Vercel / Netlify

- **Root directory**: `./`
- **Output directory**: `./`
- **No build command required.**

---

## Configuring a Custom Domain & Canonical URL

If you deploy to a custom domain (e.g., `https://studyhub.org`):
1. In `robots.txt`, update the `Sitemap` directive:
   ```
   Sitemap: https://studyhub.org/sitemap.xml
   ```
2. In `sitemap.xml`, update the domain prefix in the `<loc>` tags from `https://studyhub.org/` to your custom production domain if needed.

---

## License & Attribution

- **Codebase & Architecture**: MIT License.
- **Third-Party Trademarks & Official Portals**: All logos, examination names (CBSE, NCERT, NTA, NEET, JEE, CUET, UPSC), and portal links belong to their respective statutory governing bodies. StudyHub is an independent, non-commercial directory and does not claim ownership or endorsement.
