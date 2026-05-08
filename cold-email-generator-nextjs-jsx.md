# 🚀 Project Prompt: Cold Email Generator — Next.js App (JSX)

## What We Are Building

A **Cold Email Generator** — a clean, production-ready Next.js web application where a user describes their product and target audience, and the app uses the **gemini AI API** to instantly generate personalized cold emails with subject lines and opening lines.

Full workflow:
```
Describe product → Generate emails → Preview variations → Improve/iterate → Upload CSV for bulk
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | **JavaScript (JSX only — no TypeScript)** |
| Styling | **Tailwind CSS** |
| AI | **gemini API** |
| CSV Parsing | **PapaParse** |
| API Routes | Next.js **Route Handlers** (`/app/api/...`) |
| Env Vars | `.env.local` for API key |
| Font | Google Fonts via `next/font` |

> **No TypeScript. No `.tsx` files. Use `.jsx` for all components and `.js` for all non-component files.**

> **Key architecture decision:** LLM API calls are made from **Next.js API Route Handlers** — NOT directly from the browser. This keeps the API key safe on the server side.

---

## Project Setup

```bash
npx create-next-app@latest cold-email-generator \
  --javascript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd cold-email-generator
npm install papaparse
```

Create a `.env.local` file in the root:
```env
GEMINI_API_KEY=your_api_key_here
```

---

## Folder & File Structure

```
/src
  /app
    layout.jsx                    ← Root layout, font setup, metadata
    page.jsx                      ← Main page — renders all sections in order
    globals.css                   ← Tailwind base + any custom CSS
    /api
      /generate
        route.js                  ← POST: generate 3 email variations
      /improve
        route.js                  ← POST: improve a single email
      /generate-single
        route.js                  ← POST: generate one email from a CSV lead row

  /components
    InputForm.jsx                 ← Section 1: product description + tone
    EmailVariations.jsx           ← Section 2: 3 variation cards
    EmailCard.jsx                 ← Sub-component: single email card
    ImprovementPanel.jsx          ← Section 3: before/after improvement
    CSVUploader.jsx               ← Section 4: upload, preview, bulk generate
    SkeletonCard.jsx              ← Loading placeholder card
    ErrorBanner.jsx               ← Error display component
    CopyButton.jsx                ← Reusable clipboard copy button

  /lib
    utils.js                      ← Helpers (classname joining, etc.)
```

---

## API Route Handlers

### 1. `/src/app/api/generate/route.js`
Generates 3 email variations from a product description.



### 2. `/src/app/api/improve/route.js`
Takes an existing email + user feedback and returns an improved version.



### 3. `/src/app/api/generate-single/route.js`
Generates one personalized email for a single CSV lead row.


## Main Page (`/src/app/page.jsx`)

```jsx
"use client";
import { useState } from "react";
import InputForm from "@/components/InputForm";
import EmailVariations from "@/components/EmailVariations";
import ImprovementPanel from "@/components/ImprovementPanel";
import CSVUploader from "@/components/CSVUploader";

export default function Home() {
  const [variations, setVariations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">✦ Cold Email Generator</h1>
        <p className="text-sm text-gray-500">AI-powered personalized outreach</p>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">

        {/* Section 1 — Input */}
        <InputForm
          onGenerate={setVariations}
          onGenerating={setIsGenerating}
          isGenerating={isGenerating}
          onDescriptionChange={setProductDescription}
        />

        {/* Section 2 — Email Variations */}
        {(isGenerating || variations.length > 0) && (
          <EmailVariations
            variations={variations}
            isLoading={isGenerating}
            onImprove={(variation) => setSelectedEmail(variation)}
          />
        )}

        {/* Section 3 — Improve Panel */}
        {selectedEmail && (
          <ImprovementPanel
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        )}

        {/* Section 4 — CSV Bulk Upload */}
        <CSVUploader productDescription={productDescription} />

      </div>
    </main>
  );
}
```

---

## Component Breakdown

---

### `InputForm.jsx` — Section 1
**What it does:** Collects product description + tone, calls `/api/generate`

**UI:**
- Textarea: `"Describe your product & target audience"` — 5 rows
- Dropdown: Tone selector with options `Professional` / `Casual & Friendly` / `Direct & Bold`
- Button: `"✦ Generate Emails"` — disabled + spinner while loading
- Inline validation: show error message if textarea is empty on submit

**State it manages:** `productInput`, `selectedTone`, `error`

**On submit:**
```js
const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productDescription: productInput, tone: selectedTone }),
});
const data = await res.json();
onGenerate(data.variations);
```

---

### `EmailVariations.jsx` — Section 2
**What it does:** Shows 3 email cards, or 3 skeleton loaders while generating

**Layout:** 3-column grid on desktop (`grid-cols-3`), single column on mobile (`grid-cols-1`)

**Loading state:** Render `<SkeletonCard />` × 3 when `isLoading` is true

**Each card (`EmailCard.jsx`) shows:**
- Variation badge + tone tag
- Subject line (bold, larger text)
- Personalized opening (italic, muted color)
- Full email body (scrollable if long)
- `<CopyButton />` — copies full text, flashes `"Copied ✓"`
- `[Improve This Email →]` button — calls `onImprove(variation)` prop

---

### `ImprovementPanel.jsx` — Section 3
**What it does:** Shows original email + feedback input + before/after comparison

**Renders when:** `selectedEmail` is not null in parent page

**UI Flow:**

```
Step 1 — Initial view:
  ┌─ Original Email (read-only) ──────────────────────────┐
  │ Subject: ...                                           │
  │ Body: ...                                              │
  └────────────────────────────────────────────────────────┘
  Textarea: "What would you like to change?"
  Button: "Apply Improvements"

