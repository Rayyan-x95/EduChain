# Admin Panel Architecture — EduLink (Next.js)

> Next.js 14 (App Router) | TypeScript | Tailwind CSS | shadcn/ui  
> Role-Based Dashboard for Institution Controllers

---

## Folder Structure

```
admin-panel/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (providers, theme)
│   │   ├── page.tsx                    # Redirect to /dashboard or /login
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                     # Auth routes (no sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx              # Centered auth layout
│   │   │
│   │   ├── (dashboard)/                # Protected routes (with sidebar)
│   │   │   ├── layout.tsx              # Dashboard shell (sidebar + topbar)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Analytics overview
│   │   │   │
│   │   │   ├── students/
│   │   │   │   ├── page.tsx            # Student list (filterable, searchable)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx        # Student detail + status management
│   │   │   │   └── pending/
│   │   │   │       └── page.tsx        # Pending verification queue
│   │   │   │
│   │   │   ├── appeals/
│   │   │   │   ├── page.tsx            # Appeals queue
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Appeal review page
│   │   │   │
│   │   │   ├── credentials/
│   │   │   │   ├── page.tsx            # Issued credentials list
│   │   │   │   ├── issue/
│   │   │   │   │   └── page.tsx        # Issue new credential form
│   │   │   │   ├── templates/
│   │   │   │   │   ├── page.tsx        # Credential templates list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx    # Edit template
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Credential detail (revoke, versions)
│   │   │   │
│   │   │   ├── keys/
│   │   │   │   └── page.tsx            # Key management (generate, rotate, list)
│   │   │   │
│   │   │   ├── roles/
│   │   │   │   └── page.tsx            # Role assignment management
│   │   │   │
│   │   │   ├── audit-logs/
│   │   │   │   └── page.tsx            # Audit log viewer (filterable)
│   │   │   │
│   │   │   ├── community/
│   │   │   │   ├── page.tsx            # Community overview
│   │   │   │   ├── badges/
│   │   │   │   │   └── page.tsx        # Badge management
│   │   │   │   └── reputation/
│   │   │   │       └── page.tsx        # Reputation overview + overrides
│   │   │   │
│   │   │   ├── recruiters/
│   │   │   │   └── page.tsx            # Recruiter activity & portal management
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx            # Institution settings
│   │   │       └── profile/
│   │   │           └── page.tsx        # Admin profile
│   │   │
│   │   └── api/                        # Next.js API routes (BFF proxy - optional)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   │
│   ├── components/                     # Shared components
│   │   ├── ui/                         # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx             # Navigation sidebar
│   │   │   ├── topbar.tsx              # Top header (user menu, notifications)
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx         # Overview stat cards
│   │   │   ├── verification-chart.tsx  # Verification trend chart
│   │   │   ├── recent-activity.tsx     # Recent audit log entries
│   │   │   └── pending-actions.tsx     # Items needing attention
│   │   │
│   │   ├── students/
│   │   │   ├── student-table.tsx       # Data table with pagination
│   │   │   ├── student-filters.tsx     # Status, program, year filters
│   │   │   ├── student-detail-card.tsx
│   │   │   ├── status-update-dialog.tsx # Approve/Reject with reason
│   │   │   └── student-search.tsx
│   │   │
│   │   ├── credentials/
│   │   │   ├── credential-table.tsx
│   │   │   ├── issue-credential-form.tsx
│   │   │   ├── revoke-dialog.tsx
│   │   │   ├── template-builder.tsx    # Visual template builder
│   │   │   └── version-timeline.tsx    # Version history display
│   │   │
│   │   ├── appeals/
│   │   │   ├── appeal-queue.tsx
│   │   │   ├── appeal-detail.tsx
│   │   │   └── review-form.tsx
│   │   │
│   │   ├── keys/
│   │   │   ├── key-list.tsx
│   │   │   ├── generate-key-dialog.tsx
│   │   │   ├── rotate-key-dialog.tsx
│   │   │   └── key-status-badge.tsx
│   │   │
│   │   └── shared/
│   │       ├── data-table.tsx          # Generic sortable/filterable table
│   │       ├── pagination.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── date-range-picker.tsx
│   │       └── export-button.tsx
│   │
│   ├── lib/                            # Utilities & services
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance with interceptors
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   ├── students.ts            # Student API calls
│   │   │   ├── credentials.ts         # Credential API calls
│   │   │   ├── appeals.ts             # Appeal API calls
│   │   │   ├── keys.ts                # Key management API calls
│   │   │   ├── audit.ts               # Audit log API calls
│   │   │   ├── community.ts           # Community/reputation API calls
│   │   │   └── recruiters.ts          # Recruiter API calls
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-auth.ts            # Auth context hook
│   │   │   ├── use-students.ts        # SWR/React Query for students
│   │   │   ├── use-credentials.ts
│   │   │   ├── use-appeals.ts
│   │   │   ├── use-audit-logs.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── use-pagination.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth-store.ts          # Zustand auth state
│   │   │   └── ui-store.ts            # Sidebar state, theme
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                  # clsx + twMerge utility
│   │   │   ├── format.ts             # Date, number formatters
│   │   │   ├── validators.ts          # Form validation schemas (Zod)
│   │   │   └── constants.ts           # App constants
│   │   │
│   │   └── types/
│   │       ├── api.ts                 # API response types
│   │       ├── user.ts                # User/Student types
│   │       ├── credential.ts          # Credential types
│   │       ├── appeal.ts              # Appeal types
│   │       ├── audit.ts               # Audit log types
│   │       └── institution.ts         # Institution types
│   │
│   ├── providers/
│   │   ├── auth-provider.tsx           # JWT auth context
│   │   ├── query-provider.tsx          # TanStack Query provider
│   │   ├── theme-provider.tsx          # Dark/light mode
│   │   └── toast-provider.tsx          # Toast notifications
│   │
│   └── middleware.ts                   # Next.js middleware (auth redirect)
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Key Dependencies (`package.json`)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",

    // UI
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.300.0",

    // Data Fetching
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",

    // State
    "zustand": "^4.5.0",

    // Forms
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",

    // Charts
    "recharts": "^2.10.0",

    // Date
    "date-fns": "^3.0.0",

    // Auth
    "jose": "^5.2.0"
  }
}
```

