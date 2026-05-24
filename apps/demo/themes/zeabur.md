---
name: Zeabur
description: Infrastructure-platform deck — true-black canvas, dotted binary lattice, dashed modular seams, diagonal hazard-tape transitions, and the signature "Ask Zeabur Agent" prompt bar.
---

# Zeabur

Lifted from the live Zeabur landing page and the team's "landing reland" notes. The look is dark-mode-first and *deliberately* shows its seams: every section is wrapped in a 1.5 px **dashed** outline (revealing the modular grid the team designed for), separated from its neighbour by a **diagonal hazard-tape** band, and laid over a faint **dotted lattice** background that reads like scattered binary data. Corners stay small (6 px standard, 4 px on chips) because the platform reads "production-ready," not "consumer-cute." Type is one geometric sans plus one mono — sans for prose, mono for every region, status, deploy hash, and prompt placeholder.

## Palette

| Role          | Value                          | Notes                                                       |
| ------------- | ------------------------------ | ----------------------------------------------------------- |
| bg            | `#0A0A0A`                      | true near-black canvas                                      |
| surface       | `#0F0F12`                      | card / panel background                                     |
| surfaceHi     | `#16161B`                      | inner panels, prompt bar, code blocks                       |
| border        | `#1C1C22`                      | solid 1 px outline on cards, pills                          |
| borderSeam    | `#4A4A55`                      | dashed outline for section seams (kept visible at 1080p)    |
| text          | `#FFFFFF`                      | primary copy (pure white, not off-white)                    |
| muted         | `#8B8B95`                      | secondary copy, footer counter, mono metadata               |
| mutedDim      | `#52525B`                      | captions, lattice dots, deep-background labels              |
| accent        | `#7C3AED`                      | Zeabur brand violet — buttons, status, "New" pill           |
| accentBright  | `#A78BFA`                      | hover, glow, eyebrow dot, link underline                    |
| accentSoft    | `rgba(124, 58, 237, 0.15)`     | pill fill at low opacity, ring tints                        |
| success       | `#10B981`                      | "Deployed" / "Sent" status indicator                        |

## Typography

- Display font: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif` — weight **700** for the hero, **600** for section headings (never 800+, that reads playful).
- Body font: same family — weight 400, weight 500 for emphasis.
- Mono font: `'JetBrains Mono', 'SF Mono', 'Menlo', monospace` — for region codes, deploy hashes, page counters, every eyebrow tag, and the prompt-bar placeholder.
- Type scale (1920 × 1080 canvas):
  - Hero title (cover): 116 px, line-height 1.04, letter-spacing -0.025em, weight 700.
  - Title alt (closing, centred): 104 px, weight 700.
  - Section heading (centred): 64–68 px, weight 600, letter-spacing -0.018em.
  - Page heading (left, product pages): 60 px, weight 600, letter-spacing -0.018em, line-height 1.06.
  - Lead paragraph: 30 px, line-height 1.5, muted.
  - Centred sub-lead: 26–28 px, line-height 1.5, muted.
  - Card title: 26 px (compact / FeatureItem), 30 px (default), 34 px (full-bleed feature), weight 600.
  - Card body: 20 px, line-height 1.55, muted.
  - Eyebrow / section tag: 17 px, mono, uppercase, letter-spacing 0.22em.
  - Eyebrow chip: 16 px, mono, uppercase, with an 8 px glowing dot.
  - Status pill: 16 px, mono, weight 500.
  - Footer / counter: 16 px, mono, letter-spacing 0.04em, color `muted`.
  - Mono code block: 22 px, line-height 1.6.

## Layout

- Canvas padding: 120 px horizontal, 96 px vertical (64 px top on centred overview pages with a hazard-tape band).
- Alignment: **left** on hero and product pages (Cover, Servers, Domain, Email, AI Hub, Closing-with-AskBar), **centred** on overview pages (Platform, Skills).
- **Seam frame.** Every page wears a 1.5 px **dashed** `borderSeam` (`#4A4A55`) rectangle inset 48 px from the canvas edge — the modular section frame from the live site, kept visible at slide scale.
- **Hazard-tape divider.** A 14 px diagonal-striped band (`accent` over transparent at -45°) sits at the top of centred overview pages — the signature transition mark from the landing redesign.
- **Dotted lattice background.** Static, faint dot grid at 16 × 16 px using `accentBright` at ~8 % opacity (`radial-gradient(circle, rgba(167, 139, 250, 0.08) 1px, transparent 1.5px)`). Reads as scattered binary data; never animates.
- Corner radius: **6 px** on cards and buttons, **4 px** on tiny chips (status pills, "New" pill). No radius larger than 8 px — anywhere.
- Surfaces: 1 px solid `border` outline, no drop shadow. A single off-axis radial glow per page in `accent` at opacity ≤ 0.18 is allowed; never two.

