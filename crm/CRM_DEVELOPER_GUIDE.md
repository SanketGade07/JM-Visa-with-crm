# CRM Developer Guide — Immigration/Visa Consultancy CRM
## Complete Build Specification for AI Agent / Developer

---

## 1. PROJECT OVERVIEW

You are building a **standalone CRM application** for an immigration/visa consultancy business.

- The CRM will be hosted separately at `crm.yourdomain.com`
- The existing **public website** (Next.js with lead form) lives at `www.yourdomain.com`
- Both are connected via **REST API**
- The website sends lead data to the CRM via a webhook/API endpoint
- CRM manages all lead lifecycle, country modules, payments, documents, and reports

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend (CRM UI) | Next.js 14+ (App Router) |
| Backend / API | Next.js API Routes or separate Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Auth.js) |
| File Storage | AWS S3 or Cloudflare R2 |
| Email Notifications | Resend or Nodemailer |
| Hosting | Vercel (CRM) + Vercel (Website) |
| Styling | Tailwind CSS + shadcn/ui |

---

## 3. FOLDER STRUCTURE

```
crm-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  ← Sidebar + Header wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx                ← Stats overview
│   │   ├── leads/
│   │   │   ├── page.tsx                ← All leads list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            ← Lead detail page
│   │   │   └── new/
│   │   │       └── page.tsx            ← Manual lead entry
│   │   ├── countries/
│   │   │   ├── page.tsx                ← All country modules
│   │   │   ├── uk/page.tsx
│   │   │   ├── usa/
│   │   │   │   ├── page.tsx            ← USA leads
│   │   │   │   └── slots/page.tsx      ← Slot management
│   │   │   ├── canada/page.tsx
│   │   │   └── europe/page.tsx
│   │   ├── payments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── meetings/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── users/page.tsx          ← Staff management
│
├── api/
│   ├── leads/
│   │   ├── route.ts                    ← POST = receive from website, GET = list
│   │   └── [id]/route.ts
│   ├── payments/route.ts
│   ├── reports/route.ts
│   └── webhook/
│       └── website/route.ts            ← Webhook endpoint for website form
│
├── components/
│   ├── leads/
│   │   ├── LeadCard.tsx
│   │   ├── LeadTable.tsx
│   │   ├── LeadStatusBadge.tsx
│   │   └── LeadTimeline.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageWrapper.tsx
│   ├── payments/
│   │   └── PaymentForm.tsx
│   └── ui/                             ← shadcn/ui components
│
├── lib/
│   ├── prisma.ts                       ← Prisma client singleton
│   ├── auth.ts                         ← NextAuth config
│   └── utils.ts
│
├── prisma/
│   └── schema.prisma
│
└── .env
```

---

## 4. DATABASE SCHEMA (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────
// USERS (CRM Staff)
// ─────────────────────────────────────
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(COUNSELOR)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assignedLeads Lead[]   @relation("AssignedTo")
  meetings      Meeting[]
  expenses      Expense[]
}

enum Role {
  ADMIN
  MANAGER
  COUNSELOR
}

// ─────────────────────────────────────
// LEADS
// ─────────────────────────────────────
model Lead {
  id               String      @id @default(cuid())
  name             String
  email            String?
  phone            String
  countryInterest  Country
  service          String?
  source           LeadSource  @default(WEBSITE)
  status           LeadStatus  @default(NEW)
  notes            String?
  assignedToId     String?
  assignedTo       User?       @relation("AssignedTo", fields: [assignedToId], references: [id])
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  activities       Activity[]
  payments         Payment[]
  documents        Document[]
  meetings         Meeting[]
  usaSlot          UsaSlot?
  visaSubmission   VisaSubmission?

  @@index([status])
  @@index([countryInterest])
}

enum LeadStatus {
  NEW
  CONTACTED
  IN_PROGRESS
  CONVERTED
  DROPPED
}

enum Country {
  UK
  USA
  CANADA
  EUROPE
  OTHER
}

enum LeadSource {
  WEBSITE
  REFERRAL
  WALK_IN
  SOCIAL_MEDIA
  MANUAL
}

// ─────────────────────────────────────
// ACTIVITY LOG (Timeline)
// ─────────────────────────────────────
model Activity {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id])
  type      String   // "status_change", "note", "call", "email", "document"
  content   String
  createdAt DateTime @default(now())
  createdBy String
}

// ─────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────
model Payment {
  id          String        @id @default(cuid())
  leadId      String
  lead        Lead          @relation(fields: [leadId], references: [id])
  amount      Float
  currency    String        @default("USD")
  type        PaymentType
  status      PaymentStatus @default(PENDING)
  reference   String?
  notes       String?
  paidAt      DateTime?
  createdAt   DateTime      @default(now())
}

