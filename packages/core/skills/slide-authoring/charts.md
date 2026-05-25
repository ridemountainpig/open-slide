# Charts in open-slide pages

This is the **chart pattern library** — a reference companion to `SKILL.md` in this directory. Consult it whenever a slide needs to visualise data (bar / line / area / pie / donut / treemap / funnel / waterfall / gantt / scatter / slope / 2×2 quadrant / heatmap / diverging bar / KPI / sparkline / progress).

`SKILL.md` owns the file contract, canvas, type scale, palette, and visual direction — those rules still apply. This file only adds the chart-specific layer on top.

Every pattern below is a paste-ready React component using inline SVG. Copy one in, swap the data literals, adjust the `width` / `height`, and you're done. Animations are baked in — add the `<Style />` block once per page and the chart enter-animates the moment the slide mounts.

## Hard rules

- **No chart library.** `slide-authoring` forbids dependencies — `recharts`, `chart.js`, `d3`, `visx`, `echarts` are all off-limits. Pure React + inline SVG.
- **Fixed pixel sizing.** Every chart container declares `width` and `height` in px. No `100%`, no `ResponsiveContainer`-style wrappers.
- **Theme via CSS vars.** Primary series → `var(--osd-accent)`. Body / labels → `var(--osd-text)`. Background → `var(--osd-bg)`. Hard-coded hex on the primary series breaks the Design panel's live re-theming.
- **Respect the 1080px vertical budget.** Chart + title + axis labels + legend + caption must fit. See `slide-authoring` for the math.
- **Minimum label size: 22px** for axis ticks, primary legend text, and captions (22–28px). Body labels 32–44px. Secondary annotations — legend swatch labels, in-chart sub-labels, and corner / quadrant tags — may drop to 18–20px when paired with a larger primary label nearby.
- **No 3D, no exploded slices, no drop shadows, no gloss.** Flat 2D.
- **Always animate the enter.** A static slide chart feels dead in presentation mode. Use the `<Style />` block and apply the classes — never skip.
- **Square corners where a bar meets an axis or a stacked neighbour.** `<rect rx>` rounds all four corners and pulls the rectangle off the gridline. Use the `halfRoundPath` helper (defined below) to round only the outer edge — bottom-square for vertical bars, axis-side-square for diverging / stacked bars.

## Pick the right chart

| Data shape | Use |
| --- | --- |
| 1 metric over time | **line** (clean trend) or **area** (emphasise volume) |
| Composition over time (≥ 2 series stacked) | **stacked area** |
| Compare values across categories | **vertical bar** (short labels) or **horizontal bar** (long labels) |
| Two values per category (actual vs target, YoY) | **grouped bar** (side-by-side) or **stacked bar** (composition) |
| Change between two periods across categories | **slope chart** |
| Parts of a whole, ≤ 5 slices | **pie** or **donut** |
| Parts of a whole, > 5 categories | **treemap** (size by value) or **stacked bar** |
| Single headline number | **KPI big-number card** |
| Conversion / stage drop-off | **funnel** |
| Cumulative add/subtract (P&L, deltas) | **waterfall** |
| Project schedule / phases over time | **gantt** |
| Two variables, correlation | **scatter** |
| Items positioned on two axes (BCG, value vs effort) | **2×2 quadrant** |
| Density across two categorical dimensions (cohort retention) | **heatmap** |
| Symmetric responses around a midpoint (Likert, sentiment) | **diverging bar** |
| Trend in a tiny inline slot | **sparkline** |
| Completion / fill level | **progress bar** |

## Sizing recipe

Inside an 1920×1080 canvas with 120px horizontal padding, the chart area below the page heading is roughly **1680px wide × 700px tall**. **Fill it.** A chart that looks at home in 400px of vertical space leaves the bottom of the canvas dead — and dead canvas is the #1 reason slide charts feel weak.

Recommended sizes:

| Layout | Per-chart `width × height` |
| --- | --- |
| Single chart, full width | **1280–1400 × 640–700** |
| Two charts side-by-side | **800 × 640** each (≈ 80px gap) |
| Three charts side-by-side | **540 × 640** each (≈ 48px gap) |
| Pie/donut + sibling legend | **440 × 440** circle + ~280px legend column |
| Scatter + KPI column | **1080 × 640** scatter + 360-wide KPI cards |

Inside each chart's SVG:

- Reserve **~40px top** for any in-chart legend.
- Reserve **~60–70px bottom** for x-axis tick labels.
- Reserve **~70–80px left** for y-axis tick labels (or skip if values sit on the bars).
- Plot area = `chart_height − ~140px`. Scale the data so the largest value fills 80–90% of the plot height — never 100%.

In the page layout, wrap the chart row in a flex container with `flex: 1; align-items: center` so charts vertically centre in the available space instead of stacking at the top.

## Theming contract

```ts
// Primary series — always
fill: 'var(--osd-accent)'

// Highlighted "hero" value vs muted others (use within a single chart)
<rect fill="var(--osd-accent)" fillOpacity={isPeak ? 1 : 0.32} />

// Secondary / comparison series
const muted = 'var(--osd-text)';
<rect fill={muted} fillOpacity={0.32} />

// Axes, grid, ticks
stroke="var(--osd-text)" strokeOpacity={0.3}  // baseline
stroke="var(--osd-text)" strokeOpacity={0.07} // gridlines

// Axis / tick label text
fill="var(--osd-text)" fillOpacity={0.65}
```

For categorical palettes (pie slices, stacked series), build a lightness ladder anchored to the slide's accent:

```ts
const sliceColors = [
  'var(--osd-accent)',
  'color-mix(in oklch, var(--osd-accent) 55%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-accent) 28%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-text) 30%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-text) 55%, var(--osd-bg))',
];
```

`color-mix` keeps the categorical palette tied to the slide's tokens — no jarring rainbow, no breaking dark-mode.

## Animation — drop in once per page

Define one `<Style />` block per page (or once per slide if all pages share it). Every pattern below assumes these classes exist.