## Fixed components

### Title

The cover hero. One per deck — pair with `Title alt` at 104 px for the closing.

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      fontSize: 116,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: '-0.025em',
      margin: 0,
      color: '#FFFFFF',
    }}
  >
    {children}
  </h1>
);
```

### PageHeading

Left-aligned section heading on product pages.

```tsx
const PageHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      fontSize: 60,
      fontWeight: 600,
      letterSpacing: '-0.018em',
      lineHeight: 1.06,
      margin: 0,
      color: '#FFFFFF',
      maxWidth: 1320,
    }}
  >
    {children}
  </h2>
);
```

### Lead

Reusable lead paragraph — sits beneath the hero title and under every `PageHeading`.

```tsx
const Lead = ({ children, max = 1180 }: { children: React.ReactNode; max?: number }) => (
  <p
    style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      fontSize: 30,
      lineHeight: 1.5,
      color: '#8B8B95',
      margin: 0,
      maxWidth: max,
    }}
  >
    {children}
  </p>
);
```

### ProductHeader

The chip-eyebrow + `PageHeading` + `Lead` triad at the top of every left-aligned product page. Compose it once per product page, then drop the page-specific content below.

```tsx
const ProductHeader = ({
  eyebrow,
  heading,
  lead,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  lead: React.ReactNode;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Eyebrow chip>{eyebrow}</Eyebrow>
    <PageHeading>{heading}</PageHeading>
    <Lead>{lead}</Lead>
  </div>
);
```

### FeatureItem

Small icon + title + body card. Compose into 2-up or 4-up grids inside product pages.

```tsx
const FeatureItem = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div
    style={{
      padding: '22px 24px',
      borderRadius: 6,
      border: '1px solid #1C1C22',
      background: '#0F0F12',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 6,
          background: 'rgba(124, 58, 237, 0.15)',
          color: '#A78BFA',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 19,
        }}
      >
        {icon}
      </span>
      <h4
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: 0,
          color: '#FFFFFF',
        }}
      >
        {title}
      </h4>
    </div>
    <p
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        fontSize: 20,
        lineHeight: 1.55,
        color: '#8B8B95',
        margin: 0,
      }}
    >
      {body}
    </p>
  </div>
);
```

### Footer

Minimal — path on the left, mono tabular page counter on the right. No logomark, no wordmark; the canvas does the branding.

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = ({ path = 'zeabur.com' }: { path?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
        fontSize: 16,
        letterSpacing: '0.04em',
        color: '#8B8B95',
      }}
    >
      <span>{path}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {String(current).padStart(2, '0')}
        <span> / {String(total).padStart(2, '0')}</span>
      </span>
    </div>
  );
};
```

### Eyebrow

Plain mono eyebrow sits above centred section headings; the chip variant (with a glowing dot) sits above hero copy on the cover and as the eyebrow inside `ProductHeader`.

```tsx
const Eyebrow = ({ children, chip = false }: { children: React.ReactNode; chip?: boolean }) =>
  chip ? (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid #1C1C22',
        background: '#0F0F12',
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
        fontSize: 16,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#8B8B95',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#A78BFA',
          boxShadow: '0 0 8px #A78BFA',
        }}
      />
      {children}
    </div>
  ) : (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
        fontSize: 17,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#8B8B95',
      }}
    >
      {children}
    </div>
  );
```

### Status pill (Push / Building / Deployed)

Solid violet fill for the active state ("Building", "Deployed"), faint outline for the inactive prior step ("Push" once the build has started). Lifted straight from the live PR-row UI.

```tsx
type StatusTone = 'push' | 'building' | 'deployed';

const Status = ({ tone, children }: { tone: StatusTone; children: React.ReactNode }) => {
  const live = tone === 'deployed' || tone === 'building';
  const fill = live ? '#7C3AED' : 'rgba(124, 58, 237, 0.15)';
  const ink = live ? '#FFFFFF' : '#A78BFA';
  const icon = tone === 'push' ? '↑' : tone === 'building' ? '◐' : '✓';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: fill,
        color: ink,
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
        fontSize: 16,
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  );
};
```