enum PaymentType {
  CONSULTATION_FEE
  APPLICATION_FEE
  VISA_FEE
  SERVICE_CHARGE
  SLOT_FEE
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIAL
  REFUNDED
}

// ─────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────
model Document {
  id           String   @id @default(cuid())
  leadId       String
  lead         Lead     @relation(fields: [leadId], references: [id])
  name         String
  type         String   // passport, photo, bank_statement, etc.
  fileUrl      String
  status       String   @default("UPLOADED") // UPLOADED, VERIFIED, REJECTED
  uploadedAt   DateTime @default(now())
}

// ─────────────────────────────────────
// MEETINGS
// ─────────────────────────────────────
model Meeting {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id])
  counselorId String
  counselor   User     @relation(fields: [counselorId], references: [id])
  title       String
  scheduledAt DateTime
  duration    Int      // minutes
  notes       String?
  status      String   @default("SCHEDULED") // SCHEDULED, DONE, CANCELLED
  createdAt   DateTime @default(now())
}

// ─────────────────────────────────────
// USA SLOT MANAGEMENT
// ─────────────────────────────────────
model UsaSlot {
  id              String    @id @default(cuid())
  leadId          String    @unique
  lead            Lead      @relation(fields: [leadId], references: [id])
  slotType        String    // B1/B2, F1, H1B, etc.
  availableDate   DateTime?
  bookedDate      DateTime?
  interviewDate   DateTime?
  status          SlotStatus @default(AVAILABLE)
  credentials     String?   // encrypted visa credentials JSON
  notes           String?
  createdAt       DateTime  @default(now())
}

enum SlotStatus {
  AVAILABLE
  PAID
  BOOKED
  INTERVIEW_SCHEDULED
  SUBMITTED
  APPROVED
  REJECTED
}

// ─────────────────────────────────────
// VISA SUBMISSION
// ─────────────────────────────────────
model VisaSubmission {
  id              String   @id @default(cuid())
  leadId          String   @unique
  lead            Lead     @relation(fields: [leadId], references: [id])
  submittedAt     DateTime?
  trackingNumber  String?
  status          String   @default("PENDING")
  country         Country
  notes           String?
  createdAt       DateTime @default(now())
}

// ─────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────
model Expense {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  category    String
  amount      Float
  description String?
  date        DateTime
  receipt     String?  // file URL
  createdAt   DateTime @default(now())
}
```

---

## 5. API ENDPOINTS

### 5.1 — Webhook: Receive Leads from Website

```
POST /api/webhook/website
```

This is the **most critical endpoint**. The existing website will POST to this URL whenever a form is submitted.

**Request Body (sent from website):**
```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "countryInterest": "USA",
  "service": "Visa",
  "source": "WEBSITE"
}
```

**Implementation (`app/api/webhook/website/route.ts`):**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate webhook secret
  if (body.secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create lead
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone,
      countryInterest: body.countryInterest || 'OTHER',
      service: body.service || null,
      source: 'WEBSITE',
      status: 'NEW',
    }
  })

  // Log activity
  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: 'lead_created',
      content: 'Lead received from website form',
      createdBy: 'SYSTEM'
    }
  })

  // TODO: Send email notification to admin
  // await sendNewLeadEmail(lead)

  return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
}
```

### 5.2 — Leads API

```
GET  /api/leads              → List all leads (with filters: status, country, assigned)
POST /api/leads              → Create lead manually
GET  /api/leads/:id          → Get single lead with full details
PUT  /api/leads/:id          → Update lead (status, assignee, notes)
DELETE /api/leads/:id        → Soft delete lead
```

### 5.3 — Other APIs

```
GET/POST   /api/payments
GET/POST   /api/meetings
GET/POST   /api/documents
GET/POST   /api/expenses
GET        /api/reports/summary
GET        /api/reports/by-country
GET        /api/reports/by-counselor
```

---

## 6. HOW TO CONNECT EXISTING WEBSITE FORM

### On the Website (existing Next.js app):

In your existing form submit handler, add a `fetch` call to the CRM webhook:

```typescript
// In your existing website form handler
async function handleFormSubmit(formData: FormData) {
  const payload = {
    secret: process.env.CRM_WEBHOOK_SECRET,  // store in .env
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    countryInterest: formData.get('country'),
    service: formData.get('service'),
  }

  // Save to your own DB if needed (optional)
  // ...

  // Send to CRM
  await fetch('https://crm.yourdomain.com/api/webhook/website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
```

**Environment variables to add to website `.env`:**
```
CRM_WEBHOOK_SECRET=your_secret_key_here
CRM_WEBHOOK_URL=https://crm.yourdomain.com/api/webhook/website
```

