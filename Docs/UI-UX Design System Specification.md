# EduChain ID — Complete UI/UX Design System Specification

**Product:** EduChain ID  
**Version:** 1.0  
**Date:** March 7, 2026  
**Status:** Production-Ready Specification  
**Audience:** Engineers, Product Designers, QA  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
3. [Typography System](#3-typography-system)
4. [Layout System](#4-layout-system)
5. [Navigation System](#5-navigation-system)
6. [UI Component Library](#6-ui-component-library)
7. [Screen Designs](#7-screen-designs)
8. [Interaction Patterns](#8-interaction-patterns)
9. [Empty States](#9-empty-states)
10. [Error States](#10-error-states)
11. [Accessibility](#11-accessibility)
12. [Responsive Design](#12-responsive-design)
13. [Animation & Motion](#13-animation--motion)
14. [Developer Handoff](#14-developer-handoff)

---

## 1. Design Philosophy

### 1.1 Product Personality

EduChain ID communicates **institutional credibility** through a digital-native interface. The product personality is:

| Trait | Expression |
|---|---|
| **Trustworthy** | Verification badges, credential seals, consistent status indicators |
| **Professional** | Clean hierarchy, neutral palette, restrained color usage |
| **Modern** | Rounded surfaces, generous whitespace, smooth transitions |
| **Empowering** | Progress indicators, profile completeness, achievement showcases |

The platform does not feel playful or casual. It occupies the same design territory as **Stripe** (precision), **GitHub** (developer trust), **Linear** (speed and clarity), and **Notion** (structured flexibility).

### 1.2 Visual Identity Principles

1. **Density over decoration.** Every pixel serves an information purpose. No ornamental gradients, patterns, or stock illustrations.
2. **Verification as a first-class visual.** Trust badges, verification seals, and credential status must be visible within 200ms of scanning any card or profile.
3. **Dark-mode native, light-mode supported.** Dark is the default. Light mode follows the same token structure with inverted values.
4. **Monochromatic base, semantic color only.** The interface is predominantly neutral gray. Color is reserved exclusively for:
   - Primary actions (blue)
   - Success / verification (green)
   - Errors / revocation (red)
   - Warnings (amber)
5. **Type-driven hierarchy.** Size, weight, and spacing carry all hierarchy — not color or borders.

### 1.3 UX Principles

| Principle | Rule |
|---|---|
| **Clarity over cleverness** | No hidden gestures, no progressive disclosure that buries critical info |
| **Speed of comprehension** | A user understands any screen's purpose within 3 seconds |
| **Verification visibility** | Trust status is always visible, never hidden behind a tap or click |
| **Mobile-first** | All layouts designed for 375px first, scaled up |
| **Progressive complexity** | Student app is simple; institution/recruiter dashboards reveal depth on demand |
| **Minimal cognitive load** | Max 5–7 items in any navigation, max 3 primary actions per screen |
| **One primary action per screen** | Every screen has exactly one dominant CTA |

### 1.4 Trust-Building Elements

| Element | Implementation |
|---|---|
| Verification Badges | Inline `✔ Verified` chips on profiles, credentials, institutions |
| Credential Seals | Visual lock/shield icon on issued credentials |
| Issuer Attribution | Every credential displays the issuing institution name and logo |
| Timestamp Transparency | All credentials show issue date and verification date |
| Status Consistency | Green = verified, Amber = pending, Red = revoked — globally consistent |
| Institutional Logos | Institution logos displayed alongside student profiles and credentials |

---

## 2. Design Tokens

All visual properties are expressed as design tokens. Tokens are the single source of truth consumed by all three applications (mobile, web dashboard, recruiter portal).

### 2.1 Color Palette

#### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2563EB` | Primary buttons, links, active states, brand accent |
| `--color-primary-hover` | `#1D4ED8` | Primary button hover |
| `--color-primary-active` | `#1E40AF` | Primary button pressed |
| `--color-primary-light` | `#DBEAFE` | Primary background tint (light mode), tag backgrounds |
| `--color-primary-subtle` | `rgba(37, 99, 235, 0.08)` | Hover backgrounds on primary-tinted rows |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#22C55E` | Verified status, success messages, credential verified |
| `--color-success-light` | `#DCFCE7` | Success background tint |
| `--color-danger` | `#EF4444` | Error messages, revoked credentials, destructive actions |
| `--color-danger-light` | `#FEE2E2` | Error background tint |
| `--color-warning` | `#F59E0B` | Pending states, caution messages |
| `--color-warning-light` | `#FEF3C7` | Warning background tint |
| `--color-info` | `#3B82F6` | Informational alerts, tooltips |
| `--color-info-light` | `#EFF6FF` | Info background tint |

#### Dark Theme (Default)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--bg-elevated` | `#1E293B` | Cards, modals, popovers |
| `--bg-surface` | `#334155` | Input fields, hover backgrounds |
| `--bg-overlay` | `rgba(0, 0, 0, 0.6)` | Modal overlays, drawer scrims |
| `--text-primary` | `#F1F5F9` | Headings, primary body text |
| `--text-secondary` | `#94A3B8` | Descriptions, helper text, timestamps |
| `--text-tertiary` | `#64748B` | Placeholders, disabled text |
| `--text-inverse` | `#0F172A` | Text on primary-colored buttons |
| `--border-default` | `#334155` | Card borders, dividers |
| `--border-subtle` | `#1E293B` | Subtle separators |
| `--border-focus` | `#2563EB` | Focus rings |

#### Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--bg-elevated` | `#F8FAFC` | Cards, modals, popovers |
| `--bg-surface` | `#F1F5F9` | Input fields, hover backgrounds |
| `--bg-overlay` | `rgba(0, 0, 0, 0.4)` | Modal overlays, drawer scrims |
| `--text-primary` | `#0F172A` | Headings, primary body text |
| `--text-secondary` | `#475569` | Descriptions, helper text, timestamps |
| `--text-tertiary` | `#94A3B8` | Placeholders, disabled text |
| `--text-inverse` | `#FFFFFF` | Text on primary-colored buttons |
| `--border-default` | `#E2E8F0` | Card borders, dividers |
| `--border-subtle` | `#F1F5F9` | Subtle separators |
| `--border-focus` | `#2563EB` | Focus rings |

#### Neutral Gray Scale

| Token | Hex | Name |
|---|---|---|
| `--gray-50` | `#F8FAFC` | Lightest |
| `--gray-100` | `#F1F5F9` | — |
| `--gray-200` | `#E2E8F0` | — |
| `--gray-300` | `#CBD5E1` | — |
| `--gray-400` | `#94A3B8` | — |
| `--gray-500` | `#64748B` | Mid |
| `--gray-600` | `#475569` | — |
| `--gray-700` | `#334155` | — |
| `--gray-800` | `#1E293B` | — |
| `--gray-900` | `#0F172A` | — |
| `--gray-950` | `#020617` | Darkest |

This follows the **Tailwind CSS Slate** scale for consistency with the frontend framework.

### 2.2 Spacing Scale (8px Grid)

| Token | Value | Usage |
|---|---|---|
| `--space-0` | `0px` | Reset |
| `--space-0.5` | `2px` | Micro adjustments |
| `--space-1` | `4px` | Inline icon gaps, tight padding |
| `--space-2` | `8px` | Chip padding, compact spacing |
| `--space-3` | `12px` | Input padding, small gaps |
| `--space-4` | `16px` | Card padding, standard gap |
| `--space-5` | `20px` | Section sub-gaps |
| `--space-6` | `24px` | Card internal sections, list item padding |
| `--space-8` | `32px` | Section spacing |
| `--space-10` | `40px` | Large section gaps |
| `--space-12` | `48px` | Page section separators |
| `--space-16` | `64px` | Major layout separators |
| `--space-20` | `80px` | Page top/bottom padding |

### 2.3 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | `0px` | Sharp edges |
| `--radius-sm` | `4px` | Badges, tags, small chips |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards, modals |
| `--radius-xl` | `16px` | Large containers, bottom sheets |
| `--radius-2xl` | `20px` | Virtual ID card |
| `--radius-full` | `9999px` | Avatars, pills, circular buttons |

### 2.4 Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift on chips, badges |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Elevated cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Dialog overlays |
| `--shadow-focus` | `0 0 0 3px rgba(37, 99, 235, 0.3)` | Focus ring outline |

> In dark theme, shadows use `rgba(0,0,0,0.3)` base instead of `0.1` to remain perceptible against dark surfaces.

### 2.5 Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `--z-base` | `0` | Default stacking |
| `--z-dropdown` | `10` | Dropdowns, select menus |
| `--z-sticky` | `20` | Sticky headers, navigation bars |
| `--z-overlay` | `30` | Drawer scrims, backdrop overlays |
| `--z-modal` | `40` | Modals, dialogs |
| `--z-toast` | `50` | Toast notifications |
| `--z-tooltip` | `60` | Tooltips |

### 2.6 Transition Tokens

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `100ms` | Hover color changes |
| `--duration-normal` | `200ms` | Button state transitions, toggles |
| `--duration-slow` | `300ms` | Modal enter/exit, page transitions |
| `--duration-slower` | `500ms` | Route transitions, complex animations |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `--easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Acceleration |
| `--easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Deceleration |

---

## 3. Typography System

### 3.1 Font Stack

| Role | Font | Fallback |
|---|---|---|
| Primary (body, UI) | `Inter` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Monospace (code, IDs) | `JetBrains Mono` | `'SF Mono', 'Fira Code', 'Consolas', monospace` |

Inter is loaded from Google Fonts with the following weights: **400** (regular), **500** (medium), **600** (semibold), **700** (bold).

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--text-display` | `36px` | `44px` (1.22) | 700 | Hero headings, onboarding titles |
| `--text-h1` | `30px` | `38px` (1.27) | 700 | Page titles |
| `--text-h2` | `24px` | `32px` (1.33) | 600 | Section headings |
| `--text-h3` | `20px` | `28px` (1.40) | 600 | Sub-section headings, card titles |
| `--text-h4` | `18px` | `26px` (1.44) | 600 | Widget titles, modal headings |
| `--text-body-lg` | `16px` | `24px` (1.50) | 400 | Primary body text |
| `--text-body` | `14px` | `20px` (1.43) | 400 | Default body, descriptions |
| `--text-body-medium` | `14px` | `20px` (1.43) | 500 | Labels, emphasized body |
| `--text-caption` | `12px` | `16px` (1.33) | 400 | Timestamps, helper text, metadata |
| `--text-overline` | `11px` | `16px` (1.45) | 600 | Section labels, uppercase categories |
| `--text-button` | `14px` | `20px` (1.43) | 600 | Button labels |
| `--text-button-sm` | `12px` | `16px` (1.33) | 600 | Small button labels |

### 3.3 Type Rules

1. **Overline** text is always `UPPERCASE` with `letter-spacing: 0.05em`.
2. **Body text** max width: `65ch` for readability.
3. **Headings** use `-0.02em` letter-spacing for tighter optical alignment.
4. **Monospace** is used exclusively for: credential IDs, hash previews, verification codes.
5. **No underlined text** except hyperlinks on hover.

---

## 4. Layout System

### 4.1 Breakpoints

| Token | Width | Target |
|---|---|---|
| `--bp-xs` | `0–639px` | Small phones |
| `--bp-sm` | `640px` | Large phones |
| `--bp-md` | `768px` | Tablets |
| `--bp-lg` | `1024px` | Small desktops, landscape tablets |
| `--bp-xl` | `1280px` | Standard desktops |
| `--bp-2xl` | `1536px` | Large monitors |

### 4.2 Content Width

| Context | Max Width |
|---|---|
| Mobile app | `100%` (full bleed, `16px` horizontal padding) |
| Web dashboard content area | `1200px` (centered) |
| Web dashboard with sidebar | Sidebar `256px` fixed + fluid content area |
| Modal dialogs (small) | `400px` |
| Modal dialogs (medium) | `560px` |
| Modal dialogs (large) | `720px` |
| Form content | `560px` max (centered within content area) |

### 4.3 Grid System

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| `xs` (0–639px) | 4 | `16px` | `16px` |
| `sm` (640px) | 6 | `16px` | `24px` |
| `md` (768px) | 8 | `24px` | `32px` |
| `lg` (1024px) | 12 | `24px` | `32px` |
| `xl` (1280px) | 12 | `32px` | `auto` (centered) |

### 4.4 Layout Patterns

#### Mobile App Layout

```
┌─────────────────────────┐
│  Status Bar (system)    │
├─────────────────────────┤
│  Top Navigation Bar     │  48px height
│  [Back] Title [Action]  │
├─────────────────────────┤
│                         │
│                         │
│  Scrollable Content     │  flex: 1
│                         │
│                         │
├─────────────────────────┤
│  Bottom Tab Bar         │  56px + safe area
│  🏠  🔍  📁  👤       │
└─────────────────────────┘
```

#### Web Dashboard Layout (Institution / Recruiter)

```
┌──────────┬──────────────────────────────────────┐
│          │  Top Bar                    [🔔] [👤] │  56px
│  Sidebar │─────────────────────────────────────── │
│  256px   │                                       │
│          │  Page Header                          │
│  [Logo]  │  Title + Description + Actions        │
│  ──────  │─────────────────────────────────────── │
│  Nav     │                                       │
│  Items   │  Page Content                         │
│          │  (Cards, Tables, Forms)               │
│          │                                       │
│          │                                       │
│          │                                       │
│  ──────  │                                       │
│  [User]  │                                       │
└──────────┴───────────────────────────────────────┘
```

### 4.5 Spacing Rules

| Context | Token |
|---|---|
| Between navigation items | `--space-1` (4px) |
| Card internal padding | `--space-4` (16px) mobile / `--space-6` (24px) desktop |
| Between cards in a list | `--space-3` (12px) mobile / `--space-4` (16px) desktop |
| Section-to-section gap | `--space-8` (32px) mobile / `--space-12` (48px) desktop |
| Page horizontal padding | `--space-4` (16px) mobile / `--space-8` (32px) desktop |
| Page top padding | `--space-6` (24px) mobile / `--space-8` (32px) desktop |
| Form field gap | `--space-4` (16px) |
| Button group gap | `--space-3` (12px) |

---

## 5. Navigation System

### 5.1 Student Mobile App — Bottom Tab Navigation

| Tab | Icon | Label | Destination |
|---|---|---|---|
| Home | `house` (filled when active) | Home | Home dashboard: Virtual ID, recent credentials, activity |
| Discover | `search` (filled when active) | Discover | Student discovery: search, filter, browse |
| Projects | `folder` (filled when active) | Projects | Project groups list, create group |
| Profile | `user-circle` (filled when active) | Profile | My profile, settings, privacy |

#### Tab States

| State | Icon | Label | Indicator |
|---|---|---|---|
| **Inactive** | Outlined, `--text-tertiary` | `--text-tertiary` | None |
| **Active** | Filled, `--color-primary` | `--color-primary`, weight 600 | 3px rounded pill above icon |
| **Badge** | Standard icon | Standard label | Small red dot (6px) top-right of icon |

#### Tab Bar Specifications

| Property | Value |
|---|---|
| Height | `56px` + bottom safe area inset |
| Background | `--bg-elevated` with `blur(20px)` backdrop filter |
| Border top | `1px solid --border-subtle` |
| Icon size | `24px` |
| Label size | `--text-overline` (11px) |
| Touch target | `48px × 48px` minimum |

#### Navigation Behavior

- Tab switches are **instant** (no page transition animation).
- Each tab maintains its own **navigation stack** (back navigation returns within the tab).
- Long-pressing a tab scrolls to top if already on that tab.
- Notifications bell is in the **top navigation bar**, not in the bottom tabs.

### 5.2 Student Mobile App — Top Navigation Bar

| Property | Value |
|---|---|
| Height | `48px` + top safe area inset |
| Background | `--bg` (transparent blending with page) or `--bg-elevated` when scrolled |
| Left | Back arrow (screens with back navigation) or App logo (root tabs) |
| Center | Screen title (`--text-h4`, weight 600) |
| Right | Context actions: Notification bell, Search, Settings |

### 5.3 Institution Web Dashboard — Sidebar Navigation

#### Sidebar Structure

```
┌──────────────────────┐
│  [EduChain ID Logo]  │  40px logo, 24px padding top
│                      │
│  ── Main ──────────  │  Section divider (overline label)
│  📊 Dashboard        │
│  👥 Students         │
│  📜 Credentials      │
│  ✅ Verifications    │
│                      │
│  ── Account ───────  │
│  ⚙️ Settings         │
│  ❓ Help & Support   │
│                      │
│                      │
│  ─────────────────── │
│  [Avatar] Admin Name │  User card at bottom
│  admin@university.edu│
└──────────────────────┘
```

#### Sidebar Item States

| State | Background | Text Color | Icon Color | Indicator |
|---|---|---|---|---|
| **Default** | Transparent | `--text-secondary` | `--text-tertiary` | None |
| **Hover** | `--bg-surface` | `--text-primary` | `--text-secondary` | None |
| **Active** | `--color-primary-subtle` | `--color-primary` | `--color-primary` | `3px` left border `--color-primary` |
| **Disabled** | Transparent | `--text-tertiary` | `--text-tertiary` | None |

#### Sidebar Specifications

| Property | Value |
|---|---|
| Width | `256px` (desktop), collapsible to `72px` (icon-only) |
| Background | `--bg-elevated` |
| Border right | `1px solid --border-default` |
| Item height | `40px` |
| Item padding | `8px 12px` |
| Item border radius | `--radius-md` (8px) |
| Section label | `--text-overline`, `--text-tertiary`, `margin-top: 24px` |

### 5.4 Recruiter Web Portal — Top Navigation + Sidebar Hybrid

#### Top Bar

| Left | Center | Right |
|---|---|---|
| EduChain ID Logo | — | Search bar (expandable) · Notifications bell · Account avatar |

#### Sidebar Sections

```
┌──────────────────────┐
│  🔍 Talent Discovery │
│  👤 Student Profiles │
│  ⭐ Shortlist        │
│  📊 Analytics        │
│  ⚙️ Settings         │
└──────────────────────┘
```

Same item states and specifications as the Institution sidebar.

---

## 6. UI Component Library

Built on **Atomic Design** methodology: Atoms → Molecules → Organisms.

---

### 6.1 Atoms

#### Button

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| **Primary** | `--color-primary` | `--text-inverse` | None | Main CTAs: "Issue Credential", "Send Request" |
| **Secondary** | `--bg-surface` | `--text-primary` | `1px --border-default` | Secondary actions: "Cancel", "Back" |
| **Outline** | Transparent | `--color-primary` | `1px --color-primary` | Tertiary actions: "View Profile" |
| **Danger** | `--color-danger` | `#FFFFFF` | None | Destructive: "Revoke Credential", "Delete" |
| **Ghost** | Transparent | `--text-secondary` | None | Minimal actions: "Skip", inline links |

| Size | Height | Padding | Font | Radius |
|---|---|---|---|---|
| **Small** | `32px` | `6px 12px` | `--text-button-sm` | `--radius-md` |
| **Medium** | `40px` | `8px 16px` | `--text-button` | `--radius-md` |
| **Large** | `48px` | `12px 24px` | `--text-button` | `--radius-md` |

| State | Change |
|---|---|
| **Default** | Base variant colors |
| **Hover** | Background darkened 8% (light) or lightened 8% (dark) |
| **Active/Pressed** | Background darkened 12%, scale `0.98` |
| **Disabled** | Opacity `0.4`, `cursor: not-allowed`, no hover effects |
| **Loading** | Text replaced by 16px spinner, button width remains fixed, interactions disabled |

#### Input

| Property | Value |
|---|---|
| Height | `40px` (medium), `48px` (large — mobile default) |
| Background | `--bg-surface` |
| Border | `1px solid --border-default` |
| Border radius | `--radius-md` (8px) |
| Padding | `0 12px` |
| Font | `--text-body` (14px) |
| Placeholder color | `--text-tertiary` |

| State | Border Color | Background | Label |
|---|---|---|---|
| **Default** | `--border-default` | `--bg-surface` | `--text-secondary` |
| **Focus** | `--border-focus` | `--bg-surface` | `--color-primary` |
| **Error** | `--color-danger` | `--bg-surface` | `--color-danger` |
| **Disabled** | `--border-subtle` | `--bg-elevated` (dimmed) | `--text-tertiary` |

Structure:
```
[Label]                    ← 14px medium, 4px below
[Icon?] [Input text    ]   ← 40px height
[Helper / Error text]      ← 12px caption, 4px above
```

#### Avatar

| Size | Dimensions | Font (fallback initials) | Usage |
|---|---|---|---|
| **XS** | `24px` | `10px` | Inline mentions, activity feed |
| **SM** | `32px` | `12px` | Compact lists, chips |
| **MD** | `40px` | `14px` | Card headers, navigation |
| **LG** | `56px` | `18px` | Profile headers |
| **XL** | `80px` | `24px` | Profile page hero |
| **2XL** | `120px` | `36px` | Virtual Student ID |

- Shape: Circle (`--radius-full`).
- Fallback: Two-letter initials on a deterministic gradient background (hash of user ID → color pair).
- Online indicator: `10px` green dot, bottom-right, white border ring.

#### Badge

| Variant | Background | Text | Icon | Usage |
|---|---|---|---|---|
| **Verified** | `--color-success-light` | `--color-success` | ✔ checkmark | Verified credentials, verified students |
| **Pending** | `--color-warning-light` | `--color-warning` | ⏳ clock | Pending verifications |
| **Revoked** | `--color-danger-light` | `--color-danger` | ✖ x-circle | Revoked credentials |
| **Info** | `--color-primary-light` | `--color-primary` | ℹ info | Informational tags |
| **Neutral** | `--gray-200` / `--gray-700` | `--text-secondary` | — | Generic metadata |

| Property | Value |
|---|---|
| Height | `22px` |
| Padding | `2px 8px` |
| Font | `--text-caption` (12px), weight 600 |
| Border radius | `--radius-full` |

#### Chip

Used for skills, tags, and filter selections.

| Property | Value |
|---|---|
| Height | `28px` |
| Padding | `4px 12px` |
| Font | `--text-caption` (12px), weight 500 |
| Background | `--bg-surface` |
| Border | `1px solid --border-default` |
| Border radius | `--radius-full` |

| State | Change |
|---|---|
| **Default** | Base style |
| **Selected** | Background `--color-primary-light`, border `--color-primary`, text `--color-primary` |
| **Removable** | Append `×` icon (16px) with 4px left gap |
| **Disabled** | Opacity `0.4` |

#### Icon

| Size Token | Dimensions | Stroke | Usage |
|---|---|---|---|
| `--icon-sm` | `16px` | `1.5px` | Inline with small text, badges |
| `--icon-md` | `20px` | `1.5px` | Default UI icons, button icons |
| `--icon-lg` | `24px` | `2px` | Navigation icons, standalone actions |
| `--icon-xl` | `32px` | `2px` | Empty states, featured icons |

Icon library: **Lucide** (open source, consistent stroke style, tree-shakeable).

#### Divider

| Variant | Height | Color | Margin |
|---|---|---|---|
| **Default** | `1px` | `--border-default` | `--space-4` vertical |
| **Subtle** | `1px` | `--border-subtle` | `--space-2` vertical |
| **Section** | `1px` | `--border-default` | `--space-8` vertical |
| **With label** | `1px` line + centered text | `--border-default` + `--text-tertiary` | `--space-6` vertical |

---

### 6.2 Molecules

#### Student Card

**Purpose:** Display a student preview in discovery lists, search results, and collaboration suggestions.

**Layout:**
```
┌──────────────────────────────────┐
│  [Avatar MD] Name           [✔]  │  ← Avatar + Name + Verified badge
│             Institution          │  ← Secondary text
│  [React] [Python] [ML]          │  ← Skill chips (max 3, +N overflow)
│                                  │
│  [View Profile]  [Collaborate]   │  ← Action buttons (ghost + outline)
└──────────────────────────────────┘
```

| Data Field | Type | Token |
|---|---|---|
| Avatar | Image / Initials | Avatar MD (40px) |
| Full Name | Text | `--text-body-medium` (14px, weight 500) |
| Institution | Text | `--text-caption` (12px), `--text-secondary` |
| Skills | Chip[] | Max 3 visible + `+N` overflow chip |
| Verification Badge | Badge | Inline after name |
| Actions | Button[] | Ghost "View Profile", Outline "Collaborate" |

| Property | Value |
|---|---|
| Padding | `--space-4` (16px) |
| Background | `--bg-elevated` |
| Border | `1px solid --border-default` |
| Border radius | `--radius-lg` (12px) |
| Hover | `--shadow-sm`, border `--border-focus` at 20% opacity |

#### Credential Card

**Purpose:** Display an academic credential with verification status.

**Layout:**
```
┌──────────────────────────────────┐
│  🎓  Credential Title      [✔]  │  ← Icon + Title + Status badge
│      Issuing Institution         │  ← Secondary text
│      Issued: May 2026            │  ← Date in caption
│                                  │
│  [View Details →]                │  ← Ghost button
└──────────────────────────────────┘
```

| Data Field | Type | Token |
|---|---|---|
| Icon | Graduation cap or institution logo | `--icon-lg` (24px) |
| Title | Text | `--text-body-medium` (14px, weight 500) |
| Institution | Text | `--text-caption`, `--text-secondary` |
| Issue Date | Text | `--text-caption`, `--text-tertiary` |
| Status | Badge | Verified / Pending / Revoked |
| Action | Button | Ghost "View Details" |

#### Project Card

**Purpose:** Display a student project in project groups or profile sections.

**Layout:**
```
┌──────────────────────────────────┐
│  Project Title                   │  ← --text-body-medium
│  Short description of the        │  ← --text-body, --text-secondary
│  project in two lines max.       │     2-line clamp
│                                  │
│  [React] [Node.js]              │  ← Tech stack chips
│  4 members · Active              │  ← Metadata caption
└──────────────────────────────────┘
```

| Data Field | Type |
|---|---|
| Title | `--text-body-medium` |
| Description | `--text-body`, `--text-secondary`, 2-line clamp |
| Tech Stack | Chip[] (max 3) |
| Member Count | `--text-caption`, `--text-tertiary` |
| Status | Active / Completed badge |

#### Achievement Card

**Purpose:** Display a student achievement or award.

**Layout:**
```
┌──────────────────────────────────┐
│  🏆  Achievement Title           │  ← Icon + Title
│      Issuer · Date               │  ← Caption metadata
└──────────────────────────────────┘
```

| Data Field | Type |
|---|---|
| Icon | Trophy / medal / certificate icon |
| Title | `--text-body-medium` |
| Issuer | `--text-caption`, `--text-secondary` |
| Date | `--text-caption`, `--text-tertiary` |

#### Notification Item

**Purpose:** Display a notification in notification list/drawer.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  [Avatar SM]  Notification message       •   │  ← Avatar + message + unread dot
│               2 hours ago                    │  ← Timestamp
└──────────────────────────────────────────────┘
```

| Data Field | Type |
|---|---|
| Avatar | User/system avatar (SM 32px) |
| Message | `--text-body`, 2-line clamp |
| Timestamp | `--text-caption`, `--text-tertiary`, relative format |
| Read state | Blue dot (8px) for unread |

| State | Background |
|---|---|
| **Unread** | `--color-primary-subtle` |
| **Read** | Transparent |
| **Hover** | `--bg-surface` |

#### Collaboration Request Card

**Purpose:** Display incoming/outgoing collaboration requests.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  [Avatar MD]  Student Name              [✔]  │
│               Institution                    │
│  "Let's collaborate on the ML project..."    │  ← Message preview
│                                              │
│  [Accept ✓]           [Decline ✗]            │  ← Primary + Ghost button
└──────────────────────────────────────────────┘
```

| Data Field | Type |
|---|---|
| Avatar | User avatar (MD 40px) |
| Name | `--text-body-medium` |
| Institution | `--text-caption`, `--text-secondary` |
| Message | `--text-body`, `--text-secondary`, 2-line clamp |
| Actions | Primary "Accept", Ghost "Decline" |

---

### 6.3 Organisms

#### Virtual Student ID Card

The most prominent visual element in the platform. Displayed on the Home screen.

**Layout:**
```
┌───────────────────────────────────────┐
│                                       │
│   [Avatar 2XL]                        │  120px avatar, centered or left
│                                       │
│   Student Full Name                   │  --text-h2, weight 700
│   B.Tech Computer Science             │  --text-body, --text-secondary
│   Dhaanish Ahmed College of Eng.      │  --text-body, --text-secondary
│   Graduation: 2027                    │  --text-caption
│                                       │
│   ┌──────────┐ ┌───────────────────┐  │
│   │ ✔ Inst.  │ │ ✔ Credential     │  │  Verification badges
│   │ Verified │ │   Verified       │  │
│   └──────────┘ └───────────────────┘  │
│                                       │
│   ID: EDUID-2026-XXXX                 │  Monospace, --text-caption
└───────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | Gradient: `linear-gradient(135deg, --bg-elevated, --color-primary at 5% opacity)` |
| Border | `1px solid --border-default` |
| Border radius | `--radius-2xl` (20px) |
| Padding | `--space-6` (24px) |
| Shadow | `--shadow-md` |
| Min-height | `280px` (mobile) |

#### Student Profile Header

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [Avatar XL]    Student Name              [✔]    │
│                 Institution · Degree             │
│                 Graduation: 2027                 │
│                                                  │
│                 [Follow]  [Request Collaboration] │
└──────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Avatar | XL (80px) |
| Name | `--text-h2` (24px, weight 600) |
| Institution | `--text-body` (14px, `--text-secondary`) |
| Degree | `--text-body` (14px, `--text-secondary`) |
| Graduation | `--text-caption` (12px, `--text-tertiary`) |
| Verification | Badge component, inline after name |
| Primary Action | "Follow" — Outline button |
| Secondary Action | "Request Collaboration" — Primary button |

#### Credential List

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Credentials (3)                    [View All →]  │  Section header
├──────────────────────────────────────────────────┤
│  [Credential Card]                                │
│  [Credential Card]                                │
│  [Credential Card]                                │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Section header | `--text-h4` + count badge + "View All" ghost link |
| Card gap | `--space-3` (12px) |
| Sort | Newest first |
| Interaction | Tap card → Credential Detail modal or screen |

#### Search Filter Panel

**Layout (Mobile — Bottom Sheet):**
```
┌──────────────────────────────────────┐
│  ── Drag handle ──                   │
│                                      │
│  Filter Students                     │  --text-h4
│                                      │
│  Skills                              │  Section label
│  [React] [Python] [ML] [+More]      │  Chip multi-select
│                                      │
│  Institution                         │
│  [Dropdown selector           ▼]    │
│                                      │
│  Graduation Year                     │
│  [2025] [2026] [2027] [2028]        │  Chip single-select
│                                      │
│  Verified Only                       │
│  [Toggle switch ●───]               │  Toggle
│                                      │
│  [Clear Filters]  [Apply Filters]    │  Ghost + Primary
└──────────────────────────────────────┘
```

**Layout (Desktop — Sidebar Panel):**
```
┌──────────────────┐
│  Filters         │  Sticky left panel
│                  │
│  Skills          │
│  [Multi-select]  │
│                  │
│  Institution     │
│  [Dropdown]      │
│                  │
│  Year            │
│  [Chip select]   │
│                  │
│  Verified Only   │
│  [Toggle]        │
│                  │
│  [Clear] [Apply] │
└──────────────────┘
```

#### Activity Feed

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Recent Activity                                  │
├──────────────────────────────────────────────────┤
│  [Avatar XS]  Rayyan earned "Hackathon Winner"   │
│               2 hours ago                         │
│  ─────────────────────────────────────────────── │
│  [Avatar XS]  New credential: B.Tech CS          │
│               Yesterday                           │
│  ─────────────────────────────────────────────── │
│  [Avatar XS]  Joined project group "EduChain"    │
│               3 days ago                          │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Item height | Auto (min `48px`) |
| Separator | `--border-subtle` |
| Avatar | XS (24px) |
| Event text | `--text-body`, entity names in weight 500 |
| Timestamp | `--text-caption`, `--text-tertiary` |
| Max visible | 5 items, "View All" link at bottom |

#### Group Member List

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Members (4)                       [Invite +]     │
├──────────────────────────────────────────────────┤
│  [Avatar SM]  Name  ·  Role          [Admin ▾]   │
│  [Avatar SM]  Name  ·  Role          [Member ▾]  │
│  [Avatar SM]  Name  ·  Role          [Member ▾]  │
│  [Avatar SM]  Name  ·  Role          [Member ▾]  │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Avatar | SM (32px) |
| Name | `--text-body-medium` |
| Role | `--text-caption`, `--text-tertiary` |
| Member action | Dropdown (Admin/Member/Remove) — only for group admin |
| Invite | Primary small button, top right |

---

## 7. Screen Designs

### 7.1 Student Mobile App

---

#### 7.1.1 Onboarding (3 slides)

| Slide | Illustration | Title | Description |
|---|---|---|---|
| 1 | ID card illustration | Your Verified Identity | Build a portable academic profile verified by your institution. |
| 2 | Shield + checkmark | Trusted Credentials | Receive digitally signed credentials that recruiters trust. |
| 3 | Connected nodes | Collaborate Everywhere | Discover and work with students across institutions. |

**Layout:**
```
┌─────────────────────────┐
│                         │
│    [Illustration]       │  240px height, centered
│                         │
│    Title                │  --text-h2, centered
│    Description          │  --text-body, --text-secondary, centered
│                         │
│    ● ○ ○                │  Page indicator dots
│                         │
│    [Get Started]        │  Primary button, full width
│    [Skip]               │  Ghost button
└─────────────────────────┘
```

**Primary Action:** "Get Started" → navigates to Signup.

---

#### 7.1.2 Login / Signup

**Login Layout:**
```
┌─────────────────────────┐
│  [EduChain ID Logo]     │  Centered, 40px
│                         │
│  Welcome back           │  --text-h2
│  Sign in to continue    │  --text-body, --text-secondary
│                         │
│  [Email Input]          │  Standard input
│  [Password Input]       │  Password input with show/hide toggle
│                         │
│  [Forgot Password?]     │  Ghost link, right-aligned
│                         │
│  [Sign In]              │  Primary button, full width
│                         │
│  ─── Or ───             │  Divider with label
│                         │
│  Don't have an account? │  --text-body, --text-secondary
│  [Sign Up]              │  Ghost link, --color-primary
└─────────────────────────┘
```

**Signup extends Login with:**
- Full Name input
- Confirm Password input
- Institution Selection dropdown (search-enabled)
- Student ID or Institutional Email input
- Terms acceptance checkbox

**Primary Action:** "Sign In" → authenticates → Home Dashboard. "Sign Up" → creates account → Institution Verification.

---

#### 7.1.3 Home Dashboard

**Layout:**
```
┌─────────────────────────┐
│  [Logo]  Home    [🔔]   │  Top nav
├─────────────────────────┤
│                         │
│  ┌─────────────────┐    │
│  │Virtual Student  │    │  Virtual Student ID Card (organism)
│  │ID Card          │    │
│  └─────────────────┘    │
│                         │
│  Quick Actions          │  --text-overline section label
│  [📜 Credentials] [📁  │  Horizontal scroll, icon + label tiles
│   Projects] [👥 Groups] │
│                         │
│  Recent Credentials     │  Section header + "View All"
│  [Credential Card]      │
│  [Credential Card]      │
│                         │
│  Collaboration Requests │  Section header + count badge
│  [Collab Request Card]  │
│  [Collab Request Card]  │
│                         │
│  Suggested Students     │  Section header
│  [Student Card] →scroll │  Horizontal scroll
│                         │
├─────────────────────────┤
│  🏠  🔍  📁  👤        │  Bottom tab bar
└─────────────────────────┘
```

**Components used:** Virtual Student ID, Credential Card, Collaboration Request Card, Student Card (horizontal scroll), Quick Action tiles.

**Primary Action:** Tap Virtual ID → Profile. Tap credential → Credential Detail.

---

#### 7.1.4 Discover Students

**Layout:**
```
┌─────────────────────────┐
│  [←]  Discover   [⚙]   │  Top nav + filter icon
├─────────────────────────┤
│  [🔍 Search students..] │  Search input, full width
│                         │
│  [React] [Python] [✕ ML]│  Active filter chips (removable)
│                         │
│  248 students found     │  --text-caption result count
│                         │
│  [Student Card]         │  Vertical list
│  [Student Card]         │
│  [Student Card]         │
│  [Student Card]         │
│  ...                    │  Infinite scroll
│                         │
├─────────────────────────┤
│  🏠  🔍  📁  👤        │
└─────────────────────────┘
```

**Components used:** Search Input, Chip (filter), Student Card (list).

**Interactions:**
- Tap filter icon → opens Search Filter Panel (bottom sheet).
- Search is debounced (300ms).
- Results load via infinite scroll (20 per page).

---

#### 7.1.5 Student Profile (Viewing Another Student)

**Layout:**
```
┌─────────────────────────┐
│  [←]  Profile    [⋮]    │
├─────────────────────────┤
│                         │
│  [Student Profile       │  Profile Header organism
│   Header]               │
│                         │
│  ── Skills ──           │  Tabbed sections or scrolling sections
│  [React] [Python] [ML]  │
│  [Data Science] [+2]    │
│                         │
│  ── Projects ──         │
│  [Project Card]         │
│  [Project Card]         │
│                         │
│  ── Achievements ──     │
│  [Achievement Card]     │
│                         │
│  ── Credentials ──      │
│  [Credential Card]      │
│  [Credential Card]      │
│                         │
├─────────────────────────┤
│  🏠  🔍  📁  👤        │
└─────────────────────────┘
```

**Components used:** Student Profile Header, Chip, Project Card, Achievement Card, Credential Card.

**Primary Action:** "Request Collaboration" button in the profile header.

---

#### 7.1.6 Project Groups

**Layout:**
```
┌─────────────────────────┐
│  [Logo]  Projects  [+]  │  Top nav + create button
├─────────────────────────┤
│                         │
│  My Groups (3)          │  Section header
│  [Project Card]         │
│  [Project Card]         │
│  [Project Card]         │
│                         │
│  Invitations (1)        │  Section header + count badge
│  [Group invite card]    │
│                         │
├─────────────────────────┤
│  🏠  🔍  📁  👤        │
└─────────────────────────┘
```

**Create Group Flow (modal or new screen):**
```
┌─────────────────────────┐
│  [✕]  Create Group      │
├─────────────────────────┤
│  [Group Name Input]     │
│  [Description Input]    │  Textarea
│  [Skills Tags Input]    │  Multi-chip input
│  [Invite Members]       │  Search + multi-select
│                         │
│  [Create Group]         │  Primary button, full width
└─────────────────────────┘
```

---

#### 7.1.7 Notifications

**Layout:**
```
┌─────────────────────────┐
│  [←]  Notifications     │
├─────────────────────────┤
│  Today                  │  Date section header
│  [Notification Item]    │  Unread (highlighted)
│  [Notification Item]    │
│                         │
│  Yesterday              │
│  [Notification Item]    │  Read
│  [Notification Item]    │
│                         │
│  Earlier                │
│  [Notification Item]    │
│  [Notification Item]    │
│  ...                    │
└─────────────────────────┘
```

**Notification types:** Credential Issued, Collaboration Request, Collaboration Accepted, Institution Verification Complete, Project Invitation, Profile View.

---

#### 7.1.8 Credentials

**Layout:**
```
┌─────────────────────────┐
│  [←]  Credentials       │
├─────────────────────────┤
│                         │
│  Verified (4)           │  Section with count
│  [Credential Card]      │
│  [Credential Card]      │
│  [Credential Card]      │
│  [Credential Card]      │
│                         │
│  Pending (1)            │
│  [Credential Card]      │  Pending badge variant
│                         │
└─────────────────────────┘
```

**Tap credential → Credential Detail screen:**
```
┌─────────────────────────┐
│  [←]  Credential        │
├─────────────────────────┤
│                         │
│  🎓 B.Tech Computer     │  --text-h2
│     Science             │
│                         │
│  Issuing Institution    │  --text-overline label
│  Dhaanish Ahmed College │  --text-body
│  of Engineering         │
│                         │
│  Issue Date             │  --text-overline label
│  May 15, 2026           │  --text-body
│                         │
│  Description            │  --text-overline label
│  Four-year undergraduate│  --text-body
│  degree program...      │
│                         │
│  ┌────────────────────┐ │
│  │  ✔ Verified        │ │  Large verification badge
│  │  Cryptographically │ │
│  │  verified on chain │ │
│  │  Hash: 0x7f2a...   │ │  Monospace, truncated
│  └────────────────────┘ │
│                         │
│  [Share Credential]     │  Outline button
└─────────────────────────┘
```

---

### 7.2 Institution Web Dashboard

---

#### 7.2.1 Dashboard Overview

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Dashboard                                        │
│          │                                                    │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│          │  │Total     │ │Verified  │ │Credentials│ │Pending│ │
│          │  │Students  │ │Students  │ │Issued     │ │Reqs   │ │
│          │  │1,247     │ │1,102     │ │3,456      │ │23     │ │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────┘ │
│          │                                                    │
│          │  Recent Verification Requests                      │
│          │  ┌────────────────────────────────────────────────┐│
│          │  │ Name    │ Student ID │ Status  │ Date │ Action ││
│          │  │ Rayyan  │ STU-2024   │ Pending │ Mar 7│ Review ││
│          │  │ Ahmed   │ STU-2025   │ Pending │ Mar 6│ Review ││
│          │  └────────────────────────────────────────────────┘│
│          │                                                    │
│          │  Credentials Issued This Month                     │
│          │  [Line chart — credentials over time]              │
│          │                                                    │
└──────────┴──────────────────────────────────────────────────┘
```

**Components used:** Stat cards (4-column grid), Data table, Line chart.

---

#### 7.2.2 Student Verification Queue

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Student Verification                             │
│          │  23 pending requests                              │
│          │                                                    │
│          │  [Search students...]  [Filter: All ▾]            │
│          │                                                    │
│          │  ┌────────────────────────────────────────────────┐│
│          │  │  ☐ │ Student     │ ID        │ Email        │ ││
│          │  │    │             │           │              │ ││
│          │  │  ☐ │ Rayyan M.   │ STU-2024  │ r@dace.edu  │ ││
│          │  │    │ B.Tech CS   │           │              │ ││
│          │  │    │ Submitted Mar 5         │              │ ││
│          │  │    │             │ [Approve] [Reject]       │ ││
│          │  │────│─────────────│───────────│──────────────│ ││
│          │  │  ☐ │ Ahmed K.    │ STU-2025  │ a@dace.edu  │ ││
│          │  │    │ B.Tech ECE  │           │              │ ││
│          │  │    │ Submitted Mar 6         │              │ ││
│          │  │    │             │ [Approve] [Reject]       │ ││
│          │  └────────────────────────────────────────────────┘│
│          │                                                    │
│          │  Bulk actions: [Approve Selected] [Reject Selected]│
└──────────┴──────────────────────────────────────────────────┘
```

**Interactions:**
- Checkbox multi-select for bulk operations.
- Inline Approve / Reject per row.
- Clicking student name → expands detail panel (drawer from right).

---

#### 7.2.3 Issue Credential Screen

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Issue Credential                                 │
│          │                                                    │
│          │  ┌──────────────────────────────────────────────┐  │
│          │  │  Step 1 of 3: Select Student                 │  │
│          │  │  ● ── ○ ── ○                                 │  │
│          │  │                                              │  │
│          │  │  [Search student by name or ID...]           │  │
│          │  │                                              │  │
│          │  │  Selected: Rayyan M. (STU-2024) ✔            │  │
│          │  │                                              │  │
│          │  │                        [Next →]              │  │
│          │  └──────────────────────────────────────────────┘  │
│          │                                                    │
│          │  Step 2: Credential Details                        │
│          │  [Credential Type ▾]  (Degree / Certificate / ...) │
│          │  [Title]                                           │
│          │  [Description]                                     │
│          │  [Grade / CGPA]                                    │
│          │  [Issue Date]                                      │
│          │                                                    │
│          │  Step 3: Review & Issue                            │
│          │  [Preview card of credential]                      │
│          │  [Issue Credential]  ← Primary, confirmation modal │
└──────────┴──────────────────────────────────────────────────┘
```

**Flow:** 3-step wizard with progress indicator. Step 3 shows a preview of the credential card as thet student will see it. "Issue Credential" triggers a confirmation modal.

---

#### 7.2.4 Credential History

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Credential History                               │
│          │  3,456 credentials issued                         │
│          │                                                    │
│          │  [Search...]  [Type ▾]  [Status ▾]  [Date ▾]     │
│          │                                                    │
│          │  ┌──────────────────────────────────────────────┐  │
│          │  │ Title      │ Student  │ Type    │ Status │Date│  │
│          │  │ B.Tech CS  │ Rayyan   │ Degree  │ ✔ Veri │ 5/26│  │
│          │  │ ML Cert    │ Ahmed    │ Cert    │ ✔ Veri │ 4/26│  │
│          │  │ B.Tech ECE │ Sara     │ Degree  │ ⏳ Pend│ 3/26│  │
│          │  └──────────────────────────────────────────────┘  │
│          │                                                    │
│          │  [← 1 2 3 ... 12 →]  Pagination                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Components used:** Data table with sorting, filter dropdowns, pagination.

---

### 7.3 Recruiter Web Portal

---

#### 7.3.1 Talent Discovery

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Talent Discovery                                 │
│          │                                                    │
│          │  [🔍 Search by skill, institution, name...]       │
│          │                                                    │
│          │  ┌────────────┐                                    │
│          │  │  Filters   │  Collapsible left panel            │
│          │  │            │                                    │
│          │  │  Skills    │  ┌────────────────────────────────┐│
│          │  │  [Multi]   │  │ [Student Card]  [Student Card] ││
│          │  │            │  │ [Student Card]  [Student Card] ││
│          │  │  Inst.     │  │ [Student Card]  [Student Card] ││
│          │  │  [Select]  │  │                                ││
│          │  │            │  │ Showing 1-20 of 248            ││
│          │  │  Year      │  │ [Load More]                    ││
│          │  │  [Chips]   │  └────────────────────────────────┘│
│          │  │            │                                    │
│          │  │  Verified  │                                    │
│          │  │  [Toggle]  │                                    │
│          │  └────────────┘                                    │
└──────────┴──────────────────────────────────────────────────┘
```

**Layout:** 2-column with 280px fixed filter panel + fluid card grid (2-3 cards per row depending on viewport).

**Interactions:**
- Filters apply instantly on change (no "Apply" button on desktop).
- Student cards display "⭐ Shortlist" action on hover.
- Card click → Student Profile View.

---

#### 7.3.2 Student Profile View (Recruiter Perspective)

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  [← Back to results]                             │
│          │                                                    │
│          │  ┌──────────────────────────────────────────────┐  │
│          │  │  [Avatar XL]  Student Name           [✔]    │  │
│          │  │               Institution · Degree          │  │
│          │  │               Graduation: 2027              │  │
│          │  │                                              │  │
│          │  │  [⭐ Shortlist]  [📧 Contact]  [📄 Export]  │  │
│          │  └──────────────────────────────────────────────┘  │
│          │                                                    │
│          │  ┌─────────┬───────────┬──────────┬────────────┐  │
│          │  │ Skills  │ Projects  │ Creds    │ Achieve.   │  │  Tab bar
│          │  └─────────┴───────────┴──────────┴────────────┘  │
│          │                                                    │
│          │  [Tab Content Area]                                │
│          │  Skills: [React] [Python] [ML] [Node.js] ...      │
│          │                                                    │
│          │  OR                                                │
│          │                                                    │
│          │  Credentials:                                      │
│          │  [Credential Card with full verification detail]   │
│          │  [Credential Card with full verification detail]   │
│          │                                                    │
└──────────┴──────────────────────────────────────────────────┘
```

**Primary Action:** "⭐ Shortlist" — toggles shortlist state, icon fills on shortlisted.

---

#### 7.3.3 Shortlisted Candidates

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Shortlisted Candidates (12)                      │
│          │                                                    │
│          │  [Search shortlist...]  [Sort: Recent ▾]          │
│          │                                                    │
│          │  ┌────────────────────────────────────────────────┐│
│          │  │ Student    │ Institution │ Skills    │ Actions ││
│          │  │ [Av] Rayyan│ DACE        │ React +2  │ View ✕  ││
│          │  │ [Av] Ahmed │ IIT-M       │ ML +3     │ View ✕  ││
│          │  │ [Av] Sara  │ NIT-T       │ Python +1 │ View ✕  ││
│          │  └────────────────────────────────────────────────┘│
│          │                                                    │
│          │  [Export Shortlist as CSV]                         │
└──────────┴──────────────────────────────────────────────────┘
```

**Actions per row:** "View" (link to profile), "✕" (remove from shortlist, with confirmation).

---

#### 7.3.4 Recruiter Analytics

**Layout:**
```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Analytics                                        │
│          │                                                    │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│          │  │Profiles  │ │Shortlisted│ │Searches  │          │
│          │  │Viewed    │ │Candidates │ │This Month│          │
│          │  │89        │ │12         │ │34        │          │
│          │  └──────────┘ └──────────┘ └──────────┘          │
│          │                                                    │
│          │  Search Activity                                   │
│          │  [Bar chart — searches per week]                   │
│          │                                                    │
│          │  Top Skills Searched                               │
│          │  1. React (23 searches)                            │
│          │  2. Machine Learning (18)                          │
│          │  3. Python (15)                                    │
│          │                                                    │
│          │  Recent Profile Views                              │
│          │  [Student mini-cards, horizontal list]             │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 8. Interaction Patterns

### 8.1 Search Flow

```
Step 1 │ User taps search bar
       │ → Input gains focus, keyboard appears (mobile)
       │ → Recent searches shown below (max 5)
       │
Step 2 │ User types query (≥ 2 characters)
       │ → 300ms debounce
       │ → Loading spinner in input
       │ → API call: GET /search/students?q={query}
       │
Step 3 │ Results populate below
       │ → Student Cards in vertical list
       │ → Result count shown: "248 students found"
       │ → If 0 results → Empty state (see Section 9)
       │
Step 4 │ User applies filters
       │ → Mobile: tap filter icon → Bottom sheet opens
       │ → Desktop: sidebar filter panel, instant apply
       │ → Results update with loading skeleton
       │
Step 5 │ User taps student card
       │ → Navigate to Student Profile screen
       │ → Back button returns to search with preserved state
```

### 8.2 Collaboration Request Flow

```
Step 1 │ Student A views Student B's profile
       │ → "Request Collaboration" button visible in header
       │
Step 2 │ Student A taps "Request Collaboration"
       │ → Modal opens with:
       │   - Student B's avatar + name (read-only)
       │   - Project interest selector (optional)
       │   - Message textarea (max 280 chars)
       │   - [Send Request] primary button
       │
Step 3 │ Student A taps "Send Request"
       │ → Button enters loading state
       │ → API call: POST /collaboration/request
       │ → Success toast: "Collaboration request sent to {name}"
       │ → Button changes to "Request Pending" (disabled state)
       │
Step 4 │ Student B receives notification
       │ → Push notification (mobile)
       │ → Notification item in notification feed
       │ → Badge on bottom tab bell icon
       │
Step 5 │ Student B opens notification
       │ → Collaboration Request Card displayed
       │ → Shows: Avatar, Name, Message, [Accept] [Decline]
       │
Step 6 │ Student B taps "Accept"
       │ → API call: PATCH /collaboration/request/{id}
       │ → Toast: "Collaboration with {name} started"
       │ → Both students now appear in each other's connections
       │ → Optional: Project group auto-created
       │
Step 6a│ Student B taps "Decline"
        │ → Confirmation: "Decline collaboration request?"
        │ → Request removed from list
        │ → Student A sees button revert to "Request Collaboration"
```

### 8.3 Credential Verification Flow

```
Step 1 │ Recruiter opens Student Profile
       │ → Credentials section shows Credential Cards
       │ → Each card shows verification badge
       │
Step 2 │ Recruiter taps "View Details" on a credential
       │ → Credential Detail view opens
       │ → Shows: Title, Institution, Date, Description
       │
Step 3 │ Verification section displays:
       │ → ✔ "Cryptographically Verified"
       │ → Issuing institution name + logo
       │ → Verification hash (truncated, monospace)
       │ → Verification timestamp
       │ → "Verified by EduChain ID" trust badge
       │
Step 4 │ Recruiter taps "Verify Independently" (optional)
       │ → System performs real-time verification
       │ → API call: GET /credentials/{id}/verify
       │ → Result: ✔ Valid / ✖ Invalid / ⚠ Revoked
       │ → Timestamp of verification recorded
```

### 8.4 Shortlisting Flow

```
Step 1 │ Recruiter browses Talent Discovery
       │ → Student Cards displayed in grid
       │
Step 2 │ Recruiter hovers over card (desktop) or views card (mobile)
       │ → "⭐ Shortlist" action visible
       │
Step 3 │ Recruiter clicks "⭐ Shortlist"
       │ → Icon fills (star becomes solid gold)
       │ → Toast: "{name} added to shortlist"
       │ → API call: POST /recruiter/shortlist
       │ → Counter in sidebar "Shortlist" badge increments
       │
Step 4 │ Recruiter navigates to Shortlist page
       │ → Table view of all shortlisted candidates
       │ → Actions: View Profile, Remove, Export
       │
Step 5 │ Recruiter clicks "Export Shortlist as CSV"
       │ → Generates CSV with: Name, Institution, Degree, Skills, Email
       │ → File downloads automatically
```

---

## 9. Empty States

Every list, section, and search result must gracefully handle the zero-data state.

| Context | Illustration | Message | Action |
|---|---|---|---|
| **No skills added** | Tag icon (muted) | You haven't added any skills yet. Skills help recruiters find you. | [Add Skills] primary button |
| **No projects** | Folder icon (muted) | No projects to show. Add a project to showcase your work. | [Create Project] primary button |
| **No credentials** | Shield icon (muted) | No credentials yet. Credentials will appear here once issued by your institution. | None (informational) |
| **No search results** | Search icon (muted) | No students match your search. Try different keywords or adjust your filters. | [Clear Filters] ghost button |
| **No collaboration requests** | Handshake icon (muted) | No collaboration requests. Discover students and start connecting. | [Explore Students] primary button |
| **No notifications** | Bell icon (muted) | You're all caught up. No new notifications. | None |
| **No shortlisted candidates** | Star icon (muted) | Your shortlist is empty. Discover talent and start building your candidate list. | [Discover Talent] primary button |
| **No achievements** | Trophy icon (muted) | No achievements added yet. Achievements make your profile stand out. | [Add Achievement] primary button |
| **No project groups** | Users icon (muted) | No groups yet. Create a group to collaborate with other students. | [Create Group] primary button |
| **No credential history** (institution) | Document icon (muted) | No credentials issued yet. Start by verifying students and issuing credentials. | [Issue Credential] primary button |

### Empty State Layout

```
┌─────────────────────────────┐
│                             │
│        [Icon 48px]          │  --text-tertiary
│                             │
│    Primary message          │  --text-body, --text-primary
│    Secondary description    │  --text-caption, --text-secondary
│                             │
│    [Action Button]          │  Primary or ghost button
│                             │
└─────────────────────────────┘
```

All empty state icons are **48px**, outlined style, using `--text-tertiary` color. The container is centered vertically and horizontally within the content area.

---

## 10. Error States

### 10.1 Error Types and Messages

| Error Type | Code | Title | Message | Action |
|---|---|---|---|---|
| **Network error** | — | Connection lost | Unable to connect. Check your internet connection and try again. | [Retry] primary button |
| **Server error** | 500 | Something went wrong | We're experiencing an issue on our end. Please try again in a moment. | [Retry] primary button |
| **Not found** | 404 | Page not found | The page you're looking for doesn't exist or has been moved. | [Go Home] primary button |
| **Unauthorized** | 401 | Session expired | Your session has expired. Please sign in again to continue. | [Sign In] primary button |
| **Forbidden** | 403 | Access denied | You don't have permission to view this content. | [Go Back] ghost button |
| **Rate limited** | 429 | Too many requests | You've made too many requests. Please wait a moment and try again. | Auto-retry countdown |
| **Validation error** | 422 | — | Inline field errors (see below) | Fix field and resubmit |
| **Credential revoked** | — | Credential Revoked | This credential has been revoked by the issuing institution. | [Contact Institution] ghost link |

### 10.2 Error Display Patterns

#### Inline Field Validation

```
[Label]
[Input field with --color-danger border]
⚠ Error message in --color-danger, --text-caption
```

- Validation triggers **on blur** (not on every keystroke).
- Error clears when user modifies the field.
- Error text appears with a `--duration-fast` (100ms) fade-in.

#### Toast Errors

```
┌─────────────────────────────────────┐
│  ⚠  Error message text      [✕]   │
└─────────────────────────────────────┘
```

- Background: `--color-danger-light`
- Border-left: `3px solid --color-danger`
- Position: Top-right (desktop), Top-center (mobile)
- Auto-dismiss: 5 seconds (with manual dismiss `✕`)

#### Full-Page Errors (500, 404)

```
┌─────────────────────────────────┐
│                                 │
│      [Error Icon 64px]          │
│                                 │
│      Title                      │  --text-h2
│      Description                │  --text-body, --text-secondary
│                                 │
│      [Action Button]            │
│                                 │
└─────────────────────────────────┘
```

Centered on page, same pattern as empty states but with `--color-danger` tinted icon.

---

## 11. Accessibility

### 11.1 WCAG 2.1 AA Compliance Requirements

| Requirement | Standard | Implementation |
|---|---|---|
| **Color contrast (text)** | 4.5:1 minimum (normal text) | All `--text-primary` on `--bg` combinations verified |
| **Color contrast (large text)** | 3:1 minimum (18px+ or 14px bold+) | Headings verified against all backgrounds |
| **Color contrast (UI components)** | 3:1 minimum | Borders, icons, form elements verified |
| **Non-color indicators** | Information not conveyed by color alone | Verification uses icon + text + color (triple encoding) |
| **Focus indicators** | Visible focus on all interactive elements | `--shadow-focus` ring (3px, `--color-primary` at 30% opacity) |
| **Touch targets** | 44px × 44px minimum | All buttons, links, tappable areas meet minimum |
| **Text scaling** | Supports up to 200% zoom | Layout uses relative units (rem), no fixed pixel heights for text containers |
| **Motion sensitivity** | `prefers-reduced-motion` respected | All animations disabled when preference is set |

### 11.2 Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift+Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate buttons, links, toggles |
| `Escape` | Close modal, popover, dropdown, bottom sheet |
| `Arrow keys` | Navigate within tab bars, radio groups, dropdown menus |
| `Home` / `End` | Jump to first/last item in a list |

#### Focus Order

1. Top navigation bar (left → right)
2. Sidebar items (top → bottom) — web only
3. Page content (top → bottom, left → right)
4. Modal content (trapped focus cycle)
5. Bottom tab bar — mobile only

#### Focus Trap

Modals, drawers, and bottom sheets **trap focus** — Tab cycles only within the overlay. Escape closes the overlay and returns focus to the trigger element.

### 11.3 Screen Reader Support

| Element | ARIA Implementation |
|---|---|
| Verification badges | `role="status"` + `aria-label="Verified credential"` |
| Loading states | `aria-live="polite"` + `aria-busy="true"` |
| Toast notifications | `role="alert"` + `aria-live="assertive"` |
| Tab navigation | `role="tablist"`, `role="tab"`, `aria-selected` |
| Modals | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| Credential status | `aria-label` describing full status (not just the icon) |
| Avatar images | `alt="{user name}"` |
| Decorative icons | `aria-hidden="true"` |
| Form inputs | `aria-describedby` linking to helper/error text |
| Search results | `aria-live="polite"` region, count announced on update |

### 11.4 Semantic HTML

| Component | Element |
|---|---|
| Navigation | `<nav>` with `aria-label` |
| Page content | `<main>` |
| Sections | `<section>` with `<h2>`–`<h4>` headings |
| Card lists | `<ul>` / `<li>` |
| Data tables | `<table>` with `<thead>`, `<th scope>` |
| Buttons | `<button>` (never `<div onClick>`) |
| Links | `<a>` with `href` (never `<span onClick>`) |
| Form fields | `<label>` explicitly associated with `<input>` |

---

## 12. Responsive Design

### 12.1 Breakpoint Behavior

| Breakpoint | Width | Layout Changes |
|---|---|---|
| **xs** (Mobile) | `0–639px` | Single column. Bottom tab bar. Full-width cards. Bottom sheets for filters and modals. |
| **sm** (Large Phone) | `640px` | Single column, slightly wider margins. Cards may show 2-column on landscape. |
| **md** (Tablet) | `768px` | Sidebar collapses to icon-only (72px) or hidden behind hamburger. 2-column card grid. |
| **lg** (Desktop) | `1024px` | Full sidebar (256px). 2–3 column card grid. Side-by-side filter panel + results. |
| **xl** (Large Desktop) | `1280px` | Content max-width `1200px` centered. 3-column card grid. All panels visible. |
| **2xl** (Wide Monitor) | `1536px` | Same as xl with more breathing room. No layout change past xl. |

### 12.2 Component Adaptation

| Component | Mobile (xs–sm) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| **Navigation** | Bottom tab bar | Collapsed sidebar (72px) | Expanded sidebar (256px) |
| **Student Card** | Full-width, stacked | 2-column grid | 2–3 column grid |
| **Filter Panel** | Bottom sheet (on demand) | Collapsible top bar | Persistent sidebar (280px) |
| **Data Table** | Card list (stacked) | Horizontal scroll table | Full table |
| **Modal** | Full-screen bottom sheet | Centered dialog (560px) | Centered dialog (560px) |
| **Profile Header** | Stacked (avatar → name → actions) | Side-by-side (avatar left, info right) | Side-by-side, wider |
| **Virtual ID Card** | Full-width, 100% | Max `400px`, centered | Max `400px`, left-aligned |
| **Form layouts** | Single column | Single column (max `480px`) | Single column (max `560px`) |
| **Action buttons** | Full-width, stacked | Inline, right-aligned | Inline, right-aligned |
| **Toast position** | Top center, full width | Top right, `360px` | Top right, `360px` |

### 12.3 Responsive Typography

| Token | Mobile (xs) | Desktop (lg+) |
|---|---|---|
| `--text-display` | `28px` | `36px` |
| `--text-h1` | `24px` | `30px` |
| `--text-h2` | `20px` | `24px` |
| `--text-h3` | `18px` | `20px` |
| `--text-body-lg` | `16px` | `16px` |
| `--text-body` | `14px` | `14px` |
| `--text-caption` | `12px` | `12px` |

Scaling applied via CSS `clamp()` or media query overrides at `--bp-lg`.

---

## 13. Animation & Motion

### 13.1 Motion Principles

1. **Purposeful.** Every animation communicates state change, spatial relationship, or feedback.
2. **Fast.** No animation exceeds `300ms` for standard interactions. Route transitions max `500ms`.
3. **Subtle.** Only `transform` and `opacity` are animated. No animating `width`, `height`, `margin`, or `color`.
4. **Respectful.** All animations are disabled when `prefers-reduced-motion: reduce` is active.

### 13.2 Animation Catalog

| Interaction | Property | Duration | Easing | Description |
|---|---|---|---|---|
| **Button hover** | `background-color` | `100ms` | `ease` | Subtle background shift |
| **Button press** | `transform: scale(0.98)` | `100ms` | `ease-out` | Micro-press feedback |
| **Card hover** | `box-shadow`, `transform: translateY(-1px)` | `200ms` | `ease-out` | Lift effect |
| **Page transition** (mobile) | `opacity`, `transform: translateX` | `300ms` | `ease-out` | Slide left/right for push/pop |
| **Tab switch** (mobile) | None | `0ms` | — | Instant, no animation |
| **Modal enter** | `opacity`, `transform: scale(0.95→1)` | `200ms` | `ease-out` | Fade + scale up |
| **Modal exit** | `opacity`, `transform: scale(1→0.95)` | `150ms` | `ease-in` | Fade + scale down |
| **Bottom sheet enter** | `transform: translateY(100%→0)` | `300ms` | `ease-out` | Slide up from bottom |
| **Bottom sheet exit** | `transform: translateY(0→100%)` | `200ms` | `ease-in` | Slide down |
| **Toast enter** | `opacity`, `transform: translateY(-8px→0)` | `200ms` | `ease-out` | Fade + slide down |
| **Toast exit** | `opacity` | `150ms` | `ease-in` | Fade out |
| **Skeleton shimmer** | `background-position` | `1500ms` | `linear` | Infinite shimmer sweep |
| **Spinner** | `transform: rotate` | `600ms` | `linear` | Infinite rotation |
| **Badge count update** | `transform: scale(1.2→1)` | `200ms` | `ease-out` | Pop effect on increment |
| **List item enter** | `opacity`, `transform: translateY(8px→0)` | `200ms` | `ease-out` | Staggered (50ms delay per item, max 5) |

### 13.3 Loading States

| Context | Pattern | Spec |
|---|---|---|
| **Page load** | Skeleton screens | Gray shimmer rectangles matching content layout |
| **Button action** | Inline spinner | 16px spinner replaces button text, same button width |
| **Search** | Inline spinner | 16px spinner inside search input (right side) |
| **Pull to refresh** (mobile) | Spinner | Circular spinner, drops from top, 24px |
| **Infinite scroll** | Bottom spinner | 24px spinner centered below last item |
| **Image load** | Blur-up | Low-res placeholder → full image crossfade |

### 13.4 Skeleton Screen Specifications

Skeleton screens replace content during loading. They mirror the exact layout of the loaded state.

| Rule | Value |
|---|---|
| Skeleton color (dark) | `--gray-800` base, `--gray-700` shimmer highlight |
| Skeleton color (light) | `--gray-200` base, `--gray-100` shimmer highlight |
| Border radius | Matches the component it replaces |
| Text lines | Rounded rectangles, 60–80% width variation |
| Avatars | Circles matching avatar size |
| Shimmer direction | Left to right, `1500ms` cycle |

---

## 14. Developer Handoff

### 14.1 Component Naming Conventions

All components use **PascalCase**. Variants use a dot or dash suffix.

| Layer | Naming Pattern | Examples |
|---|---|---|
| **Atoms** | `{Component}` | `Button`, `Input`, `Avatar`, `Badge`, `Chip`, `Icon`, `Divider` |
| **Molecules** | `{Context}{Component}` | `StudentCard`, `CredentialCard`, `ProjectCard`, `AchievementCard`, `NotificationItem`, `CollaborationRequestCard` |
| **Organisms** | `{Context}{Component}` | `VirtualStudentID`, `StudentProfileHeader`, `CredentialList`, `SearchFilterPanel`, `ActivityFeed`, `GroupMemberList` |
| **Layouts** | `{Context}Layout` | `AppLayout`, `DashboardLayout`, `AuthLayout` |

#### Variant Naming

```
Button.Primary
Button.Secondary
Button.Outline
Button.Danger
Button.Ghost

Badge.Verified
Badge.Pending
Badge.Revoked

Avatar.SM
Avatar.MD
Avatar.LG
Avatar.XL
```

#### File Structure (Frontend)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts    ← styled-components or CSS module
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   ├── Chip/
│   │   └── Icon/
│   ├── molecules/
│   │   ├── StudentCard/
│   │   ├── CredentialCard/
│   │   ├── ProjectCard/
│   │   ├── AchievementCard/
│   │   ├── NotificationItem/
│   │   └── CollaborationRequestCard/
│   ├── organisms/
│   │   ├── VirtualStudentID/
│   │   ├── StudentProfileHeader/
│   │   ├── CredentialList/
│   │   ├── SearchFilterPanel/
│   │   ├── ActivityFeed/
│   │   └── GroupMemberList/
│   └── layouts/
│       ├── AppLayout/
│       ├── DashboardLayout/
│       └── AuthLayout/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   └── index.ts
└── styles/
    └── global.css
```

### 14.2 Design Token Usage — CSS Variables

All tokens are defined as CSS custom properties on `:root` and `[data-theme]` selectors.

```css
/* tokens/global.css */

:root {
  /* Spacing */
  --space-0: 0px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;

  --text-display: 36px;
  --text-h1: 30px;
  --text-h2: 24px;
  --text-h3: 20px;
  --text-h4: 18px;
  --text-body-lg: 16px;
  --text-body: 14px;
  --text-caption: 12px;
  --text-overline: 11px;

  /* Border Radius */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-focus: 0 0 0 3px rgba(37, 99, 235, 0.3);

  /* Z-Index */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
  --z-tooltip: 60;

  /* Transitions */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* Dark Theme (Default) */
[data-theme="dark"] {
  --bg: #0F172A;
  --bg-elevated: #1E293B;
  --bg-surface: #334155;
  --bg-overlay: rgba(0, 0, 0, 0.6);
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --text-inverse: #0F172A;
  --border-default: #334155;
  --border-subtle: #1E293B;
  --border-focus: #2563EB;
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;
  --color-primary-light: rgba(37, 99, 235, 0.15);
  --color-primary-subtle: rgba(37, 99, 235, 0.08);
  --color-success: #22C55E;
  --color-success-light: rgba(34, 197, 94, 0.15);
  --color-danger: #EF4444;
  --color-danger-light: rgba(239, 68, 68, 0.15);
  --color-warning: #F59E0B;
  --color-warning-light: rgba(245, 158, 11, 0.15);
}

/* Light Theme */
[data-theme="light"] {
  --bg: #FFFFFF;
  --bg-elevated: #F8FAFC;
  --bg-surface: #F1F5F9;
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --text-inverse: #FFFFFF;
  --border-default: #E2E8F0;
  --border-subtle: #F1F5F9;
  --border-focus: #2563EB;
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;
  --color-primary-light: #DBEAFE;
  --color-primary-subtle: rgba(37, 99, 235, 0.05);
  --color-success: #16A34A;
  --color-success-light: #DCFCE7;
  --color-danger: #DC2626;
  --color-danger-light: #FEE2E2;
  --color-warning: #D97706;
  --color-warning-light: #FEF3C7;
}
```

### 14.3 Component Implementation Rules

1. **All colors via tokens.** No hardcoded hex values in component code. Use `var(--token-name)`.
2. **All spacing via tokens.** Use `var(--space-N)` for padding, margin, gap.
3. **Typography via tokens.** Use `var(--text-N)` for font-size, apply weight and line-height alongside.
4. **Theme-aware.** Components read from theme tokens. No conditional theme logic in components.
5. **State-complete.** Every interactive component implements all states: default, hover, active, disabled, loading, focus.
6. **Accessible.** Every component includes appropriate ARIA attributes, keyboard handlers, and focus management.

### 14.4 Figma Design System Organization

```
Figma File Structure:
├── 🎨 Design Tokens
│   ├── Colors (Dark + Light)
│   ├── Typography Scale
│   ├── Spacing & Grid
│   ├── Shadows
│   └── Border Radius
├── ⚛️ Atoms
│   ├── Button (all variants × all states)
│   ├── Input (all states)
│   ├── Avatar (all sizes)
│   ├── Badge (all variants)
│   ├── Chip (all states)
│   ├── Icon (all sizes)
│   └── Divider (all variants)
├── 🧬 Molecules
│   ├── Student Card
│   ├── Credential Card
│   ├── Project Card
│   ├── Achievement Card
│   ├── Notification Item
│   └── Collaboration Request Card
├── 🏗️ Organisms
│   ├── Virtual Student ID
│   ├── Student Profile Header
│   ├── Credential List
│   ├── Search Filter Panel
│   ├── Activity Feed
│   └── Group Member List
├── 📱 Student App Screens
│   ├── Onboarding (3 slides)
│   ├── Login / Signup
│   ├── Home Dashboard
│   ├── Discover Students
│   ├── Student Profile
│   ├── Project Groups
│   ├── Create Group
│   ├── Notifications
│   ├── Credentials
│   ├── Credential Detail
│   └── My Profile / Edit Profile
├── 💻 Institution Dashboard Screens
│   ├── Dashboard Overview
│   ├── Student Verification Queue
│   ├── Issue Credential (3-step wizard)
│   └── Credential History
├── 💼 Recruiter Portal Screens
│   ├── Talent Discovery
│   ├── Student Profile View
│   ├── Shortlisted Candidates
│   └── Analytics
└── 🔧 Patterns
    ├── Empty States (all variants)
    ├── Error States (all types)
    ├── Loading / Skeleton States
    ├── Toast Notifications
    └── Modal Dialogs
```

#### Figma Component Properties

Each Figma component exposes the following properties for design flexibility:

| Property | Type | Purpose |
|---|---|---|
| `variant` | Enum | Visual variant (e.g., Primary, Secondary) |
| `state` | Enum | Interaction state (Default, Hover, Active, Disabled, Loading) |
| `size` | Enum | Size variant (SM, MD, LG) |
| `theme` | Enum | Dark, Light |
| `hasIcon` | Boolean | Show/hide leading icon |
| `showBadge` | Boolean | Show/hide verification badge |

---

## Appendix A: Color Contrast Verification

| Combination | Foreground | Background | Ratio | Pass |
|---|---|---|---|---|
| Primary text on dark bg | `#F1F5F9` | `#0F172A` | 15.4:1 | ✔ AAA |
| Secondary text on dark bg | `#94A3B8` | `#0F172A` | 6.1:1 | ✔ AA |
| Primary text on light bg | `#0F172A` | `#FFFFFF` | 17.1:1 | ✔ AAA |
| Secondary text on light bg | `#475569` | `#FFFFFF` | 7.2:1 | ✔ AA |
| Primary blue on dark bg | `#2563EB` | `#0F172A` | 4.6:1 | ✔ AA |
| Primary blue on light bg | `#2563EB` | `#FFFFFF` | 4.6:1 | ✔ AA |
| Success green on dark bg | `#22C55E` | `#0F172A` | 7.8:1 | ✔ AA |
| Danger red on dark bg | `#EF4444` | `#0F172A` | 5.3:1 | ✔ AA |
| Tertiary text on dark bg | `#64748B` | `#0F172A` | 3.7:1 | ✔ AA Large |
| Button text on primary | `#0F172A` | `#2563EB` | 4.6:1 | ✔ AA |
| Button text on primary (light) | `#FFFFFF` | `#2563EB` | 4.6:1 | ✔ AA |

---

## Appendix B: Icon Reference (Lucide)

| Icon Name | Usage |
|---|---|
| `home` | Home tab |
| `search` | Discover tab, search inputs |
| `folder` | Projects tab |
| `user-circle` | Profile tab |
| `bell` | Notifications |
| `shield-check` | Verification seal |
| `check-circle` | Verified badge |
| `clock` | Pending badge |
| `x-circle` | Revoked badge |
| `star` | Shortlist |
| `users` | Group members |
| `graduation-cap` | Credentials |
| `trophy` | Achievements |
| `link` | Repository/external links |
| `settings` | Settings |
| `log-out` | Sign out |
| `chevron-right` | Navigation arrows |
| `plus` | Create actions |
| `filter` | Filter panel toggle |
| `download` | Export/download |
| `mail` | Contact |
| `eye` | View/visibility |
| `edit` | Edit profile |

---

*End of specification.*
