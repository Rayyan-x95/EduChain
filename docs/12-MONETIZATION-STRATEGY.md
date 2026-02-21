# Monetization Strategy — EduLink

> Business Model: Tiered SaaS + API Marketplace  
> Target: Educational Institutions, Recruiters, Verification Platforms  
> Revenue Start: Phase 3 (Multi-Department Expansion)

---

## 1. Pricing Tiers

### Institution Tiers

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────────────────┐   │
│  │    🆓 FREE      │   │  🏫 CAMPUS     │   │  🏛️ ENTERPRISE              │   │
│  │                │   │               │   │                            │   │
│  │  $0/month      │   │  $99/month    │   │  $499/month               │   │
│  │                │   │               │   │                            │   │
│  │  ≤ 50 students │   │  ≤ 2,000      │   │  Unlimited students       │   │
│  │  1 admin       │   │  students     │   │  Unlimited admins         │   │
│  │  Basic verify  │   │  5 admins     │   │  SSO integration          │   │
│  │  5 credentials │   │  Unlimited    │   │  API access               │   │
│  │  No API access │   │  credentials  │   │  Custom branding          │   │
│  │  Community     │   │  Analytics    │   │  Priority SLA             │   │
│  │  support       │   │  Email support│   │  Dedicated support        │   │
│  │                │   │  QR verify    │   │  Audit compliance pack    │   │
│  │                │   │  Badges       │   │  Custom integrations      │   │
│  │                │   │              │   │  White-label option       │   │
│  └────────────────┘   └────────────────┘   └────────────────────────────┘   │
│                                                                              │
│  Annual discount: 20% off (billed yearly)                                   │
│  Campus: $79/mo if annual    Enterprise: $399/mo if annual                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Feature Comparison Matrix

| Feature | Free | Campus ($99/mo) | Enterprise ($499/mo) |
|---|:---:|:---:|:---:|
| Students | ≤ 50 | ≤ 2,000 | Unlimited |
| Admin accounts | 1 | 5 | Unlimited |
| Credential issuance | 5/month | Unlimited | Unlimited |
| QR identity verification | ✅ | ✅ | ✅ |
| Digital ID cards | ✅ | ✅ | ✅ |
| Peer endorsements | ✅ | ✅ | ✅ |
| Reputation system | ✅ | ✅ | ✅ |
| Credential templates | 1 default | 5 custom | Unlimited |
| GitHub integration | ❌ | ✅ | ✅ |
| Analytics dashboard | Basic | Full | Advanced + exports |
| Audit logs | 30 days | 1 year | Unlimited + export |
| Recruiter portal | ❌ | Basic | Full + bulk verify |
| Key rotation | ❌ | Manual | Auto + scheduled |
| API access | ❌ | Read-only | Full CRUD |
| SSO (SAML/OIDC) | ❌ | ❌ | ✅ |
| Custom branding | ❌ | Logo only | Full white-label |
| SLA | Best effort | 99.5% | 99.9% |
| Support | Community | Email (48h) | Priority (4h) |
| Data export | Manual | CSV | CSV + API + PDF |
| Signed PDF export | ❌ | ✅ | ✅ |
| Badge system | ❌ | ✅ | ✅ |
| LMS integration | ❌ | ❌ | ✅ |

---

## 2. Recruiter API Pricing

### Pay-Per-Use Model

```
┌──────────────────────────────────────────────────────────────┐
│                    RECRUITER API                              │
│                                                              │
│  Verification API:                                           │
│    Single verification:    $0.10 per request                 │
│    Bulk verification:      $0.05 per request (100+ batch)    │
│                                                              │
│  Search API:                                                 │
│    Student search:         $0.02 per query                   │
│    Profile view:           $0.05 per view                    │
│                                                              │
│  Packages:                                                   │
│    Starter:    500 verifications/mo    $39/mo  ($0.078/ea)   │
│    Growth:     2,000 verifications/mo  $129/mo ($0.065/ea)   │
│    Scale:      10,000 verifications/mo $499/mo ($0.050/ea)   │
│    Enterprise: Custom pricing                                │
│                                                              │
│  Report downloads:                                           │
│    Verification report PDF:  $0.25 per download              │
│    Bulk report generation:   $0.15 per report (50+ batch)    │
│                                                              │
│  Free tier:                                                  │
│    10 verifications/month (for evaluation)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Additional Revenue Streams

### 3.1 Premium Credential Templates

```
Template Marketplace:
  - Pre-designed credential templates: $5–25 per template
  - Custom template design service:   $200–500 one-time
  - Template categories:
    • Academic transcripts
    • Internship certificates
    • Event participation
    • Research publications
    • Club leadership