Step 2 — After improvement loads:
  ┌─ BEFORE ──────────────────┐  ┌─ AFTER ───────────────────┐
  │ (greyed, original email)  │  │ (highlighted, improved)   │
  │ [Copy]                    │  │ [Copy]                    │
  └───────────────────────────┘  └───────────────────────────┘
  Changes summary: "Shortened the email and made the CTA more direct"
  [Improve Again]  [Start Fresh]
```

**API call:**
```js
const res = await fetch("/api/improve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ originalEmail: email.body, originalSubject: email.subject_line, feedback }),
});
```

**After panel styling:** left border highlight — `border-l-4 border-green-400`

---

### `CSVUploader.jsx` — Section 4
**What it does:** CSV upload → lead preview table → bulk generate → results

**Step 1 — Upload zone:**
- Drag-and-drop box OR `[Browse File]` button
- Accept `.csv` only
- Parse with PapaParse:
```js
Papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => setLeads(results.data),
});
```
- Show friendly error if `name`, `company`, or `role` columns are missing

**Step 2 — Preview table:**
```
Name      | Company    | Role
----------|------------|-------------
Sarah     | Acme Corp  | Ops Manager
James     | TechFlow   | Founder
+ 45 more...
```
- Show first 5 rows, `"and X more leads..."` below
- `[Clear File]` button resets everything
- `[Generate All Emails]` button (disabled until file is loaded)

**Step 3 — Progress + Results:**
- Process each lead **sequentially** (one at a time — avoids API rate limits)
- Progress bar: `"Generating 3 of 47..."`
- Each lead becomes a collapsible card:
  ```
  ▶ Sarah @ Acme Corp ——————— [Copy]
  ```
  Clicking `▶` expands to show full personalized email
- When all done: `[Download All as .txt]` button

---

### `SkeletonCard.jsx`
Pulsing loading placeholder — same size as a real email card.

```jsx
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
    </div>
  );
}
```

---

### `ErrorBanner.jsx`

```jsx
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between">
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-sm underline ml-4">Retry</button>
      )}
    </div>
  );
}
```

---

### `CopyButton.jsx`

```jsx
"use client";
import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 transition"
    >
      {copied ? "Copied ✓" : "Copy Email"}
    </button>
  );
}
```

---

## Visual Design System

Apply consistently across all components:

```
Page background:   bg-gray-50
Cards:             bg-white, rounded-xl, shadow-sm
Borders:           border-gray-200
Primary button:    bg-indigo-600 text-white hover:bg-indigo-700
Secondary button:  border border-gray-300 hover:bg-gray-50
Text primary:      text-gray-900
Text muted:        text-gray-500
AFTER highlight:   border-l-4 border-green-400
Error:             bg-red-50, text-red-700
Spacing:           p-6 inside cards, space-y-16 between sections
```

**Tone Badge Colors:**
- `Professional` → `bg-blue-100 text-blue-700`
- `Casual & Friendly` → `bg-green-100 text-green-700`
- `Direct & Bold` → `bg-orange-100 text-orange-700`

---

## UX Rules (Non-Negotiable)

| Rule | How |
|---|---|
| API key never exposed | All LLM calls go through `/app/api/` route handlers only |
| No broken states | Every `fetch()` call is wrapped in try/catch with error state |
| No empty screens | Skeleton loaders while AI is working |
| Button discipline | Disable all submit buttons while any request is in-flight |
| Mobile works | All grids collapse to single column below `md` breakpoint |
| Sequential CSV | Process leads one at a time — never parallel |
| Non-destructive improve | Original email always stays visible beside the improved version |

---

## Environment Variables

```env
# .env.local — never commit this file
GEMINI_API_KEY=your_api_key_here
```

Access in route handlers only: `process.env.GEMINI_API_KEY`

Never reference this in any `"use client"` component — it would be exposed to the browser.

---

## Build Order for Antigravity

Build and test each step before moving to the next:

```
Step 1  → Project setup: Next.js 14, JavaScript (no TS), Tailwind, PapaParse
Step 2  → Build all 3 API route handlers, test each with a curl or Postman request
Step 3  → Build InputForm.jsx — wire to /api/generate
Step 4  → Build SkeletonCard.jsx and ErrorBanner.jsx
Step 5  → Build EmailCard.jsx + EmailVariations.jsx — display API response
Step 6  → Build CopyButton.jsx — attach to EmailCard
Step 7  → Build ImprovementPanel.jsx — wire to /api/improve
Step 8  → Build CSVUploader.jsx — wire to /api/generate-single
Step 9  → Polish: mobile layout, loading states, empty states, error states
Step 10 → Test full end-to-end with real product descriptions and a sample CSV
```

---

## What "Done" Looks Like

A user can:
1. ✅ Type a product description → receive 3 email variations in under 15 seconds
2. ✅ See subject line, personalized opening, and full body for each variation
3. ✅ Copy any email to clipboard in one click
4. ✅ Click "Improve" on any email → type feedback → see before/after comparison
5. ✅ Upload a CSV → preview leads → bulk generate personalized emails with a progress bar
6. ✅ See a loading state at every async step — never a broken or empty screen
7. ✅ API key is always safe — never exposed to the browser

---

*This is the complete specification. Use JavaScript and JSX only — no TypeScript, no `.tsx` files anywhere. Build each step in order. The API route handlers are the foundation — build and test them first.*
