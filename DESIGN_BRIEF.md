# GateSentry UI/UX Design Brief & Visual Design System Specification
**Product:** GateSentry — CI/CD Security Scanner & Enterprise Policy Enforcement Platform  
**Document Type:** Senior UI/UX Design Brief & Frontend Design System Specification  
**Version:** 1.0.0  
**Target Audience:** UI/UX Designers, Frontend Engineers, AI App Builders, Design System Maintainers  
**Companion Documents:** [PRD.md](file:///d:/CICD%20Scanner/PRD.md) | [TRD.md](file:///d:/CICD%20Scanner/TRD.md) | [APP_FLOW.md](file:///d:/CICD%20Scanner/APP_FLOW.md)

---

## 1. Design Vision & Aesthetic Direction

### 1.1 Aesthetic Persona: "Precision DevSecOps"
GateSentry is an enterprise developer security tool. Its aesthetic must combine **developer-centric minimalism** (like Linear and Vercel) with the **authoritative confidence of a cybersecurity command center** (like CrowdStrike or Datadog Security). It rejects cluttered, dated enterprise consoles in favor of:
- **Ultra-crisp dark mode first** (with a polished high-contrast light mode alternative).
- **Deep slate and obsidian surfaces** with layered elevation, subtle borders (`border-white/10`), and glassmorphism backdrops (`backdrop-blur-md`).
- **Laser-focused semantic accents**: Vibrant, unmistakable status colors for vulnerabilities and exit codes (`#EF4444` Critical, `#F97316` High, `#EAB308` Medium, `#3B82F6` Low, `#10B981` Clean Pass).
- **Monospace data precision**: Pinned dependencies, commit SHAs, Shannon entropy scores, and rule IDs rendered in high-legibility developer fonts with subtle badge framing.

### 1.2 Emotional & Experiential Goals
- **Empowerment over Dread:** Security tools often trigger anxiety. GateSentry makes remediation feel fast, modern, and satisfying through 1-click copy commands, clear diffs, and optimistic feedback.
- **Instant Triage Speed:** A security engineer scanning 1,000 repositories should identify blockers in under 3 seconds using scannable severity badges, categorical icons, and spatial hierarchy.
- **Uncompromised Fidelity:** No generic placeholder styling. Every border, hover transition, and active state conveys engineering excellence.

---

## 2. Color Palette & Token System

The design system uses an **HSL-driven design token architecture** optimized for Tailwind CSS and CSS Variables. Dark mode is default, engineered with 4 elevation tiers to avoid flat, muddy blacks.

### 2.1 Theme Tiers (Background & Surface Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 4: Popovers & Tooltips (Elevated Top)  hsl(224, 25%, 16%)
│   ┌─────────────────────────────────────────────────────────┐
│   │ TIER 3: Cards, Modals, Drawers          hsl(224, 25%, 12%)
│   │   ┌─────────────────────────────────────────────────────┐
│   │   │ TIER 2: Sidebar, Topbar, Panel Trays hsl(224, 25%, 9%)
│   │   │   ┌─────────────────────────────────────────────────┐
│   │   │   │ TIER 1: Canvas Base Background  hsl(224, 25%, 6%)│
└───────┴───┴───┴─────────────────────────────────────────────┘
```

| Token Name | CSS Variable | Hex Equivalent | Usage & Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `--bg-base` | `#080B11` | Deepest viewport background (`bg-background`). |
| **Surface Layer 1** | `--bg-surface-1` | `#0E131F` | Sidebar, Topbar, Table header rows. |
| **Surface Layer 2** | `--bg-surface-2` | `#141B2D` | Cards, Dialog containers, Triage Drawer. |
| **Surface Elevated**| `--bg-elevated` | `#1C243B` | Dropdowns, Command palette, Tooltips. |
| **Subtle Border** | `--border-subtle`| `rgba(255, 255, 255, 0.08)` | Standard card/divider hairline strokes. |
| **Active Border** | `--border-focus` | `rgba(99, 102, 241, 0.40)` | Interactive focus rings, highlighted rows. |

---

### 2.2 Semantic Severity & Status Palette

Colors are calibrated for **WCAG 2.1 AAA contrast** on dark slate surfaces.

| Severity / Status | Brand Color | Hex Code | Background Tint (12%) | Border Accent (30%) | Glow Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Critical / Secret** | Crimson Flame | `#EF4444` | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.35)` | `0 0 16px rgba(239, 68, 68, 0.25)` |
| **High Severity (CVE)** | Amber Orange | `#F97316` | `rgba(249, 115, 22, 0.12)`| `rgba(249, 115, 22, 0.35)`| `0 0 16px rgba(249, 115, 22, 0.25)`|
| **Medium Severity** | Warm Gold | `#F59E0B` | `rgba(245, 158, 11, 0.12)`| `rgba(245, 158, 11, 0.35)`| `None` |
| **Low / Info** | Cyan Cobalt | `#06B6D4` | `rgba(6, 182, 212, 0.12)` | `rgba(6, 182, 212, 0.35)` | `None` |
| **Passed (`exit 0`)** | Emerald Neon | `#10B981` | `rgba(16, 185, 129, 0.12)`| `rgba(16, 185, 129, 0.35)`| `0 0 16px rgba(16, 185, 129, 0.25)`|
| **Policy Violation** | Rose Red | `#F43F5E` | `rgba(244, 63, 94, 0.12)` | `rgba(244, 63, 94, 0.35)` | `0 0 16px rgba(244, 63, 94, 0.25)` |
| **System Error (`2`)** | Amethyst Purple| `#A855F7`| `rgba(168, 85, 247, 0.12)`| `rgba(168, 85, 247, 0.35)`| `None` |
| **Waiver Active** | Topaz Bronze | `#D97706` | `rgba(217, 119, 6, 0.12)` | `rgba(217, 119, 6, 0.35)` | `None` |

