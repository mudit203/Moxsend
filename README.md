
## Overview

Moxsend helps sales teams and founders craft personalized cold emails at scale. Describe your product, choose a tone, and let AI generate ready-to-send outreach — one at a time or in bulk via CSV upload.

### Key Features

- **Single Email Generation** — Describe your product and target audience, pick a tone (Professional / Casual / Bold), and get 3 unique email variations instantly
- **CSV Bulk Processing** — Upload a CSV of leads (name, company, role) and generate a personalized email for each lead sequentially
- **Iterative Improvement** — Select any generated email and refine it with natural-language feedback in a Before/After comparison panel
- **Copy to Clipboard** — One-click copy for any generated email with visual confirmation
- **Rate-Limit Safe** — Sequential processing with configurable delays to stay within API quotas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, JSX) |
| UI | React 19 + shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| CSV Parsing | PapaParse (client-side) |
| Icons | Lucide React |

---

## Project Structure

```
moxsend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/          # POST — 3 email variations from product description
│   │   │   ├── generate-single/   # POST — 1 personalized email per CSV lead
│   │   │   └── improve/           # POST — Refine email based on user feedback
│   │   ├── globals.css            # Design tokens & dark theme (oklch)
│   │   ├── layout.jsx             # Root layout (Geist font, metadata)
│   │   └── page.jsx               # Main dashboard (tabs, state management)
│   ├── components/
│   │   ├── InputForm.jsx          # Product description + tone selector form
│   │   ├── EmailVariations.jsx    # Grid of 3 generated email cards
│   │   ├── EmailCard.jsx          # Individual email card with copy & improve actions
│   │   ├── ImprovementPanel.jsx   # Before/After email comparison with feedback loop
│   │   ├── CSVUploader.jsx        # Drag-and-drop CSV upload + sequential processing
│   │   ├── CSVResultRow.jsx       # Collapsible result row per CSV lead
│   │   ├── CopyButton.jsx         # Copy-to-clipboard with checkmark animation
│   │   ├── SkeletonCard.jsx       # Loading placeholder for email cards
│   │   └── ui/                    # shadcn/ui primitives (Button, Card, Tabs, etc.)
│   └── lib/
│       └── utils.js               # cn() utility for class merging
├── .env.local                     # GEMINI_API_KEY (not committed)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- A **Google AI Studio** API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/moxsend.git
cd moxsend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

> ⚠️ This key is only accessed server-side in API routes — never exposed to the browser.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

### `POST /api/generate`

Generates 3 cold email variations.

**Request:**
```json
{
  "productDescription": "An AI-powered CRM for sales teams...",
  "tone": "Professional",
  "audience": "SaaS founders"
}
```

**Response:**
```json
{
  "variations": [
    {
      "subject_line": "...",
      "personalized_line": "...",
      "body": "...",
      "tone": "Professional"
    }
  ]
}
```

---

### `POST /api/generate-single`

Generates 1 personalized email for a specific lead (used by CSV bulk processing).

**Request:**
```json
{
  "productDescription": "An AI-powered CRM...",
  "tone": "Professional",
  "lead": {
    "name": "Sarah Chen",
    "company": "Stripe",
    "role": "VP of Sales"
  }
}
```

**Response:**
```json
{
  "email": {
    "subject_line": "...",
    "personalized_line": "...",
    "body": "..."
  }
}
```

---

### `POST /api/improve`

Refines an existing email based on user feedback.

**Request:**
```json
{
  "originalEmail": "...",
  "originalSubjectLine": "...",
  "originalPersonalizedLine": "...",
  "feedback": "Make it shorter and add a case study mention"
}
```

**Response:**
```json
{
  "improved": {
    "subject_line": "...",
    "personalized_line": "...",
    "body": "..."
  },
  "changesSummary": "Shortened the body by 40% and added a reference to..."
}
```

---

## CSV Format

Upload a `.csv` file with the following columns:

| Column | Required | Description |
|---|---|---|
| `name` | ✅ Yes | Lead's full name |
| `company` | Optional | Lead's company name |
| `role` | Optional | Lead's job title |

**Example:**

```csv
name,company,role
Sarah Chen,Stripe,VP of Sales
John Park,Notion,CTO
Lisa Wang,Figma,Head of Growth
```

---

## Design System

Moxsend uses a custom dark theme built on **oklch** color tokens:

- **Background:** Deep navy (`#0A1628` range)
- **Primary / Buttons:** Sky blue (`#38BDF8`)
- **Cards:** Slightly lighter navy with subtle blue tint
- **Typography:** Geist Sans (Vercel)
- **Border radius:** `0.75rem` base

---

## Error Handling

| Layer | Strategy |
|---|---|
| **API Routes** | Input validation (400), JSON parse fallback (502), incomplete AI response (502), catch-all (500) |
| **InputForm** | Client-side validation, `!res.ok` check, network error catch, inline error display |
| **CSVUploader** | File type check, empty CSV check, missing column check, per-lead error capture, abort control |
| **ImprovementPanel** | Empty feedback validation, API error catch, inline error display |

---

## Rate Limiting

The app uses sequential processing with a configurable delay (default: 3 seconds) between CSV lead requests to stay within Gemini API free-tier limits (15 RPM). The delay can be adjusted in `CSVUploader.jsx`.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

MIT

---

Built with ☕ and Gemini AI.