**Environment variables to add to CRM `.env`:**
```
DATABASE_URL=postgresql://...
WEBHOOK_SECRET=your_secret_key_here
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://crm.yourdomain.com
```

### Security: CORS Configuration

In CRM `next.config.js`, restrict which domains can call the API:

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: '/api/webhook/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://www.yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST' },
        ],
      },
    ]
  },
}
```

---

## 7. AUTHENTICATION (NextAuth.js)

### Setup (`lib/auth.ts`):

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})
```

### Role-based Middleware (`middleware.ts`):

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                           req.nextUrl.pathname.startsWith('/leads') ||
                           req.nextUrl.pathname.startsWith('/payments')

  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)']
}
```

---

## 8. CRM MODULES — DETAILED FEATURE SPEC

### 8.1 Dashboard
- Total leads count (this week / this month)
- Leads by status (New / Contacted / In Progress / Converted / Dropped)
- Leads by country (chart)
- Recent activity feed
- Upcoming meetings
- Revenue summary (paid payments this month)
- Quick actions: Add Lead, Schedule Meeting

### 8.2 Lead Management
- **Lead List Page:**
  - Table with columns: Name, Phone, Country, Status, Assigned To, Created At
  - Filters: Status, Country, Assigned Counselor, Date Range
  - Search by name or phone
  - Bulk status update
  - Export to CSV

- **Lead Detail Page:**
  - Full profile panel (name, email, phone, country, service)
  - Status dropdown (change status)
  - Assign to counselor dropdown
  - Activity timeline (auto-logs status changes, notes, calls, documents)
  - Payments section (add payment, view history)
  - Documents section (upload/download/verify)
  - Meetings section (schedule, view past)
  - Notes (free text)
  - Convert to Country Module button (when status = Converted)

### 8.3 Country Modules

#### UK Module
- UK leads (filtered from lead table)
- Document checklist per lead
- Visa submission status
- Application tracking

#### USA Module (most complex)
- USA leads list
- **Slot Management:**
  - Available Slots list
  - Paid Slots (lead has paid for slot)
  - Booked Slots (appointment confirmed)
  - Visa credentials storage (encrypted)
  - Interview date tracking
  - Status pipeline: Available → Paid → Booked → Interview → Submitted → Approved/Rejected

#### Canada Module
- Canada leads
- Express Entry / PNP tracking
- Document checklist
- Application stages

#### Europe Module
- Europe leads by specific country (Schengen, individual countries)
- Application tracking

### 8.4 Payments Module
- List all payments across all leads
- Filters: Status (Pending/Paid), Type, Date range, Country
- Add payment record (linked to lead)
- Mark as paid
- Payment summary per lead
- Revenue reports (monthly, by country, by service)
- Export to CSV/PDF

### 8.5 Expenses Module
- Log business expenses
- Categories: Office, Travel, Marketing, Government Fees, Staff, Other
- Receipt upload (S3)
- Monthly expense summary
- Profit = Payments Received - Expenses

### 8.6 Meetings Module
- Calendar view + list view
- Schedule meeting (linked to lead + counselor)
- Google Calendar integration (optional Phase 2)
- Meeting notes
- Status: Scheduled / Done / Cancelled
- Filter by counselor

### 8.7 Documents Module
- Global document list across all leads
- Upload, preview, download
- Document types: Passport, Photo, Bank Statement, Offer Letter, Employment Letter, ITR, etc.
- Status: Uploaded / Verified / Rejected
- Storage: AWS S3 / Cloudflare R2

### 8.8 Reports Module
- **Lead Reports:**
  - Leads by source (website / referral / walk-in)
  - Leads by country
  - Leads by counselor
  - Conversion rate (New → Converted)
  - Drop rate (New → Dropped)
  - Monthly trend (chart)
- **Financial Reports:**
  - Revenue by month
  - Revenue by country
  - Revenue by service
  - Expenses vs Revenue
  - Outstanding payments
- **Staff Reports:**
  - Leads per counselor
  - Conversion rate per counselor
  - Meetings per counselor

### 8.9 Settings & User Management
- Add / edit / deactivate staff
- Roles: Admin / Manager / Counselor
- Admin can see everything
- Manager can see all leads, assign, view reports
- Counselor can see only assigned leads

---

## 9. KEY DATA FLOWS

### Flow 1: Website Form → CRM Lead
```
Visitor fills form on website
        ↓
Website API Route processes form
        ↓
POST to CRM webhook endpoint
  Headers: Content-Type: application/json
  Body: { secret, name, phone, email, country, service }
        ↓
CRM webhook validates secret
        ↓
Prisma creates Lead record (status: NEW)
        ↓