---

### 2.3 Brand Primary & Interactive Accents

| Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Brand Primary (Indigo Pulse)** | `#6366F1` | Primary CTA buttons, active tab indicators, brand logo marks. |
| **Primary Hover** | `#4F46E5` | Active state for primary buttons. |
| **Text Primary** | `#F8FAFC` | Headings, card titles, key metric numbers. |
| **Text Secondary** | `#94A3B8` | Body copy, table subtext, timestamps. |
| **Text Muted** | `#64748B` | Disabled labels, placeholder text, hints. |
| **Code Accent** | `#38BDF8` | Monospace tokens, lockfile paths, function names. |

---

## 3. Typography Hierarchy & Font System

GateSentry utilizes a two-family font system: **Inter** (or **Plus Jakarta Sans**) for UI readability, paired with **JetBrains Mono** for developer artifact data (commit hashes, CVSS vectors, tokens, terminal logs).

### 3.1 Font Families
- **Sans-Serif (UI Body & Headers):** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace (Code & Technical Tokens):** `"JetBrains Mono", "Fira Code", Menlo, monospace`

### 3.2 Typography Scale & Style Rules

| Style Token | Size / Line Height | Weight | Font Family | Tracking | Example Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `32px / 40px` | Bold (700) | Sans | `-0.025em` | Onboarding headlines, Login title |
| **H1 Screen Title**| `24px / 32px` | SemiBold (600)| Sans | `-0.02em` | "Executive Security Posture", "Repositories" |
| **H2 Section Header**| `18px / 26px`| SemiBold (600)| Sans | `-0.01em` | Card headers, Drawer title |
| **H3 Card Title** | `14px / 20px` | Medium (500) | Sans | `0` | KPI card titles, Filter labels |
| **Metric Large** | `30px / 36px` | Bold (700) | Sans / Tabular | `-0.02em` | KPI numbers (`1,249`, `96.4%`) |
| **Body Standard** | `14px / 22px` | Regular (400) | Sans | `0` | Descriptions, remediation text, modal copy |
| **Body Small** | `12px / 18px` | Regular (400) | Sans | `0` | Table metadata, timestamps (`2m ago`) |
| **Micro Caption** | `11px / 16px` | Medium (500) | Sans | `+0.04em` (Caps)| Uppercase badge tags, category headers |
| **Code Primary** | `13px / 20px` | Medium (500) | Mono | `0` | Code editor snippets, file paths |
| **Code Pill** | `12px / 16px` | Regular (400) | Mono | `0` | Commit SHAs (`8a1f3c`), Rule IDs, CVE IDs |