### Diagonal hazard-tape band

The signature section transition. Use it once per centred overview page, at the top — never twice.

```tsx
const Stripes = ({ height = 14 }: { height?: number }) => (
  <div
    aria-hidden
    style={{
      height,
      width: '100%',
      backgroundImage:
        'repeating-linear-gradient(-45deg, #7C3AED 0 6px, transparent 6px 14px)',
      opacity: 0.55,
      borderTop: '1px solid #1C1C22',
      borderBottom: '1px solid #1C1C22',
    }}
  />
);
```

### Ask bar (signature prompt input)

The "Ask Zeabur Agent to deploy…" bar appears on every section of the live site. Use it on the cover and on the closer as a brand cue.

```tsx
const AskBar = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 18px',
      borderRadius: 6,
      background: '#16161B',
      border: '1px solid #1C1C22',
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
      fontSize: 20,
      color: '#8B8B95',
    }}
  >
    <span style={{ color: '#A78BFA' }}>Ask Zeabur Agent</span>
    <span style={{ flex: 1 }}>to deploy…</span>
    <span aria-hidden style={{ color: '#52525B', fontSize: 22 }}>
      ☁
    </span>
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 4,
        background: '#7C3AED',
        color: '#FFFFFF',
        fontSize: 18,
      }}
    >
      ↑
    </span>
  </div>
);
```

### SeamFrame

```tsx
const SeamFrame = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 48,
      border: '1.5px dashed #4A4A55',
      pointerEvents: 'none',
    }}
  />
);
```

### CodeBlock

For mono code samples (used on the AI Hub product page).

```tsx
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '22px 24px',
      borderRadius: 6,
      border: '1px solid #1C1C22',
      background: '#16161B',
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
      fontSize: 22,
      lineHeight: 1.6,
      color: '#8B8B95',
    }}
  >
    {children}
  </div>
);
```

Inside the block, colour keywords with `accentBright` (`#A78BFA`), string literals with `success` (`#10B981`), comments with `mutedDim` (`#52525B`), and identifiers with `text` (`#FFFFFF`).

## Motion

- Philosophy: **subtle.** The dashboard feels confident, not animated. One fade-up on the hero block and each card with a 60–80 ms stagger; the lattice, the seams, and the hazard tape stay still. Reserve `zb-pulse` for one status dot per page if you want the "Live"/"Building" pip to breathe.
- Reusable keyframes:

```css
@keyframes zb-fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes zb-pulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
```

## Aesthetic

A serious infrastructure platform — the way the Zeabur dashboard looks while a deploy is going green at 2 a.m. True-black canvas with one violet light source, a faint dotted lattice you only notice on the second glance, every section framed by a *dashed* outline so the modular grid is visible, and a diagonal hazard-tape band at the top of every centred overview page — the team's own "we'll show you the seams" signature. Mono for every region code, deploy hash, status pill, and the placeholder text inside the Ask bar; pure-white sans-700 for the hero, sans-600 for headings, sans-400 muted grey for body. Corners are restrained (6 px max, 4 px on chips) because the platform reads serious, not cute. Avoid: large rounded corners (12 px+), gradients beyond the single radial glow, drop shadows, multi-colour callouts on the same headline, photography, light-mode backgrounds, decorative emoji, off-white text. If the slide could be a screenshot from the Zeabur landing page with the page scrolled to a different section, it is on theme.

## Example usage

```tsx
const Servers: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background:
        '#0A0A0A radial-gradient(circle, rgba(167, 139, 250, 0.08) 1px, transparent 1.5px) 0 0 / 16px 16px',
      color: '#FFFFFF',
      padding: '96px 120px',
      display: 'flex',
      flexDirection: 'column',
      gap: 36,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <SeamFrame />
    <Glow x="88%" y="78%" size={1100} />
    <ProductHeader
      eyebrow="Servers & Clusters"
      heading={
        <>
          Enterprise-grade compute,
          <br />
          global node coverage.
        </>
      }
      lead="Dedicated instances and managed clusters from the world's top providers — provisioned, monitored, and deployed-into just like any other Zeabur service."
    />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      <FeatureItem
        icon="✓"
        title="Instant activation"
        body="Servers go live the moment you check out — no waiting on a provider."
      />
      <FeatureItem
        icon="↻"
        title="Auto upgrades"
        body="Zeabur patches kernels and rotates SSH keys on a schedule you control."
      />
    </div>
    <Footer path="zeabur.com/product/dedicated-server" />
  </div>
);
```
