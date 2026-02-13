# 🎯 KnowYourRank.in

**Know your rank before results.** An AI-powered exam analytics platform for Indian competitive exam aspirants. Paste your CBT answer key URL or upload your OMR sheet to get instant score calculation, topic-wise breakdown, silly mistake tracking, and predicted rank.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

---

## ✨ Features

- 📝 **Score Calculator** — Paste your CBT answer key URL or upload the downloaded HTML/PDF file
- 📊 **Topic-wise Breakdown** — See accuracy for each subject: Math, Reasoning, English, GK, Computer, Odia
- ⚠️ **Silly Mistake Tracker** — Identifies easy questions you got wrong so you can fix gaps
- 🏆 **Rank Predictor** — Estimated rank based on your score and category
- 📥 **PDF Report Download** — Beautifully designed HTML report with insights and recommendations
- 🎯 **30+ Exam Schemes** — Pre-configured marking schemes for SSC, IBPS, UPSC, Railway, OSSSC, NEET, JEE, CAT, NDA, and more
- 📱 **Responsive UI** — Works great on mobile and desktop

## 🗂️ Supported Exams

| Category | Exams |
|----------|-------|
| **Odisha** | OSSSC RI, OSSC CGL, OPSC ASO, OTET |
| **SSC** | CGL, CHSL, MTS, GD |
| **Banking** | IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant, LIC AAO |
| **Railway** | RRB NTPC, Group D, JE |
| **UPSC** | Prelims, CDS, NDA, AFCAT |
| **Engineering** | GATE, JEE Main |
| **Medical** | NEET |
| **Teaching** | UGC NET, CTET |
| **Management** | CAT, MAT, XAT |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Charts** | Recharts |
| **Database** | Prisma ORM + SQLite |
| **Auth** | NextAuth.js |
| **State** | Zustand, TanStack Query |
| **Forms** | React Hook Form + Zod |

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/knowyourrank.git
cd knowyourrank

# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Build for Production

```bash
bun run build
bun start
```

## 📁 Project Structure

```
knowyourrank/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-paper/    # Upload & analyze question papers
│   │   │   ├── calculate-score/  # Score calculation with marking schemes
│   │   │   ├── generate-report/  # PDF report generation
│   │   │   ├── process-omr/      # OMR sheet processing
│   │   │   └── scrape-cbt/       # CBT answer key URL scraping
│   │   ├── layout.tsx            # Root layout with metadata & SEO
│   │   ├── page.tsx              # Main calculator UI
│   │   └── globals.css
│   ├── components/ui/            # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   └── lib/
│       ├── constants.ts          # Marking schemes, topics, exam configs
│       ├── types.ts              # TypeScript interfaces
│       ├── db.ts                 # Prisma client
│       ├── exam-utils.ts         # Exam utility functions
│       └── utils.ts              # General utilities
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
└── package.json
```

## 📡 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scrape-cbt` | POST | Analyze a CBT exam from answer key URL |
| `/api/process-omr` | POST | Process an uploaded OMR sheet image |
| `/api/analyze-paper` | POST | Analyze an uploaded question paper |
| `/api/calculate-score` | POST | Calculate score with a given marking scheme |
| `/api/calculate-score` | GET | List all available marking schemes |
| `/api/generate-report` | POST | Generate a downloadable HTML report |

## 📜 License

MIT

## 👤 Author

**zeroday**

---

> _Built for the exam warrior community of India._ 🇮🇳