```tsx
const Style = () => (
  <style>{`
    @keyframes osd-bar-v { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes osd-bar-h { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes osd-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes osd-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes osd-pop { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
    @keyframes osd-draw { to { stroke-dashoffset: 0; } }
    @keyframes osd-grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .osd-bar-v { transform: scaleY(0); transform-origin: bottom; transform-box: fill-box; animation: osd-bar-v 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .osd-bar-h { transform: scaleX(0); transform-origin: left; transform-box: fill-box; animation: osd-bar-h 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .osd-fade { opacity: 0; animation: osd-fade 600ms ease-out both; }
    .osd-fade-up { opacity: 0; animation: osd-fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .osd-pop { opacity: 0; transform: scale(0.4); transform-origin: center; transform-box: fill-box; animation: osd-pop 500ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .osd-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: osd-draw 1000ms cubic-bezier(0.22, 1, 0.36, 1) both; }
    .osd-grow-x { transform: scaleX(0); transform-origin: left; animation: osd-grow-x 800ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  `}</style>
);
```

Then apply with one className + an inline `animationDelay` for stagger:

- Vertical bar: `<rect className="osd-bar-v" style={{ animationDelay: \`${i * 80}ms\` }} />`
- Horizontal bar: `<rect className="osd-bar-h" style={{ animationDelay: \`${i * 70}ms\` }} />`
- Line / polyline: `<polyline className="osd-draw" pathLength="1" />`
- Pie slice: `<path className="osd-fade" style={{ animationDelay: \`${i * 110}ms\` }} />`
- Scatter dot: `<circle className="osd-pop" style={{ animationDelay: \`${i * 45}ms\` }} />`
- Funnel stage: `<g className="osd-fade-up" style={{ animationDelay: \`${i * 120}ms\` }} />`
- KPI card / sparkline card / progress row: `className="osd-fade-up"` on the outer container.
- Progress fill: `<rect className="osd-grow-x" />`

**`pathLength="1"`** on a `<polyline>` / `<line>` normalises the path length to 1, so `stroke-dasharray: 1` + animated `stroke-dashoffset: 1 → 0` draws the line cleanly without computing its actual length.

**`transform-box: fill-box`** is required for `transform-origin` on SVG elements to behave relative to the element's bounding box. Without it, the origin is relative to the SVG root and bars grow from the wrong place.

Keep stagger small (40–120ms) and total duration under ~1.2s. Audiences don't wait — the slide must reach steady state fast.

## Shared helper: gridlines

Every bar / line / scatter chart should render gridlines so values are readable. Define once:

```tsx
const HGrid = ({
  padL, padT, plotW, plotH, ticks = 4,
}: {
  padL: number; padT: number; plotW: number; plotH: number; ticks?: number;
}) => (
  <g>
    {Array.from({ length: ticks + 1 }, (_, i) => {
      const t = i / ticks;
      const y = padT + plotH * (1 - t);
      const isBase = i === 0;
      return (
        <line
          key={i}
          x1={padL} y1={y}
          x2={padL + plotW} y2={y}
          stroke="var(--osd-text)"
          strokeOpacity={isBase ? 0.3 : 0.07}
        />
      );
    })}
  </g>
);
```

The baseline (bottom) is a noticeable 30% line; the other 4 ticks sit at 7% opacity — present, not noisy.

## Shared helper: half-rounded bar

`<rect rx>` rounds all four corners. That's wrong whenever a rectangle meets a baseline, gridline, or stacked neighbour — the rounding pulls the rect away from the axis and leaves a visible gap. Use this `halfRoundPath` helper to round **only the edge facing away from the axis**:

```tsx
const halfRoundPath = (
  x: number, y: number, w: number, h: number, r: number,
  side: 'left' | 'right' | 'top' | 'bottom',
) => {
  const cr = Math.min(r, w / 2, h / 2);
  switch (side) {
    case 'right':
      return `M${x},${y} L${x + w - cr},${y} A${cr},${cr} 0 0 1 ${x + w},${y + cr} L${x + w},${y + h - cr} A${cr},${cr} 0 0 1 ${x + w - cr},${y + h} L${x},${y + h} Z`;
    case 'left':
      return `M${x + w},${y} L${x + cr},${y} A${cr},${cr} 0 0 0 ${x},${y + cr} L${x},${y + h - cr} A${cr},${cr} 0 0 0 ${x + cr},${y + h} L${x + w},${y + h} Z`;
    case 'top':
      return `M${x},${y + cr} A${cr},${cr} 0 0 1 ${x + cr},${y} L${x + w - cr},${y} A${cr},${cr} 0 0 1 ${x + w},${y + cr} L${x + w},${y + h} L${x},${y + h} Z`;
    case 'bottom':
      return `M${x},${y} L${x + w},${y} L${x + w},${y + h - cr} A${cr},${cr} 0 0 1 ${x + w - cr},${y + h} L${x + cr},${y + h} A${cr},${cr} 0 0 1 ${x},${y + h - cr} Z`;
  }
};
```

Side picker:

| Chart | Direction the bar grows | Use |
| --- | --- | --- |
| Vertical bar (sits on baseline) | up | `'top'` |
| Horizontal bar (no visible axis line) | right | plain `<rect rx>` is fine |
| Stacked bar — bottom segment | up (between baseline + next segment) | plain `<rect>` (all square) |
| Stacked bar — top segment | up (above last segment) | `'top'` |
| Grouped bar | up | `'top'` |
| Waterfall pos / total bar | up from connector / baseline | `'top'` |
| Waterfall neg bar | down from connector | `'bottom'` |
| Diverging bar — positive side | right from centre | `'right'` |
| Diverging bar — negative side | left from centre | `'left'` |

The `cr = Math.min(r, w/2, h/2)` cap prevents the arcs from overflowing the rectangle when a bar is shorter than the corner radius.

Apply the same animation class (`osd-bar-v`, `osd-bar-h`) directly on the `<path>` — CSS `transform` works the same on any SVG element.

## Patterns

**Multiple charts on one slide → explicit instances** (`<RevenueBars />`, `<MarginBars />`), not iterated from a list. `slide-authoring`'s repeated-element rule applies at the chart-instance level. **Inside a single chart, `map` over data points is fine** — the data is the source of truth.

> **Sizing note**: The `W` / `H` in each pattern below are *placeholder values* that produce a readable demo at small scale. When you drop a chart into a real slide, **resize it to the recipe table above** — typically 540–1400px wide, 640–700px tall. Update `padL` / `padR` / `padT` / `padB` proportionally (~10–15% of the new dimensions) and bump label `fontSize` from 22 → 24–28px so labels read at the larger plot scale.

### 1. Vertical bar (column)

Highlight the peak value at full accent; mute the others to 32% opacity. Adds visual hierarchy without extra elements.

```tsx
const RevenueBars = () => {
  const data = [
    { label: 'Q1', value: 42 },
    { label: 'Q2', value: 58 },
    { label: 'Q3', value: 71 },
    { label: 'Q4', value: 64 },
  ];
  const W = 520;
  const H = 420;
  const padL = 56;
  const padR = 16;
  const padT = 28;
  const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value));
  const slot = plotW / data.length;
  const barW = slot * 0.58;
  return (
    <svg width={W} height={H} role="img" aria-label="Quarterly revenue">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      {data.map((d, i) => {
        const h = (d.value / max) * plotH * 0.88;
        const x = padL + slot * i + (slot - barW) / 2;
        const y = padT + plotH - h;
        const isPeak = d.value === max;
        return (
          <g key={d.label}>
            <path
              className="osd-bar-v"
              style={{ animationDelay: `${i * 80}ms` }}
              d={halfRoundPath(x, y, barW, h, 6, 'top')}
              fill="var(--osd-accent)"
              fillOpacity={isPeak ? 1 : 0.32}
            />
            <text
              className="osd-fade"
              style={{ animationDelay: `${i * 80 + 400}ms` }}
              x={x + barW / 2} y={y - 12}
              textAnchor="middle" fontSize={22}
              fontWeight={isPeak ? 700 : 500}
              fill="var(--osd-text)"
              fillOpacity={isPeak ? 1 : 0.7}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2} y={padT + plotH + 32}
              textAnchor="middle" fontSize={22}
              fill="var(--osd-text)" fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
```

### 2. Horizontal bar

Same peak/mute treatment, rotated. Better for long category names.

```tsx
const TeamHeadcount = () => {
  const data = [
    { label: 'Engineering', value: 86 },
    { label: 'Sales',       value: 58 },
    { label: 'Product',     value: 32 },
    { label: 'Design',      value: 24 },
    { label: 'Marketing',   value: 19 },
  ];
  const W = 520;
  const H = 420;
  const padL = 200;
  const padR = 48;
  const padT = 12;
  const padB = 12;
  const plotW = W - padL - padR;
  const rowH = (H - padT - padB) / data.length;
  const barH = rowH * 0.5;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <svg width={W} height={H} role="img" aria-label="Headcount by team">
      {data.map((d, i) => {
        const w = (d.value / max) * plotW * 0.88;
        const y = padT + rowH * i + (rowH - barH) / 2;
        const isPeak = d.value === max;
        return (
          <g key={d.label}>
            <text
              x={padL - 14} y={y + barH / 2}
              textAnchor="end" dominantBaseline="central"
              fontSize={22}
              fill="var(--osd-text)"
              fillOpacity={isPeak ? 1 : 0.75}
              fontWeight={isPeak ? 600 : 400}
            >
              {d.label}
            </text>
            <rect
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70}ms` }}
              x={padL} y={y} width={w} height={barH}
              fill="var(--osd-accent)"
              fillOpacity={isPeak ? 1 : 0.32}
              rx={5}
            />
            <text
              className="osd-fade"
              style={{ animationDelay: `${i * 70 + 400}ms` }}
              x={padL + w + 10} y={y + barH / 2}
              dominantBaseline="central"
              fontSize={22}
              fontWeight={isPeak ? 700 : 500}
              fill="var(--osd-text)"
              fillOpacity={isPeak ? 1 : 0.7}
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
```

### 3. Stacked bar

Two `<rect>` per category — first sits on the baseline, second offset by the first's height. Use full accent + 32% accent for the two series.

```tsx
const PlatformMix = () => {
  const data = [
    { label: 'Q1', a: 28, b: 14 },
    { label: 'Q2', a: 36, b: 22 },
    { label: 'Q3', a: 44, b: 27 },
    { label: 'Q4', a: 41, b: 30 },
  ];
  const W = 520;
  const H = 420;
  const padL = 56;
  const padR = 16;
  const padT = 44;
  const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.a + d.b));
  const slot = plotW / data.length;
  const barW = slot * 0.58;
  return (
    <svg width={W} height={H} role="img" aria-label="Platform mix by quarter">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      {data.map((d, i) => {
        const ha = (d.a / max) * plotH * 0.88;
        const hb = (d.b / max) * plotH * 0.88;
        const x = padL + slot * i + (slot - barW) / 2;
        const yA = padT + plotH - ha;
        const yB = yA - hb;
        return (
          <g
            key={d.label}
            className="osd-bar-v"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <rect x={x} y={yA} width={barW} height={ha} fill="var(--osd-accent)" />
            <path
              d={halfRoundPath(x, yB, barW, hb, 4, 'top')}
              fill="var(--osd-accent)" fillOpacity={0.32}
            />
            <text
              x={x + barW / 2} y={padT + plotH + 32}
              textAnchor="middle" fontSize={22}
              fill="var(--osd-text)" fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${padL}, 12)`} className="osd-fade" style={{ animationDelay: '400ms' }}>
        <rect width={14} height={14} fill="var(--osd-accent)" rx={2} />
        <text x={22} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Web</text>
        <rect x={88} width={14} height={14} fill="var(--osd-accent)" fillOpacity={0.32} rx={2} />
        <text x={110} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Mobile</text>
      </g>
    </svg>
  );
};
```

### 4. Line chart

Mark the peak with a larger circle + value callout — gives the eye somewhere to land. The line draws on via `stroke-dashoffset`.

```tsx
const MonthlyActive = () => {
  const data = [
    { label: 'Jan', value: 12 }, { label: 'Feb', value: 18 },
    { label: 'Mar', value: 24 }, { label: 'Apr', value: 27 },
    { label: 'May', value: 39 }, { label: 'Jun', value: 52 },
    { label: 'Jul', value: 60 },
  ];
  const W = 760; const H = 420;
  const padL = 64; const padR = 32; const padT = 36; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value));
  const xs = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const ys = (v: number) => padT + plotH - (v / max) * plotH * 0.88;
  const pts = data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(' ');
  const peakIdx = data.reduce((acc, d, i) => (d.value > data[acc].value ? i : acc), 0);
  return (
    <svg width={W} height={H} role="img" aria-label="Monthly active users">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      <polyline
        className="osd-draw"
        pathLength="1"
        points={pts}
        fill="none" stroke="var(--osd-accent)" strokeWidth={4}
        strokeLinejoin="round" strokeLinecap="round"
      />
      {data.map((d, i) => (
        <g key={d.label} className="osd-fade" style={{ animationDelay: `${300 + i * 90}ms` }}>
          <circle
            cx={xs(i)} cy={ys(d.value)}
            r={i === peakIdx ? 9 : 5}
            fill="var(--osd-accent)"
          />
          {i === peakIdx && (
            <text
              x={xs(i)} y={ys(d.value) - 22}
              textAnchor="middle" fontSize={22}
              fontWeight={700} fill="var(--osd-text)"
            >
              {d.value}M
            </text>
          )}
          <text
            x={xs(i)} y={padT + plotH + 32}
            textAnchor="middle" fontSize={22}
            fill="var(--osd-text)" fillOpacity={0.65}
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
```

### 5. Area chart

Line on top draws on; the filled area fades in 250ms later. The last point gets the endpoint callout.

```tsx
const Cumulative = () => {
  const data = [4, 9, 14, 22, 28, 36, 47, 58, 68, 80];
  const W = 760; const H = 420;
  const padL = 64; const padR = 32; const padT = 36; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data);
  const xs = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const ys = (v: number) => padT + plotH - (v / max) * plotH * 0.88;
  const linePts = data.map((v, i) => `${xs(i)},${ys(v)}`).join(' ');
  const areaPts = `${padL},${padT + plotH} ${linePts} ${padL + plotW},${padT + plotH}`;
  const last = data.length - 1;
  return (
    <svg width={W} height={H} role="img" aria-label="Cumulative signups">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      <polygon
        className="osd-fade"
        style={{ animationDelay: '250ms' }}
        points={areaPts}
        fill="var(--osd-accent)" fillOpacity={0.18}
      />
      <polyline
        className="osd-draw" pathLength="1"
        points={linePts}
        fill="none" stroke="var(--osd-accent)" strokeWidth={4}
        strokeLinejoin="round"
      />
      <g className="osd-fade" style={{ animationDelay: '1000ms' }}>
        <circle cx={xs(last)} cy={ys(data[last])} r={9} fill="var(--osd-accent)" />
        <text
          x={xs(last) - 14} y={ys(data[last]) - 14}
          textAnchor="end" fontSize={22}
          fontWeight={700} fill="var(--osd-text)"
        >
          {data[last]}K
        </text>
      </g>
    </svg>
  );
};
```

### 6. Pie / Donut

Slices fade in with stagger. Render the legend as a sibling block — don't try to label arcs inline. For a donut, overlay a centre circle with a total.

```tsx
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

const TrafficMix = () => {
  const data = [
    { label: 'Organic',  value: 48 },
    { label: 'Referral', value: 22 },
    { label: 'Social',   value: 18 },
    { label: 'Direct',   value: 12 },
  ];
  const sliceColors = [
    'var(--osd-accent)',
    'color-mix(in oklch, var(--osd-accent) 55%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-accent) 28%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-text) 30%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-text) 55%, var(--osd-bg))',
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 320; const H = 320; const cx = W/2; const cy = H/2; const r = 140;
  let angle = 0;
  return (
    <svg width={W} height={H} role="img" aria-label="Traffic by source">
      {data.map((d, i) => {
        const slice = (d.value / total) * 360;
        const path = describeArc(cx, cy, r, angle, angle + slice);
        angle += slice;
        return (
          <path
            key={d.label}
            className="osd-fade"
            style={{ animationDelay: `${i * 110}ms` }}
            d={path}
            fill={sliceColors[i % sliceColors.length]}
          />
        );
      })}
    </svg>
  );
};
```

Pair with a sibling `<div>` legend — one row per slice with a colour swatch + label + percentage. Use `fontVariantNumeric: 'tabular-nums'` (in `style={{}}` — not as an SVG attribute) on the percentage column so digits align.

**Donut variant.** Same arc geometry; overlay a centre `<circle>` matching the page background to punch the hole, then a total + label in the middle.

```tsx
const TrafficDonut = () => {
  const data = [
    { label: 'Organic',  value: 48 },
    { label: 'Referral', value: 22 },
    { label: 'Social',   value: 18 },
    { label: 'Direct',   value: 12 },
  ];
  const sliceColors = [
    'var(--osd-accent)',
    'color-mix(in oklch, var(--osd-accent) 55%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-accent) 28%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-text) 30%, var(--osd-bg))',
    'color-mix(in oklch, var(--osd-text) 55%, var(--osd-bg))',
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 320; const H = 320; const cx = W/2; const cy = H/2; const r = 140;
  let angle = 0;
  return (
    <svg width={W} height={H} role="img" aria-label="Traffic by source">
      {data.map((d, i) => {
        const slice = (d.value / total) * 360;
        const path = describeArc(cx, cy, r, angle, angle + slice);
        angle += slice;
        return (
          <path
            key={d.label}
            className="osd-fade"
            style={{ animationDelay: `${i * 110}ms` }}
            d={path}
            fill={sliceColors[i % sliceColors.length]}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={80} fill="var(--osd-bg)" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={36} fontWeight={800}
        fill="var(--osd-text)" fontFamily="var(--osd-font-display)">
        {total}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize={18}
        fill="var(--osd-text)" fillOpacity={0.6} letterSpacing="0.12em">
        TOTAL
      </text>
    </svg>
  );
};
```

### 7. Funnel — trapezoidal polygon

A real funnel tapers between stages, not a stack of rectangles. Each stage is one `<polygon>` whose top width equals this stage's value and bottom width equals the next stage's value.

```tsx
const Funnel = () => {
  const data = [
    { label: 'Visitors',  value: 10000 },
    { label: 'Signed up', value: 4200  },
    { label: 'Activated', value: 1800  },
    { label: 'Paying',    value: 620   },
  ];
  const W = 720;
  const H = 460;
  const padT = 20;
  const padB = 20;
  const stageH = (H - padT - padB) / data.length;
  const maxW = 600;
  const minW = 120;
  const max = data[0].value;
  const widthAt = (v: number) => Math.max((v / max) * maxW, minW);

  return (
    <svg width={W} height={H} role="img" aria-label="Acquisition funnel">
      {data.map((d, i) => {
        const next = data[i + 1];
        const wTop = widthAt(d.value);
        const wBot = next ? widthAt(next.value) : wTop * 0.85;
        const y = padT + stageH * i;
        const yNext = y + stageH;
        const pts = [
          `${(W - wTop) / 2},${y}`,
          `${(W + wTop) / 2},${y}`,
          `${(W + wBot) / 2},${yNext}`,
          `${(W - wBot) / 2},${yNext}`,
        ].join(' ');
        const labelInside = wTop > 220;
        const drop =
          i === 0
            ? null
            : `${(((data[i - 1].value - d.value) / data[i - 1].value) * 100).toFixed(0)}% drop`;
        return (
          <g key={d.label} className="osd-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
            <polygon points={pts} fill="var(--osd-accent)" fillOpacity={1 - i * 0.16} />
            {labelInside ? (
              <>
                <text x={W/2} y={y + stageH/2 - 6}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={24} fontWeight={700} fill="var(--osd-bg)">
                  {d.label}
                </text>
                <text x={W/2} y={y + stageH/2 + 20}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={22} fill="var(--osd-bg)" fillOpacity={0.85}
                  style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {d.value.toLocaleString()}
                </text>
              </>
            ) : (
              <text x={(W + wTop)/2 + 16} y={y + stageH/2}
                dominantBaseline="central"
                fontSize={22} fontWeight={600} fill="var(--osd-text)">
                {d.label}
                <tspan fill="var(--osd-text)" fillOpacity={0.5}>{'  '}{d.value.toLocaleString()}</tspan>
              </text>
            )}
            {drop && (
              <text x={W - 8} y={y + 2}
                textAnchor="end" fontSize={18}
                fill="var(--osd-text)" fillOpacity={0.5}>
                {drop}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
```

Use the `labelInside` heuristic — when a polygon is too narrow (last stages of a steep funnel), the label hops outside to the right rather than getting clipped inside the polygon.

### 8. Waterfall — bars + connector lines

Without connector lines, a waterfall looks like a normal grouped bar. The dashed horizontal connectors are what tell the audience "this is cumulative."

```tsx
type WaterfallDatum = { label: string; value: number; kind: 'pos' | 'neg' | 'total' };

const Waterfall = () => {
  const data: WaterfallDatum[] = [
    { label: 'Open',      value: 100, kind: 'total' },
    { label: 'New ARR',   value: 32,  kind: 'pos'   },
    { label: 'Expansion', value: 12,  kind: 'pos'   },
    { label: 'Churn',     value: -18, kind: 'neg'   },
    { label: 'Close',     value: 126, kind: 'total' },
  ];
  const W = 720; const H = 460;
  const padL = 56; const padR = 24; const padT = 40; const padB = 60;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const slot = plotW / data.length;
  const barW = slot * 0.6;

  let running = 0;
  const positions = data.map((d) => {
    if (d.kind === 'total') {
      const result = { top: d.value, bottom: 0 };
      running = d.value;
      return result;
    }
    const top = d.value > 0 ? running + d.value : running;
    const bottom = d.value > 0 ? running : running + d.value;
    running += d.value;
    return { top, bottom };
  });
  const max = Math.max(...positions.map((p) => p.top));
  const yScale = (v: number) => padT + plotH - (v / max) * plotH * 0.88;
  const xCenter = (i: number) => padL + slot * i + slot / 2;

  return (
    <svg width={W} height={H} role="img" aria-label="ARR waterfall">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      {/* Connectors */}
      {positions.map((_, i) => {
        if (i === 0) return null;
        const prevTop = yScale(positions[i - 1].top);
        const x1 = xCenter(i - 1) + barW / 2;
        const x2 = xCenter(i) - barW / 2;
        return (
          <line
            key={`conn-${i}`}
            className="osd-fade"
            style={{ animationDelay: `${i * 110 + 200}ms` }}
            x1={x1} y1={prevTop} x2={x2} y2={prevTop}
            stroke="var(--osd-text)" strokeOpacity={0.3}
            strokeDasharray="4 4"
          />
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = xCenter(i) - barW / 2;
        const yTop = yScale(positions[i].top);
        const yBot = yScale(positions[i].bottom);
        const h = Math.max(yBot - yTop, 2);
        const fillColor =
          d.kind === 'pos'   ? 'var(--osd-accent)'
        : d.kind === 'neg'   ? 'color-mix(in oklch, var(--osd-text) 78%, var(--osd-accent))'
        : /* total */          'var(--osd-text)';
        const roundSide = d.kind === 'neg' ? 'bottom' : 'top';
        return (
          <g key={d.label} className="osd-bar-v" style={{ animationDelay: `${i * 110}ms` }}>
            <path
              d={halfRoundPath(x, yTop, barW, h, 4, roundSide)}
              fill={fillColor}
              fillOpacity={d.kind === 'total' ? 0.88 : 1}
            />
            <text x={x + barW/2} y={yTop - 10}
              textAnchor="middle" fontSize={22}
              fontWeight={d.kind === 'total' ? 700 : 500}
              fill="var(--osd-text)">
              {d.kind === 'pos' ? `+${d.value}` : d.value}
            </text>
            <text x={x + barW/2} y={padT + plotH + 32}
              textAnchor="middle" fontSize={22}
              fill="var(--osd-text)" fillOpacity={0.65}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
```

### 9. Scatter — with trend line

Add a regression trend line to make the correlation explicit. Use slightly noisy data — perfectly linear scatter looks fake.

```tsx
const Scatter = () => {
  const data = [
    { x: 10, y: 16 }, { x: 18, y: 21 }, { x: 24, y: 22 }, { x: 31, y: 32 },
    { x: 36, y: 30 }, { x: 42, y: 41 }, { x: 49, y: 44 }, { x: 55, y: 47 },
    { x: 62, y: 56 }, { x: 68, y: 58 }, { x: 74, y: 60 }, { x: 80, y: 71 },
    { x: 86, y: 68 }, { x: 92, y: 78 },
  ];
  const W = 880; const H = 440;
  const padL = 64; const padR = 32; const padT = 28; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxX = 100; const maxY = 90;
  const xs = (v: number) => padL + (v / maxX) * plotW;
  const ys = (v: number) => padT + plotH - (v / maxY) * plotH;

  // Simple linear regression
  const meanX = data.reduce((s, d) => s + d.x, 0) / data.length;
  const meanY = data.reduce((s, d) => s + d.y, 0) / data.length;
  const slope =
    data.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0) /
    data.reduce((s, d) => s + (d.x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const trendY = (x: number) => slope * x + intercept;

  return (
    <svg width={W} height={H} role="img" aria-label="Engagement vs revenue">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} ticks={3} />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
        stroke="var(--osd-text)" strokeOpacity={0.3} />
      <line
        className="osd-draw" pathLength="1"
        style={{ animationDelay: '600ms' }}
        x1={xs(5)} y1={ys(trendY(5))}
        x2={xs(95)} y2={ys(trendY(95))}
        stroke="var(--osd-text)" strokeOpacity={0.45}
        strokeWidth={2} strokeDasharray="6 8"
      />
      {data.map((d, i) => (
        <circle
          key={i}
          className="osd-pop"
          style={{ animationDelay: `${i * 45}ms` }}
          cx={xs(d.x)} cy={ys(d.y)} r={9}
          fill="var(--osd-accent)" fillOpacity={0.78}
        />
      ))}
    </svg>
  );
};
```

### 10. KPI big-number card

Replace full-border cards with a **left accent bar** + tinted background. Heavier visual weight, cleaner edge.

```tsx
const KpiCard = ({
  label, value, delta, index = 0,
}: { label: string; value: string; delta: string; index?: number }) => (
  <div
    className="osd-fade-up"
    style={{
      width: 320, height: 200,
      padding: '28px 32px',
      borderLeft: '6px solid var(--osd-accent)',
      background: 'color-mix(in oklch, var(--osd-text) 4%, transparent)',
      borderRadius: 'var(--osd-radius)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      animationDelay: `${index * 120}ms`,
      boxSizing: 'border-box',
    }}
  >
    <div style={{
      fontSize: 20, letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--osd-text)', opacity: 0.55, fontWeight: 600,
    }}>
      {label}
    </div>
    <div style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 88, fontWeight: 800, lineHeight: 1,
      color: 'var(--osd-text)',
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
    </div>
    <div style={{ fontSize: 22, color: 'var(--osd-accent)', fontWeight: 600 }}>{delta}</div>
  </div>
);
```

For a row of KPIs, instantiate explicit cards (`<KpiCard label="ARR" ... index={0} />`, `<KpiCard label="Users" ... index={1} />`, `<KpiCard label="NPS" ... index={2} />`) — don't `map` over a config array. The inspector should be able to edit each card independently. `index` only drives the animation stagger.

### 11. Sparkline

Tiny line chart, no axes. Pair inside a KPI-style card for "metric + 7-day trend." Stroke draws on; pass `delay` to coordinate with the card's enter animation. Size it to its host — `width` defaults to a small slot, bump it up when the card is bigger.

```tsx
const Sparkline = ({
  values, delay = 0, width = 320, height = 64,
}: {
  values: number[]; delay?: number; width?: number; height?: number;
}) => {
  const W = width;
  const H = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / span) * H * 0.85 - 4}`)
    .join(' ');
  return (
    <svg width={W} height={H} aria-hidden="true">
      <polyline
        className="osd-draw" pathLength="1"
        style={{ animationDelay: `${delay}ms` }}
        points={pts}
        fill="none" stroke="var(--osd-accent)"
        strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
};
```

### 12. Progress bar

Track + fill. The fill `scaleX`-grows from 0; transform-origin must be `left`. **Span the full content width** when the bar is the headline element — a 540-wide bar on a 1920 canvas leaves dead space.

```tsx
const Progress = ({
  label, value, index = 0,
}: { label: string; value: number; index?: number }) => {
  const W = 1680; const H = 22;
  return (
    <div
      className="osd-fade-up"
      style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        width: W, animationDelay: `${index * 110}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
        <span style={{ color: 'var(--osd-text)' }}>{label}</span>
        <span style={{
          color: 'var(--osd-text)', opacity: 0.6,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}%
        </span>
      </div>
      <svg width={W} height={H} aria-label={`${label} ${value} percent`}>
        <rect x={0} y={0} width={W} height={H} rx={H/2}
          fill="var(--osd-text)" fillOpacity={0.12} />
        <rect
          className="osd-grow-x"
          style={{ animationDelay: `${index * 110 + 200}ms` }}
          x={0} y={0} width={(value/100) * W} height={H} rx={H/2}
          fill="var(--osd-accent)"
        />
      </svg>
    </div>
  );
};
```

### 13. Gantt — project timeline

Phases as horizontal bars on a week axis. Three signals tell the audience it's a roadmap, not a generic horizontal bar: **active phase = full accent, others = 32%**; **TODAY line** as a dashed accent vertical; end events as **diamond polygons**, not bars. Without those three the chart reads flat.

```tsx
type GanttDatum = {
  label: string;
  start: number;
  end: number;
  kind?: 'milestone';
  status?: 'active';
};

const GanttChart = () => {
  const data: GanttDatum[] = [
    { label: 'Discovery',   start: 0,  end: 3  },
    { label: 'Design',      start: 3,  end: 6  },
    { label: 'Engineering', start: 5,  end: 11, status: 'active' },
    { label: 'QA',          start: 9,  end: 12 },
    { label: 'Beta',        start: 10, end: 12 },
    { label: 'Launch',      start: 12, end: 12, kind: 'milestone' },
  ];
  const totalWeeks = 12;
  const today = 6.5;
  const W = 760; const H = 460;
  const padL = 180; const padR = 120; const padT = 60; const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const rowH = plotH / data.length;
  const barH = rowH * 0.5;
  const xs = (w: number) => padL + (w / totalWeeks) * plotW;
  const ticks = Array.from({ length: totalWeeks / 2 + 1 }, (_, i) => i * 2);
  return (
    <svg width={W} height={H} role="img" aria-label="Q3 launch roadmap">
      {ticks.map((w) => (
        <line key={`g-${w}`} x1={xs(w)} y1={padT - 6} x2={xs(w)} y2={padT + plotH}
          stroke="var(--osd-text)" strokeOpacity={w === 0 ? 0.3 : 0.07} />
      ))}
      {ticks.map((w) => (
        <text key={`l-${w}`} x={xs(w)} y={padT - 18} textAnchor="middle"
          fontSize={22} fill="var(--osd-text)" fillOpacity={0.6}>W{w}</text>
      ))}
      {data.map((d, i) => {
        const y = padT + rowH * i + (rowH - barH) / 2;
        const x = xs(d.start);
        const w = Math.max(xs(d.end) - xs(d.start), 4);
        const isActive = d.status === 'active';
        const isMilestone = d.kind === 'milestone';
        return (
          <g key={d.label}>
            <text x={padL - 16} y={y + barH / 2}
              textAnchor="end" dominantBaseline="central"
              fontSize={22}
              fill="var(--osd-text)"
              fillOpacity={isActive || isMilestone ? 1 : 0.75}
              fontWeight={isActive || isMilestone ? 600 : 400}>
              {d.label}
            </text>
            {isMilestone ? (
              <polygon className="osd-pop" style={{ animationDelay: `${i * 80}ms` }}
                points={`${x},${y + barH / 2 - 14} ${x + 14},${y + barH / 2} ${x},${y + barH / 2 + 14} ${x - 14},${y + barH / 2}`}
                fill="var(--osd-accent)" />
            ) : (
              <>
                <rect className="osd-bar-h" style={{ animationDelay: `${i * 80}ms` }}
                  x={x} y={y} width={w} height={barH} rx={6}
                  fill="var(--osd-accent)" fillOpacity={isActive ? 1 : 0.32} />
                <text className="osd-fade" style={{ animationDelay: `${i * 80 + 400}ms` }}
                  x={x + w + 10} y={y + barH / 2}
                  dominantBaseline="central" fontSize={20}
                  fontWeight={isActive ? 700 : 500}
                  fill="var(--osd-text)" fillOpacity={isActive ? 1 : 0.7}>
                  W{d.start}–W{d.end}
                </text>
              </>
            )}
          </g>
        );
      })}
      <g className="osd-fade" style={{ animationDelay: '900ms' }}>
        <line x1={xs(today)} y1={padT - 10} x2={xs(today)} y2={padT + plotH + 4}
          stroke="var(--osd-accent)" strokeOpacity={0.75}
          strokeWidth={2.5} strokeDasharray="6 6" />
        <text x={xs(today)} y={padT - 40} textAnchor="middle"
          fontSize={20} fontWeight={700}
          fill="var(--osd-accent)" letterSpacing="0.14em">
          TODAY
        </text>
      </g>
    </svg>
  );
};
```

The diamond is an absolute-coordinate `<polygon>` (no `transform` attribute) so the `osd-pop` animation can scale it from its bbox centre without conflict.

### 14. Grouped bar (clustered)

Two bars per category, side-by-side — actual vs target, this year vs last, treatment vs control. First series at full accent, second at 32%. Add a small top legend so the colours read.

```tsx
const GroupedBars = () => {
  const data = [
    { label: 'Q1', actual: 42, target: 50 },
    { label: 'Q2', actual: 58, target: 55 },
    { label: 'Q3', actual: 71, target: 65 },
    { label: 'Q4', actual: 64, target: 75 },
  ];
  const W = 520; const H = 440;
  const padL = 56; const padR = 16; const padT = 60; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.flatMap((d) => [d.actual, d.target]));
  const slot = plotW / data.length;
  const groupW = slot * 0.66;
  const barW = (groupW - 6) / 2;
  return (
    <svg width={W} height={H} role="img" aria-label="Actual vs target by quarter">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      {data.map((d, i) => {
        const groupX = padL + slot * i + (slot - groupW) / 2;
        const xA = groupX;
        const xB = groupX + barW + 6;
        const hA = (d.actual / max) * plotH * 0.88;
        const hB = (d.target / max) * plotH * 0.88;
        return (
          <g key={d.label} className="osd-bar-v" style={{ animationDelay: `${i * 80}ms` }}>
            <path
              d={halfRoundPath(xA, padT + plotH - hA, barW, hA, 4, 'top')}
              fill="var(--osd-accent)" />
            <path
              d={halfRoundPath(xB, padT + plotH - hB, barW, hB, 4, 'top')}
              fill="var(--osd-accent)" fillOpacity={0.32} />
            <text x={groupX + groupW / 2} y={padT + plotH + 32}
              textAnchor="middle" fontSize={22}
              fill="var(--osd-text)" fillOpacity={0.65}>
              {d.label}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${padL}, 14)`} className="osd-fade" style={{ animationDelay: '400ms' }}>
        <rect width={14} height={14} fill="var(--osd-accent)" rx={2} />
        <text x={22} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Actual</text>
        <rect x={104} width={14} height={14} fill="var(--osd-accent)" fillOpacity={0.32} rx={2} />
        <text x={126} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Target</text>
      </g>
    </svg>
  );
};
```

For a third series, extend the lightness ladder with one `color-mix` step — don't reach for a second hue.

### 15. Slope chart

Two columns of values (Before / After) connected by category lines. Highlight the **single biggest mover** at full accent; mute everything else to 32% so the eye knows where to land. No x-axis ticks — there are only two x-positions.

```tsx
const SlopeChart = () => {
  const data = [
    { label: 'Discovery',  before: 38, after: 72 },
    { label: 'Activation', before: 64, after: 65 },
    { label: 'Onboarding', before: 52, after: 78 },
    { label: 'Checkout',   before: 58, after: 41 },
    { label: 'Retention',  before: 46, after: 59 },
  ];
  const heroIdx = data.reduce(
    (acc, d, i) =>
      Math.abs(d.after - d.before) > Math.abs(data[acc].after - data[acc].before) ? i : acc,
    0,
  );
  const W = 620; const H = 440;
  const padL = 200; const padR = 100; const padT = 60; const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const all = data.flatMap((d) => [d.before, d.after]);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const ys = (v: number) => padT + (1 - (v - min) / range) * plotH * 0.9 + plotH * 0.05;
  return (
    <svg width={W} height={H} role="img" aria-label="NPS before vs after">
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
        stroke="var(--osd-text)" strokeOpacity={0.15} />
      <line x1={padL + plotW} y1={padT} x2={padL + plotW} y2={padT + plotH}
        stroke="var(--osd-text)" strokeOpacity={0.15} />
      <text x={padL} y={padT - 22} textAnchor="middle"
        fontSize={22} fontWeight={600}
        fill="var(--osd-text)" fillOpacity={0.7}>Before</text>
      <text x={padL + plotW} y={padT - 22} textAnchor="middle"
        fontSize={22} fontWeight={600}
        fill="var(--osd-text)" fillOpacity={0.7}>After</text>
      {data.map((d, i) => {
        const isHero = i === heroIdx;
        const yB = ys(d.before);
        const yA = ys(d.after);
        const op = isHero ? 1 : 0.32;
        return (
          <g key={d.label} className="osd-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
            <line x1={padL} y1={yB} x2={padL + plotW} y2={yA}
              stroke="var(--osd-accent)" strokeOpacity={op}
              strokeWidth={isHero ? 4 : 2.5} />
            <circle cx={padL} cy={yB} r={isHero ? 8 : 5}
              fill="var(--osd-accent)" fillOpacity={op} />
            <circle cx={padL + plotW} cy={yA} r={isHero ? 8 : 5}
              fill="var(--osd-accent)" fillOpacity={op} />
            <text x={padL - 14} y={yB}
              textAnchor="end" dominantBaseline="central"
              fontSize={22}
              fontWeight={isHero ? 600 : 400}
              fill="var(--osd-text)" fillOpacity={isHero ? 1 : 0.65}>
              {d.label}{' '}
              <tspan fontSize={20} fillOpacity={0.5}>{d.before}</tspan>
            </text>
            <text x={padL + plotW + 14} y={yA}
              dominantBaseline="central" fontSize={22}
              fontWeight={isHero ? 700 : 500}
              fill="var(--osd-text)" fillOpacity={isHero ? 1 : 0.65}>
              {d.after}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
```

`<tspan>` lets one `<text>` mix font weights / opacities — useful for `label + secondary value` composites. Position attributes go on the outer `<text>`; `<tspan>` inherits the cursor.

### 16. 2×2 quadrant / matrix

Two axes through the centre, four quadrants, items as labelled dots. **Tint the "target" quadrant** so the audience knows which corner you're driving toward; items inside it render at full opacity, the rest at 45%. Without the tint it looks like a scatter with no story.

```tsx
type QuadItem = { label: string; x: number; y: number };

const Quadrant = () => {
  const items: QuadItem[] = [
    { label: 'Onboarding revamp', x: 0.18, y: 0.78 },
    { label: 'Search overhaul',   x: 0.72, y: 0.85 },
    { label: 'Billing redesign',  x: 0.74, y: 0.32 },
    { label: 'Dashboard tweaks',  x: 0.32, y: 0.32 },
    { label: 'Auto-save',         x: 0.24, y: 0.62 },
    { label: 'Notifications',     x: 0.52, y: 0.5  },
  ];
  const W = 600; const H = 460;
  const padL = 80; const padR = 80; const padT = 60; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const cx = padL + plotW / 2;
  const cy = padT + plotH / 2;
  const xs = (v: number) => padL + v * plotW;
  const ys = (v: number) => padT + (1 - v) * plotH;
  const inSweet = (d: QuadItem) => d.x < 0.5 && d.y > 0.5;
  return (
    <svg width={W} height={H} role="img" aria-label="Effort vs value matrix">
      <rect x={padL} y={padT} width={plotW / 2} height={plotH / 2}
        fill="var(--osd-accent)" fillOpacity={0.08} />
      <rect x={padL} y={padT} width={plotW} height={plotH}
        fill="none" stroke="var(--osd-text)" strokeOpacity={0.18} rx={4} />
      <line x1={padL} y1={cy} x2={padL + plotW} y2={cy}
        stroke="var(--osd-text)" strokeOpacity={0.2} />
      <line x1={cx} y1={padT} x2={cx} y2={padT + plotH}
        stroke="var(--osd-text)" strokeOpacity={0.2} />
      <text x={padL + 12} y={padT + 22} fontSize={18} fontWeight={700}
        fill="var(--osd-accent)" letterSpacing="0.14em">QUICK WINS</text>
      <text x={padL + plotW - 12} y={padT + 22} textAnchor="end" fontSize={18} fontWeight={600}
        fill="var(--osd-text)" fillOpacity={0.55} letterSpacing="0.14em">BIG BETS</text>
      <text x={padL + 12} y={padT + plotH - 14} fontSize={18} fontWeight={600}
        fill="var(--osd-text)" fillOpacity={0.45} letterSpacing="0.14em">FILL-INS</text>
      <text x={padL + plotW - 12} y={padT + plotH - 14} textAnchor="end" fontSize={18} fontWeight={600}
        fill="var(--osd-text)" fillOpacity={0.45} letterSpacing="0.14em">TIME SINKS</text>
      <text x={cx} y={padT + plotH + 36} textAnchor="middle" fontSize={22}
        fill="var(--osd-text)" fillOpacity={0.7}>Effort →</text>
      <g transform={`translate(${padL - 28}, ${cy}) rotate(-90)`}>
        <text textAnchor="middle" fontSize={22}
          fill="var(--osd-text)" fillOpacity={0.7}>Value →</text>
      </g>
      {items.map((d, i) => {
        const hot = inSweet(d);
        return (
          <g key={d.label} className="osd-pop" style={{ animationDelay: `${i * 80}ms` }}>
            <circle cx={xs(d.x)} cy={ys(d.y)} r={hot ? 10 : 7}
              fill="var(--osd-accent)" fillOpacity={hot ? 1 : 0.45} />
            <text x={xs(d.x)} y={ys(d.y) - 16}
              textAnchor="middle" fontSize={20}
              fontWeight={hot ? 700 : 500}
              fill="var(--osd-text)" fillOpacity={hot ? 1 : 0.6}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
```

Flip `inSweet` to `d.x > 0.5 && d.y > 0.5` for BCG-style "Stars in the top-right" framing. Corner labels at 18px is the only place these patterns bend the 22px minimum — they're corner accents, not axis labels.

### 17. Heatmap

A 2D grid of cells whose fill opacity encodes value — perfect for cohort retention, hour×weekday activity, correlation matrices. Use one accent + opacity ramp; the eye reads density. Flip the text colour from `var(--osd-text)` to `var(--osd-bg)` once a cell is dark enough that body text would smear (`op > 0.55`).

```tsx
const Heatmap = () => {
  const data = [
    [100, 68, 52, 42, 36, 31, 28],
    [100, 71, 55, 47, 40, 34, 30],
    [100, 73, 58, 48, 42, 37, 33],
    [100, 70, 56, 46, 38, 32, 29],
    [100, 74, 61, 51, 44, 39, 35],
    [100, 72, 59, 49, 42, 37, 33],
  ];
  const rowLabels = ['W22', 'W23', 'W24', 'W25', 'W26', 'W27'];
  const colLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
  const W = 640; const H = 440;
  const padL = 92; const padR = 16; const padT = 56; const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const cellW = plotW / colLabels.length;
  const cellH = plotH / rowLabels.length;
  const max = 100;
  return (
    <svg width={W} height={H} role="img" aria-label="Cohort retention heatmap">
      {colLabels.map((l, c) => (
        <text key={l} x={padL + cellW * c + cellW / 2} y={padT - 18}
          textAnchor="middle" fontSize={22}
          fill="var(--osd-text)" fillOpacity={0.6}>
          {l}
        </text>
      ))}
      {data.map((row, r) =>
        row.map((v, c) => {
          const op = Math.max(v / max, 0.06);
          const useBg = op > 0.55;
          return (
            <g key={`${r}-${c}`} className="osd-fade"
              style={{ animationDelay: `${(r + c) * 35}ms` }}>
              <rect
                x={padL + cellW * c + 3}
                y={padT + cellH * r + 3}
                width={cellW - 6}
                height={cellH - 6}
                fill="var(--osd-accent)"
                fillOpacity={op}
                rx={4}
              />
              <text
                x={padL + cellW * c + cellW / 2}
                y={padT + cellH * r + cellH / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize={20} fontWeight={500}
                fill={useBg ? 'var(--osd-bg)' : 'var(--osd-text)'}
                fillOpacity={useBg ? 1 : 0.85}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {v}
              </text>
            </g>
          );
        }),
      )}
      {rowLabels.map((l, r) => (
        <text key={l} x={padL - 14} y={padT + cellH * r + cellH / 2}
          textAnchor="end" dominantBaseline="central"
          fontSize={22} fill="var(--osd-text)" fillOpacity={0.75}>
          {l}
        </text>
      ))}
    </svg>
  );
};
```

Stagger entries diagonally (`(r + c) * 35ms`) — a left-to-right sweep feels mechanical for a 2D grid; a diagonal wave reads as "the whole matrix arrives at once."

### 18. Stacked area

Several series stacked on top of each other over time, filled. Bottom (largest / primary) series at full accent, others step down through one or two opacity stops. The eye reads the band thicknesses as the composition of the total.

```tsx
const StackedArea = () => {
  const data = [
    { label: 'Jan', mobile: 18, web: 14, other: 4 },
    { label: 'Feb', mobile: 22, web: 16, other: 5 },
    { label: 'Mar', mobile: 28, web: 18, other: 6 },
    { label: 'Apr', mobile: 35, web: 20, other: 7 },
    { label: 'May', mobile: 42, web: 21, other: 7 },
    { label: 'Jun', mobile: 52, web: 22, other: 8 },
    { label: 'Jul', mobile: 60, web: 23, other: 9 },
  ];
  const W = 760; const H = 440;
  const padL = 64; const padR = 32; const padT = 56; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const stacks = data.map((d) => ({
    s1: d.mobile,
    s2: d.mobile + d.web,
    s3: d.mobile + d.web + d.other,
  }));
  const max = Math.max(...stacks.map((s) => s.s3));
  const xs = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const ys = (v: number) => padT + plotH - (v / max) * plotH * 0.88;
  const makeBand = (lower: number[], upper: number[]) => {
    const upperPts = upper.map((v, i) => `${xs(i)},${ys(v)}`).join(' ');
    const lowerPts = lower
      .map((v, i) => `${xs(i)},${ys(v)}`)
      .reverse()
      .join(' ');
    return `${upperPts} ${lowerPts}`;
  };
  const zero = stacks.map(() => 0);
  const lvl1 = stacks.map((s) => s.s1);
  const lvl2 = stacks.map((s) => s.s2);
  const lvl3 = stacks.map((s) => s.s3);
  return (
    <svg width={W} height={H} role="img" aria-label="Revenue by platform">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      <polygon className="osd-fade" style={{ animationDelay: '0ms' }}
        points={makeBand(zero, lvl1)} fill="var(--osd-accent)" />
      <polygon className="osd-fade" style={{ animationDelay: '180ms' }}
        points={makeBand(lvl1, lvl2)} fill="var(--osd-accent)" fillOpacity={0.55} />
      <polygon className="osd-fade" style={{ animationDelay: '360ms' }}
        points={makeBand(lvl2, lvl3)} fill="var(--osd-accent)" fillOpacity={0.28} />
      {data.map((d, i) => (
        <text key={d.label} x={xs(i)} y={padT + plotH + 32}
          textAnchor="middle" fontSize={22}
          fill="var(--osd-text)" fillOpacity={0.65}>
          {d.label}
        </text>
      ))}
      <g transform={`translate(${padL}, 18)`} className="osd-fade" style={{ animationDelay: '540ms' }}>
        <rect width={14} height={14} fill="var(--osd-accent)" rx={2} />
        <text x={22} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Mobile</text>
        <rect x={92} width={14} height={14} fill="var(--osd-accent)" fillOpacity={0.55} rx={2} />
        <text x={114} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Web</text>
        <rect x={172} width={14} height={14} fill="var(--osd-accent)" fillOpacity={0.28} rx={2} />
        <text x={194} y={11} fontSize={18} fill="var(--osd-text)" fillOpacity={0.7}>Other</text>
      </g>
    </svg>
  );
};
```

Polygon path = upper boundary L→R + lower boundary R→L. `polygon` auto-closes the shape. **Order the series largest at the bottom** — the audience reads the bottom band first and the top bands as additive.

### 19. Treemap

Nested rectangles whose area is proportional to value. Good for composition when you have more than 5 categories (where a pie becomes illegible). This pattern uses a one-shot slice-and-dice with a **direction switch keyed on the leader's share**: if the leader takes > 40% of the total, give it a wide top band and stack the rest in a row below; otherwise put it in the left column and stack the rest on the right. Without that switch a dominant leader becomes a tall sliver and loses its dominance.

```tsx
type TreeDatum = { label: string; value: number };

const Treemap = () => {
  const items: TreeDatum[] = [
    { label: 'Mobile',     value: 48 },
    { label: 'Web',        value: 22 },
    { label: 'Native app', value: 14 },
    { label: 'Embed',      value: 9  },
    { label: 'API',        value: 7  },
  ];
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, d) => s + d.value, 0);
  const W = 600; const H = 420;
  const leaderShare = sorted[0].value / total;
  const restTotal = total - sorted[0].value;
  const stackTopBottom = leaderShare > 0.4;
  let rects: Array<{ x: number; y: number; w: number; h: number; label: string; value: number; i: number }>;
  if (stackTopBottom) {
    const topH = leaderShare * H;
    let xCursor = 0;
    rects = [
      { x: 0, y: 0, w: W, h: topH, ...sorted[0], i: 0 },
      ...sorted.slice(1).map((item, idx) => {
        const w = (item.value / restTotal) * W;
        const r = { x: xCursor, y: topH, w, h: H - topH, ...item, i: idx + 1 };
        xCursor += w;
        return r;
      }),
    ];
  } else {
    const leftW = leaderShare * W;
    let yCursor = 0;
    rects = [
      { x: 0, y: 0, w: leftW, h: H, ...sorted[0], i: 0 },
      ...sorted.slice(1).map((item, idx) => {
        const h = (item.value / restTotal) * H;
        const r = { x: leftW, y: yCursor, w: W - leftW, h, ...item, i: idx + 1 };
        yCursor += h;
        return r;
      }),
    ];
  }
  const opacities = [1, 0.7, 0.5, 0.32, 0.2];
  return (
    <svg width={W} height={H} role="img" aria-label="Channel share">
      {rects.map((r) => {
        const op = opacities[Math.min(r.i, opacities.length - 1)];
        const isLargest = r.i === 0;
        const useBg = op > 0.55;
        return (
          <g key={r.label} className="osd-fade" style={{ animationDelay: `${r.i * 80}ms` }}>
            <rect x={r.x + 3} y={r.y + 3} width={r.w - 6} height={r.h - 6}
              fill="var(--osd-accent)" fillOpacity={op} rx={6} />
            {r.w > 80 && r.h > 48 && (
              <>
                <text x={r.x + 18} y={r.y + 30}
                  fontSize={isLargest ? 28 : 20} fontWeight={700}
                  fill={useBg ? 'var(--osd-bg)' : 'var(--osd-text)'}>
                  {r.label}
                </text>
                <text x={r.x + 18} y={r.y + (isLargest ? 60 : 54)}
                  fontSize={isLargest ? 22 : 16} fontWeight={600}
                  fill={useBg ? 'var(--osd-bg)' : 'var(--osd-text)'}
                  fillOpacity={0.85}
                  style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.value}%
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};
```

The slice-and-dice layout is good for ≤ 8 items with one clear leader; for many small items of similar value, prefer a stacked bar — squarified treemaps need real layout code.

### 20. Diverging bar (Likert)

Bars going both directions from a central baseline. Standard pattern for survey results — "% agree" right of centre, "% disagree" left. The positive side is full accent; the negative side uses a `color-mix` of text + accent so it reads as "muted negative", not "second series". Round **only the outer corners** of each bar — the inner corners (touching the centre axis) must be square. Use the shared `halfRoundPath` helper with `'left'` / `'right'`.

```tsx
const DivergingBar = () => {
  const data = [
    { label: 'Easy to use',        positive: 72, negative: 8  },
    { label: 'Fast enough',        positive: 65, negative: 14 },
    { label: 'Pricing clear',      positive: 48, negative: 28 },
    { label: 'Support responsive', positive: 38, negative: 32 },
    { label: 'Docs helpful',       positive: 41, negative: 26 },
  ];
  const W = 720; const H = 440;
  const padL = 220; const padR = 64; const padT = 36; const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const center = padL + plotW / 2;
  const halfW = plotW / 2;
  const max = Math.max(...data.flatMap((d) => [d.positive, d.negative]));
  const rowH = plotH / data.length;
  const barH = rowH * 0.55;
  const scale = (v: number) => (v / max) * halfW * 0.9;
  return (
    <svg width={W} height={H} role="img" aria-label="Survey responses">
      <line x1={center} y1={padT} x2={center} y2={padT + plotH}
        stroke="var(--osd-text)" strokeOpacity={0.4} strokeWidth={1.5} />
      {data.map((d, i) => {
        const y = padT + rowH * i + (rowH - barH) / 2;
        const wPos = scale(d.positive);
        const wNeg = scale(d.negative);
        return (
          <g key={d.label}>
            <text x={padL - 16} y={y + barH / 2}
              textAnchor="end" dominantBaseline="central"
              fontSize={22} fill="var(--osd-text)" fillOpacity={0.85}>
              {d.label}
            </text>
            <path
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70}ms`, transformOrigin: 'right' }}
              d={halfRoundPath(center - wNeg, y, wNeg, barH, 5, 'left')}
              fill="color-mix(in oklch, var(--osd-text) 55%, var(--osd-accent))"
              fillOpacity={0.55}
            />
            <path
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70 + 120}ms` }}
              d={halfRoundPath(center, y, wPos, barH, 5, 'right')}
              fill="var(--osd-accent)"
            />
            <text className="osd-fade"
              style={{ animationDelay: `${i * 70 + 480}ms`, fontVariantNumeric: 'tabular-nums' }}
              x={center - wNeg - 8} y={y + barH / 2}
              textAnchor="end" dominantBaseline="central"
              fontSize={20} fill="var(--osd-text)" fillOpacity={0.7}>
              {d.negative}%
            </text>
            <text className="osd-fade"
              style={{ animationDelay: `${i * 70 + 480}ms`, fontVariantNumeric: 'tabular-nums' }}
              x={center + wPos + 8} y={y + barH / 2}
              dominantBaseline="central"
              fontSize={20} fontWeight={600} fill="var(--osd-text)">
              {d.positive}%
            </text>
          </g>
        );
      })}
      <text x={center - halfW * 0.5} y={padT + plotH + 32}
        textAnchor="middle" fontSize={20}
        fill="var(--osd-text)" fillOpacity={0.6}>← Disagree</text>
      <text x={center + halfW * 0.5} y={padT + plotH + 32}
        textAnchor="middle" fontSize={20}
        fill="var(--osd-text)" fillOpacity={0.6}>Agree →</text>
    </svg>
  );
};
```

The negative bar overrides `transform-origin: right` inline so it grows from the centre outward (left). Without that override the bar would grow from its left edge inward — the wrong direction for a diverging chart.

## Self-review

- [ ] Chart fills the available canvas — single charts at 1280px+ wide / 640px+ tall, multi-chart rows scale to fit the 1680px-wide content area. No big dead zone below the chart.
- [ ] Chart row sits inside a `flex: 1; align-items: center` wrapper so empty space distributes evenly, not all at the bottom.
- [ ] `<Style />` rendered once per page; every chart has at least one enter animation.
- [ ] Chart container has explicit pixel `width` and `height`.
- [ ] Primary series uses `var(--osd-accent)`; no hard-coded hex for it.
- [ ] Axes / labels / muted series read from `var(--osd-text)` with `opacity` or `color-mix`.
- [ ] Bar/line/scatter charts have `<HGrid />` gridlines.
- [ ] Bar charts highlight the peak value (full opacity) and mute the others (32%).
- [ ] Grouped bar uses one accent at full + 32% opacity (or one `color-mix` step), never two hues.
- [ ] Line charts mark the peak with a larger circle + value callout.
- [ ] Slope chart highlights the single biggest mover; all others at 32%.
- [ ] Funnel is a trapezoidal polygon, not a stack of rectangles.
- [ ] Waterfall has dashed connector lines between consecutive bar tops.
- [ ] Gantt has a dashed TODAY line, an active-phase bar at full accent, and milestones as diamond polygons.
- [ ] 2×2 quadrant tints the target quadrant, draws a faint outer frame around the full plot, and renders items inside the target at full opacity (others at 45%).
- [ ] Pie / donut uses a 4–5 step lightness ladder anchored to `var(--osd-accent)`, not 4 random hues.
- [ ] Heatmap encodes value as `fillOpacity` on one accent — never two hues — and flips text from `var(--osd-text)` to `var(--osd-bg)` once a cell darkens past ~0.55.
- [ ] Stacked area bands step down through opacity (full / 0.55 / 0.28), with the largest series at the bottom.
- [ ] Treemap uses a 4–5 step opacity ladder on one accent; cells smaller than ~80×48px omit text rather than overflow. When the leader's share exceeds ~40%, layout switches to a wide top band + a row of smaller items below so the leader reads as dominant rather than as a tall sliver.
- [ ] Diverging bar negative side uses `color-mix(in oklch, var(--osd-text) 55%, var(--osd-accent))` at 0.55 opacity and overrides `transform-origin: right` so it grows out from the centre.
- [ ] Every bar that meets the baseline gridline, a stacked neighbour, or a waterfall connector uses `halfRoundPath` instead of `<rect rx>` — vertical / grouped / waterfall-pos / waterfall-total use `'top'`, waterfall-neg uses `'bottom'`, stacked-bottom segment uses a plain `<rect>` (no rounding), stacked-top segment uses `'top'`, diverging-positive uses `'right'`, diverging-negative uses `'left'`.
- [ ] All label text ≥ 22px.
- [ ] Multiple charts on the page are explicit instances, not from `array.map`.
- [ ] No chart library imports — pure React + SVG.
- [ ] `fontVariantNumeric` lives inside `style={{}}`, never as an SVG attribute on `<text>`.
- [ ] `transform-box: fill-box` set on any SVG element using `transform: scaleY/scaleX` so the origin is correct.

## Anti-patterns

- ❌ A 600-wide chart on an otherwise empty 1920-wide page. Charts should fill the canvas — see the sizing recipe.
- ❌ Chart row stacked at the top of the page with 400px of dead space below. Wrap in `flex: 1; align-items: center`.
- ❌ Scatter data so closely fitted to the trend that the dots form a near-straight line. Real scatter visibly oscillates around the trend — alternate above / below as you walk left to right.
- ❌ `import { BarChart } from 'recharts'` — install nothing. SVG only.
- ❌ `<svg width="100%" height="100%">` or `<ResponsiveContainer>` — fixed pixels only.
- ❌ Pie with 8 slices — illegible. Use stacked bar.
- ❌ Funnel as a stack of `<rect>`s — that's a stair chart, not a funnel. Use trapezoidal `<polygon>`s.
- ❌ Waterfall without connectors — looks like a grouped bar chart.
- ❌ All bars the same accent shade — no visual hierarchy. Peak full, others 32%.
- ❌ Grouped bar with two unrelated hues (e.g. accent + green). Keep one accent + opacity.
- ❌ Slope chart with every line at full opacity — eye has nowhere to land. Pick one hero.
- ❌ Gantt with no TODAY line — reads as a generic horizontal bar chart, not a roadmap.
- ❌ 2×2 quadrant with no tinted target quadrant — looks like a scatter and the strategy is lost.
- ❌ Heatmap with red↔green or rainbow palettes — breaks Design panel theming and accessibility. One accent + opacity.
- ❌ Stacked area with the smallest series at the bottom — the audience reads the bottom band as primary; lead with the dominant series.
- ❌ Treemap with text overflowing tiny cells. If `w < 80 || h < 48`, drop the label rather than letting it spill.
- ❌ Diverging bar where the negative side keeps `transform-origin: left` — bars grow the wrong way and look broken on enter.
- ❌ Any bar using `<rect rx>` on an edge that touches the baseline, a stacked neighbour, or a waterfall connector. The rounded corner pulls the rect off the line and looks gappy. Use `halfRoundPath` and square the axis-facing edge.
- ❌ Line / area without gridlines — values are unreadable.
- ❌ Static chart, no enter animation. Slides aren't dashboards; charts should arrive.
- ❌ 3D, exploded slices, drop shadows, gloss, gradients-as-decoration — flat 2D.
- ❌ Axis text below 22px — unreadable on a projector.
- ❌ Hard-coded `#fbbf24` for the primary series — breaks Design panel re-theming.
- ❌ Sparkline as the headline chart on a page that has room for a real one.
- ❌ Cramming three different chart types into one slide. One idea per slide.
- ❌ Labels inline on pie slices (arc-anchored text). Render a sibling `<div>` legend instead.
- ❌ Rendering multiple full-size charts via `data.map((cfg) => <BarChart {...cfg} />)`. Each chart is its own JSX node.
- ❌ `fontVariantNumeric="tabular-nums"` as an attribute on `<text>` — React warning + invalid. Use `style={{ fontVariantNumeric: 'tabular-nums' }}`.
- ❌ Forgetting `transform-box: fill-box` on SVG bars that use `transform: scaleY` — the bar grows from the wrong origin (looks like it flies in from the top-left of the SVG).

## Cross-references

- `SKILL.md` (same directory) — file contract, canvas, type scale, palette, vertical budget. This doc assumes those rules and only adds the chart layer.
- `frontend-design` skill — aesthetic direction. Consult if the user wants a bold/editorial chart treatment beyond the defaults.