Activity log entry created
        ↓
Email notification sent to admin (optional)
        ↓
Lead visible in CRM dashboard instantly
```

### Flow 2: Lead → Converted → Country Module
```
CRM Counselor opens lead
        ↓
Updates status to CONVERTED
        ↓
Selects country (e.g., USA)
        ↓
Lead appears in USA Module
        ↓
Counselor assigns USA slot
        ↓
Client pays → Payment recorded → Slot status = PAID
        ↓
Appointment booked → Slot status = BOOKED
        ↓
Documents collected → Visa submitted
        ↓
Final status: APPROVED / REJECTED
```

### Flow 3: Payment Recording
```
Counselor opens lead detail
        ↓
Clicks "Add Payment"
        ↓
Fills: Amount, Type, Reference, Date
        ↓
Saves → payment record linked to lead
        ↓
Activity log updated
        ↓
Appears in Payments module and Reports
```

---

## 10. ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/crm_db"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://crm.yourdomain.com"

# Webhook security (must match website .env)
WEBHOOK_SECRET="generate-strong-random-string"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-south-1"
AWS_BUCKET_NAME="crm-documents"

# Email (Resend)
RESEND_API_KEY=""
ADMIN_EMAIL="admin@yourdomain.com"

# App
NODE_ENV="production"
```

---

## 11. DEVELOPMENT PHASES

### Phase 1 — Core CRM (Week 1–2)
- [ ] Project setup (Next.js + Prisma + PostgreSQL + Auth)
- [ ] Database schema migration
- [ ] Login page + auth middleware
- [ ] Sidebar layout
- [ ] Webhook endpoint (receive leads from website)
- [ ] Lead list page with filters
- [ ] Lead detail page
- [ ] Basic status management

### Phase 2 — Modules (Week 3–4)
- [ ] Country modules (UK, USA, Canada, Europe)
- [ ] USA Slot Management
- [ ] Payments module
- [ ] Document upload (S3 integration)
- [ ] Meetings scheduling

### Phase 3 — Reports & Polish (Week 5–6)
- [ ] Reports module (charts with Recharts or Chart.js)
- [ ] Expenses module
- [ ] Email notifications (Resend)
- [ ] Staff management
- [ ] CSV/PDF export
- [ ] Role-based access control

### Phase 4 — Production
- [ ] Deploy CRM to Vercel (or VPS)
- [ ] Configure custom domain `crm.yourdomain.com`
- [ ] Add webhook URL to existing website
- [ ] Test end-to-end lead flow
- [ ] Set up database backups

---

## 12. DEPLOYMENT ARCHITECTURE

```
www.yourdomain.com          crm.yourdomain.com
(Existing Website)          (This CRM)
      │                           │
      │ POST /api/webhook/website │
      └───────────────────────────┘
                                  │
                         PostgreSQL Database
                         (Supabase or Neon or Railway)
                                  │
                         AWS S3 / Cloudflare R2
                         (Document Storage)
```

**Recommended free/low-cost DB options:**
- **Neon.tech** — free PostgreSQL, generous limits
- **Supabase** — free tier, built-in storage too
- **Railway** — cheap and simple

---

## 13. IMPORTANT INSTRUCTIONS FOR DEVELOPER

1. **Never hardcode credentials** — always use `.env` files
2. **Validate the webhook secret** on every incoming request from the website
3. **Use Prisma transactions** when creating leads + activity logs together
4. **Encrypt sensitive data** like USA visa credentials (use `crypto` or a library like `cryptr`)
5. **Implement soft delete** — never hard-delete leads, just set `isDeleted: true`
6. **Log every status change** in the Activity table automatically (use Prisma middleware)
7. **Paginate all list pages** — leads can grow into thousands
8. **Add indexes** on `Lead.status`, `Lead.countryInterest`, `Lead.assignedToId` for query performance
9. **Test the webhook** using a tool like Postman before connecting the live website
10. **CORS restrict** the webhook endpoint to only accept requests from the website domain

---

## 14. TESTING THE INTEGRATION (Checklist)

Before going live, test this flow:

```
Step 1: Submit the lead form on www.yourdomain.com
Step 2: Check CRM dashboard — new lead should appear within 2–3 seconds
Step 3: Open lead in CRM — verify all fields are correct
Step 4: Change status to CONTACTED — verify activity log updates
Step 5: Add a payment — verify it appears in Payments module
Step 6: Upload a document — verify it is accessible
Step 7: Convert lead — verify it appears in correct Country Module
Step 8: Run a Report — verify numbers are correct
```

---

*This document is the complete specification. Build each module in the order listed in Phase 1 → Phase 4. Start with the webhook endpoint first so leads flow in from day one.*