---

## 4. Layout Architecture & Spatial Grid

### 4.1 Base Unit & Spacing Grid
The design system strictly adheres to an **8-point spatial grid** (with a secondary 4px sub-grid for badges and dense data tables):
- `4px` (`space-1`): Inner badge padding, icon-to-label gaps.
- `8px` (`space-2`): Compact table row padding, input inner padding.
- `16px` (`space-4`): Standard component spacing, card inner padding.
- `24px` (`space-6`): Layout grid gaps, drawer section spacing.
- `32px` (`space-8`): Major section margins, dashboard row separation.

### 4.2 Application Layout Grid
- **Screen Canvas:** Max container width `1600px` centered on ultrawide monitors, fluid `w-full` with minimum padding `px-6` on standard desktops (`1280px` to `1536px`).
- **Global Topbar:** Fixed height `64px` (`h-16`), pinned to top, full viewport width.
- **Global Left Sidebar:** Fixed width `256px` (`w-64`) expanded; collapses to `72px` (`w-[72px]`) in compact mode.
- **Main Viewport Canvas:** Offset `left-64` (or `left-[72px]`), top offset `top-16`, fill remaining space (`min-h-[calc(100vh-4rem)] p-6 md:p-8`).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FIXED TOPBAR: 64px [Logo] [Org Selector] [Cmd+K Search] [Queue] [Bell] [User│
├──────────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT CANVAS (Padded 32px)                            │
│ Width: 256px │                                                              │
│              │ ┌──────────────────────────────────────────────────────────┐ │
│ • Dashboard  │ │ Page Header & Action Bar                                 │ │
│ • Repos      │ └──────────────────────────────────────────────────────────┘ │
│ • Findings   │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────────┐ │
│ • Waivers    │ │ KPI #1  │ │ KPI #2  │ │ KPI #3  │ │ KPI #4               │ │
│ • Policies   │ └─────────┘ └─────────┘ └─────────┘ └──────────────────────┘ │
│ • Audit Logs │ ┌───────────────────────────────────┬──────────────────────┐ │
│ • Settings   │ │ Primary Data Chart (2/3 Grid)     │ Secondary (1/3 Grid) │ │
│              │ └───────────────────────────────────┴──────────────────────┘ │
│ [CLI v1.0.0] │ ┌──────────────────────────────────────────────────────────┐ │
│              │ │ Detailed Table Grid / Active Stream                      │ │
│              │ └──────────────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 5. Component Design System & Style Tokens

### 5.1 Card Styles
- **Standard Card Container:**
  - Background: `bg-[#0E131F]/90` with `backdrop-blur-sm`.
  - Border: `1px solid rgba(255, 255, 255, 0.08)`.
  - Radius: `rounded-xl` (`12px`).
  - Shadow: `shadow-lg shadow-black/20`.
  - Hover Interaction: On clickable cards (e.g. repo card), border transitions to `border-white/20` and slight elevation transform (`-translate-y-[1px]`) over `150ms ease-out`.

### 5.2 Buttons & Interactive Triggers

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ Primary Action (Brand)  │  │ Secondary / Outline     │  │ Destructive Action      │
│ [ + Connect Repo ]      │  │ [ Export CSV ]          │  │ [ Revoke Access Token ] │
│ Indigo Solid + Glow     │  │ Border + Subtle Tint    │  │ Crimson Alert Tint      │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

1. **Primary Button:**
   - Style: `bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150`.
   - Radius: `rounded-lg` (`8px`).
   - Padding: `px-4 py-2` (Small: `px-3 py-1.5`, Large: `px-6 py-3`).
2. **Secondary Button:**
   - Style: `bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 active:scale-[0.98] transition-all`.
3. **Ghost / Tertiary Button:**
   - Style: `bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white`.
4. **Destructive Button:**
   - Style: `bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30`.

### 5.3 Badges & Pill Indicators
All badges use small caps uppercase tracking with centered micro-icons.
- **Critical Badge:** `bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1.5`. Includes a `w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse` ping dot.
- **High Badge:** `bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] px-2 py-0.5 rounded-md`.
- **Medium Badge:** `bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] px-2 py-0.5 rounded-md`.
- **Pass Badge (`exit 0`):** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-md font-semibold`.

### 5.4 Data Tables & Lists
- **Header Row:** `bg-[#141B2D]/60 text-slate-400 text-[12px] uppercase font-semibold tracking-wider border-b border-white/10 px-4 py-3`.
- **Body Rows:**
  - Height: `56px` for standard rows, `72px` for rich finding rows.
  - Border: `border-b border-white/[0.05]`.
  - Hover: `hover:bg-white/[0.02] transition-colors duration-100`.
  - Cursor: `cursor-pointer` on clickable table rows.
- **Empty & Loading Cells:** Crisp skeleton shimmering bars with gradient shimmer from `rgba(255,255,255,0.03)` to `rgba(255,255,255,0.08)`.

### 5.5 Code Blocks & Monaco Masked Viewer
- **Container:** Dark terminal obsidian `bg-[#0B0F19] rounded-lg border border-white/10 overflow-hidden font-mono text-[13px]`.
- **Header Strip:** File path bar with breadcrumbs (`backend/src/config/aws.ts:24`) + `"Copy Snippet"` button.
- **Line Numbers:** Right-aligned, muted `text-slate-600 select-none`.
- **Masked Finding Highlighting:**
  - Flagged line: `bg-red-500/[0.12] border-l-2 border-red-500`.
  - Redacted token: Rendered in high-contrast cyan mono with dotted underline (`AKIA****************`).

---

## 6. Dashboard Structure & Widget System

The **Executive Security Posture Dashboard** (`SCR-03`) uses a modular, 12-column responsive grid architecture.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 12-COLUMN DASHBOARD GRID LAYOUT                                              │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Col 1-3 (Span 3)  │ Col 4-6 (Span 3)  │ Col 7-9 (Span 3)  │ Col 10-12(Span 3│
│ KPI 1: Active Repo│ KPI 2: Scans Run  │ KPI 3: Crit/High  │ KPI 4: Pass Rate│
├───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│ Col 1-8 (Span 8)                                  │ Col 9-12 (Span 4)       │
│ Primary Exposure & MTTR Trends (30 Days)          │ Threat Breakdown        │
│ [Recharts Multi-Area Curve with Interactive Axis] │ [Donut / Stacked Bar]   │
├───────────────────────────────────────────────────┴─────────────────────────┤
│ Col 1-12 (Span 12) Full Width                                               │
│ Live Pipeline Activity Stream (Real-Time Ingestion Feed)                    │
│ [ Table with Status Dot, Repo, Branch, Commit, Violations, Time, Actions ]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 KPI Metric Cards (The "Vital Signs" Row)
Each card features:
1. **Header:** Title in muted `text-slate-400 text-xs font-semibold` + Lucide icon.
2. **Value Display:** `text-2xl font-bold font-sans text-slate-100` with tabular numbers.
3. **Contextual Badge:** Sparkline mini-indicator or percentage delta compared to previous period (`+12% vs last week` in green or red).
4. **Sub-Metric Footer:** Mini progress bar or secondary breakdown (e.g. `2 Secrets • 5 CVEs`).

### 6.2 Data Visualizations & Charts
- **Library Target:** Recharts or Tremor React.
- **Grid Lines:** Extremely subtle dashed borders `stroke="rgba(255,255,255,0.05)"`.
- **Tooltip Component:** Custom dark glass popover (`bg-[#182032] border border-white/10 rounded-lg p-3 shadow-xl`) rendering exact counts and date points on mouse hover.
- **Curve Types:** Smooth monotone curves (`type="monotone"`) with semi-transparent vertical gradient fills below lines.

---

## 7. Responsive Breakpoints & Mobile Adaptations

Security engineers primarily work on desktop monitors, but developers and on-call platform engineers review broken PRs and approve urgent waivers on mobile devices.

### 7.1 Breakpoint Grid Definitions
- **Mobile (`< 640px`):** Single column, touch-optimized.
- **Tablet (`640px - 1024px`):** 2-column card layouts, collapsed icon sidebar.
- **Desktop (`1024px - 1440px`):** Full sidebar, 12-column grid, drawer overlay.
- **Ultrawide (`> 1440px`):** Max width container `1600px`, fixed sidebars, multi-pane views.

### 7.2 Component Transformations by Viewport

| Component | Desktop (`>= 1024px`) | Tablet (`640px - 1023px`) | Mobile (`< 640px`) |
| :--- | :--- | :--- | :--- |
| **Sidebar** | Pinned expanded (`w-64`). | Pinned collapsed icon-only (`w-[72px]`). | Hidden; toggled via Hamburger drawer (`Sheet`). |
| **Finding Drawer** | Slides in from right (`w-[640px]`). | Slides in from right (`w-[500px]`). | Fullscreen modal bottom-sheet (`h-[92vh]`). |
| **Data Tables** | 7-column tabular grid. | 5-column grid (hides commit SHA & author). | Transformed into stacked card list with accordion. |
| **KPI Metrics** | 4-column row (`grid-cols-4`). | 2x2 grid (`grid-cols-2`). | 1-column vertical stack (`grid-cols-1`). |
| **Policy Studio** | Side-by-side (Form left, YAML right).| Stacked tabs (Tab 1: Form, Tab 2: YAML).| Tabbed view; YAML editor read-only with copy. |

---

## 8. UX Principles & Micro-Interactions

### 8.1 Zero Cognitive Load Feedback
1. **Optimistic UI Updates:** When an AppSec engineer clicks `"Approve Waiver"`, the request card immediately animates to an approved state with a green check, while the API network request executes in the background. If the request fails, the state gracefully rolls back with an alert.
2. **Click-to-Copy Everywhere:** Any commit SHA (`8a1f3c`), fingerprint, file path, or command snippet has an implicit or explicit hover copy trigger. Clicking shows a transient checkmark icon and tooltip: `"Copied!"` for 1.5 seconds.
3. **Defensive Destruction Guardrails:** Destructive actions (e.g. revoking a CI token or deleting a repository policy) require typing a confirmation word (e.g., `"REVOKE"`) in an alert dialog.
4. **Keyboard First (`Cmd+K`):** Platform engineers navigate without touching the mouse. Pressing `Cmd+K` opens a fuzzy search palette allowing instant jump to any repository, finding, or policy setting.

### 8.2 Micro-Animations & Transitions
- **Duration:** Kept between `120ms` and `200ms`—snappy and intentional. Never sluggish.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Apple/Linear spring curve).
- **Radar Scan Pulse:** When listening for incoming runner payloads in onboarding, an animated radar pulse rings outward around the scanner icon to indicate live active polling.

---

## 9. Visual References & Aesthetic Benchmarks

When building GateSentry UI components, consult the following visual archetypes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VISUAL BENCHMARK COMPARISONS                         │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ Reference Archetype  │ Specific Design Attributes to Emulate in GateSentry  │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ **Linear.app**       │ Ultra-crisp dark mode, hairline borders (1px 8% opac)│
│                      │ Fast keyboard navigation, minimal font sizing,       │
│                      │ Status pill indicators with micro pulsing dots.      │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ **Vercel Dashboard** │ Monochrome card grids, high typographic hierarchy,   │
│                      │ Clean deployment status badges, monospace git tags.  │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ **GitHub Security**  │ SARIF alert presentation, line-by-line code viewer,  │
│                      │ Clear CVSS severity scoring and CWE categorization.  │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ **Raycast**          │ Command palette UX, hotkey pill hints (`⌘K`, `Esc`), │
│                      │ High-contrast dark elevation layers with glow spots. │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 10. Tailwind CSS Configuration Preset (AI Builder Ready)

For an AI app builder or frontend engineer configuring Tailwind CSS, use this exact theme extension:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: {
          1: "#0E131F",
          2: "#141B2D",
          elevated: "#1C243B",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          focus: "rgba(99, 102, 241, 0.40)",
        },
        severity: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#F59E0B",
          low: "#06B6D4",
          pass: "#10B981",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(99, 102, 241, 0.25)",
        "glow-critical": "0 0 20px -5px rgba(239, 68, 68, 0.35)",
        "glow-pass": "0 0 20px -5px rgba(16, 185, 129, 0.35)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---
*End of GateSentry UI/UX Design Brief. Use this design system specification alongside `APP_FLOW.md` to implement pixel-perfect, accessible, and stunning DevSecOps interfaces.*