```

### 3.2 White-Label Solution

```
White-Label Pricing:
  - Setup fee:           $2,000 one-time
  - Monthly license:     $999/month
  - Includes:
    • Custom domain
    • Custom branding (logo, colors, fonts)
    • Custom email templates
    • Branded mobile app (optional: +$3,000)
    • Branded admin panel
    • Dedicated instance option
```

### 3.3 Integration Services

```
LMS Integration:
  - Moodle connector:           $500 setup + $50/mo
  - Canvas connector:           $500 setup + $50/mo
  - Blackboard connector:       $500 setup + $50/mo

ERP Integration:
  - Custom ERP connector:       $2,000–5,000 (project-based)
  
SSO Integration:
  - Included in Enterprise tier
  - Standalone: $200/month
```

### 3.4 Priority Support & SLA

```
Support Tiers:
  - Community (Free):     GitHub Discussions, 72h response
  - Standard (Campus):    Email support, 48h response
  - Priority (Enterprise): Dedicated Slack channel, 4h response
  - Premium (Add-on):     $299/month — 1h response, phone support
```

---

## 4. Revenue Projections

### Phase-Aligned Revenue Model

```
Phase 1: Closed Beta (Months 1–3)
  Revenue: $0
  Focus: Product validation, user feedback
  Users: 20–50 students, 1 institution

Phase 2: Single Campus Pilot (Months 4–6)
  Revenue: $0–99/month
  First paying customer (Campus tier)
  Users: 200–500 students

Phase 3: Multi-Department Expansion (Months 7–12)
  Revenue: $500–2,000/month
  - 3–5 Campus institutions: $300–500/mo
  - First recruiter API customers: $100–500/mo
  - Template sales: $100–500/mo
  Users: 1,000–3,000 students

Phase 4: Multi-Campus SaaS (Months 13–24)
  Revenue: $5,000–20,000/month
  - 10–20 Campus: $1,000–2,000/mo
  - 2–3 Enterprise: $1,000–1,500/mo
  - Recruiter API: $1,000–3,000/mo
  - Templates + integrations: $500–2,000/mo
  - White-label (if applicable): $1,000–2,000/mo
  Users: 10,000–50,000 students
```

### Monthly Recurring Revenue (MRR) Growth Target

```
Month     Target MRR    Cumulative Users
  3         $0            50
  6         $99           500
  9         $800          1,500
  12        $2,500        3,000
  18        $10,000       15,000
  24        $25,000       50,000
```

---

## 5. Cost Structure

### Monthly Infrastructure Costs (at Scale)

| Component | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|
| VPS / Cloud compute | $50 | $150 | $500 |
| PostgreSQL (managed) | $25 | $50 | $200 |
| Redis (managed) | $15 | $30 | $50 |
| S3 storage | $5 | $20 | $100 |
| Email service (SendGrid) | $0 (free) | $20 | $50 |
| Domain + SSL | $15 | $15 | $15 |
| Monitoring (Grafana Cloud) | $0 (free) | $30 | $100 |
| CDN | $0 | $10 | $50 |
| **Total** | **~$110** | **~$325** | **~$1,065** |

### Target Gross Margin: 75–85%

---

## 6. Conversion Strategy

### Free → Campus Upgrade Triggers

- Student count approaching 50 limit
- Need for more than 1 admin account
- Request for analytics or audit logs
- Credential template customization
- GitHub integration interest

### Campus → Enterprise Upgrade Triggers

- Student count approaching 2,000
- SSO requirement (institutional policy)
- API access for internal tools
- SLA requirements
- Multi-department/campus needs
- Compliance/audit requirements

### Recruiter Acquisition

- Partner with college placement cells
- Demo verification at career fairs
- Free tier (10 verifications) for evaluation
- Case studies showing time-to-verify reduction

---

## 7. Compliance Disclaimer

```
┌──────────────────────────────────────────────────────────────┐
│  IMPORTANT DISCLAIMER                                        │
│                                                              │
│  EduLink is a community-driven verification platform.        │
│  It is NOT a government-issued identity system.              │
│                                                              │
│  Credentials issued through EduLink are digitally signed     │
│  by participating institutions and can be cryptographically  │
│  verified. However, they do not replace official government  │
│  documents (Aadhaar, passport, etc.) or university-issued    │
│  mark sheets / degrees.                                      │
│                                                              │
│  EduLink provides a supplementary trust layer for            │
│  peer-to-peer and employer-to-student verification.          │
│                                                              │
│  This disclaimer is displayed:                               │
│    - During registration (consent required)                  │
│    - On all exported PDFs                                    │
│    - On the public verification page                         │
│    - In terms of service                                     │
└──────────────────────────────────────────────────────────────┘
```