---

## Role-Based Sidebar Configuration

```typescript
// lib/utils/navigation.ts

import {
  LayoutDashboard, Users, FileCheck, Award,
  Key, Shield, ScrollText, Building, Search,
  Settings, BadgeCheck
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType;
  roles: string[];        // which roles can see this
  badge?: number;          // notification count
};

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'VERIFICATION_OFFICER', 'CREDENTIAL_OFFICER', 'VIEWER'],
  },
  {
    label: 'Students',
    href: '/students',
    icon: Users,
    roles: ['SUPER_ADMIN', 'VERIFICATION_OFFICER', 'VIEWER'],
  },
  {
    label: 'Pending Verification',
    href: '/students/pending',
    icon: FileCheck,
    roles: ['SUPER_ADMIN', 'VERIFICATION_OFFICER'],
  },
  {
    label: 'Appeals',
    href: '/appeals',
    icon: Shield,
    roles: ['SUPER_ADMIN', 'VERIFICATION_OFFICER'],
  },
  {
    label: 'Credentials',
    href: '/credentials',
    icon: Award,
    roles: ['SUPER_ADMIN', 'CREDENTIAL_OFFICER', 'VIEWER'],
  },
  {
    label: 'Issue Credential',
    href: '/credentials/issue',
    icon: BadgeCheck,
    roles: ['SUPER_ADMIN', 'CREDENTIAL_OFFICER'],
  },
  {
    label: 'Key Management',
    href: '/keys',
    icon: Key,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Roles',
    href: '/roles',
    icon: Shield,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: ScrollText,
    roles: ['SUPER_ADMIN', 'VIEWER'],
  },
  {
    label: 'Community',
    href: '/community',
    icon: Users,
    roles: ['SUPER_ADMIN', 'VIEWER'],
  },
  {
    label: 'Recruiters',
    href: '/recruiters',
    icon: Search,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN'],
  },
];
```

---

## Middleware — Auth Guard

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/login', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for JWT token
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub as string);
    response.headers.set('x-user-role', payload.role as string);
    response.headers.set('x-institution-id', payload.institution_id as string);

    return response;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Dashboard Analytics Page Example

```typescript
// src/app/(dashboard)/dashboard/page.tsx

import { StatsCards } from '@/components/dashboard/stats-cards';
import { VerificationChart } from '@/components/dashboard/verification-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { PendingActions } from '@/components/dashboard/pending-actions';

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your institution's verification activity
        </p>
      </div>

      {/* KPI Cards: Total Students, Verified, Pending, Credentials Issued */}
      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verification trend (line chart) */}
        <VerificationChart />

        {/* Items needing attention: pending verifications, appeals */}
        <PendingActions />
      </div>

      {/* Recent audit log entries */}
      <RecentActivity />
    </div>
  );
}
```

---

## API Client Configuration

```typescript
// src/lib/api/client.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.edulink.dev/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        localStorage.setItem('access_token', data.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;

        return apiClient(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```
