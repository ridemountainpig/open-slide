import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#fafaf7', text: '#1a1814', accent: '#6d4cff' },
  fonts: {
    display: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  typeScale: { hero: 168, body: 32 },
  radius: 14,
};

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
  overflow: 'hidden',
} as const;

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

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 24,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--osd-text)',
      opacity: 0.5,
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

const PageHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 76,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
      margin: 0,
    }}
  >
    {children}
  </h2>
);

const ChartCaption = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 24,
      color: 'var(--osd-text)',
      opacity: 0.55,
      letterSpacing: '0.04em',
    }}
  >
    {children}
  </div>
);

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

const sliceColors = [
  'var(--osd-accent)',
  'color-mix(in oklch, var(--osd-accent) 55%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-accent) 28%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-text) 30%, var(--osd-bg))',
  'color-mix(in oklch, var(--osd-text) 55%, var(--osd-bg))',
];

const HGrid = ({
  padL,
  padT,
  plotW,
  plotH,
  ticks = 4,
}: {
  padL: number;
  padT: number;
  plotW: number;
  plotH: number;
  ticks?: number;
}) => (
  <g>
    {Array.from({ length: ticks + 1 }, (_, i) => {
      const t = i / ticks;
      const y = padT + plotH * (1 - t);
      const isBase = i === 0;
      return (
        <line
          key={i}
          x1={padL}
          y1={y}
          x2={padL + plotW}
          y2={y}
          stroke="var(--osd-text)"
          strokeOpacity={isBase ? 0.3 : 0.07}
        />
      );
    })}
  </g>
);

const halfRoundPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
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

const VerticalBars = () => {
  const data = [
    { label: 'Q1', value: 42 },
    { label: 'Q2', value: 58 },
    { label: 'Q3', value: 71 },
    { label: 'Q4', value: 64 },
  ];
  const W = 540;
  const H = 640;
  const padL = 60;
  const padR = 16;
  const padT = 36;
  const padB = 64;
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
              x={x + barW / 2}
              y={y - 14}
              textAnchor="middle"
              fontSize={26}
              fontWeight={isPeak ? 700 : 500}
              fill="var(--osd-text)"
              fillOpacity={isPeak ? 1 : 0.7}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={padT + plotH + 38}
              textAnchor="middle"
              fontSize={24}
              fill="var(--osd-text)"
              fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const HorizontalBars = () => {
  const data = [
    { label: 'Engineering', value: 86 },
    { label: 'Sales', value: 58 },
    { label: 'Product', value: 32 },
    { label: 'Design', value: 24 },
    { label: 'Marketing', value: 19 },
  ];
  const W = 540;
  const H = 640;
  const padL = 220;
  const padR = 56;
  const padT = 16;
  const padB = 16;
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
              x={padL - 16}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={24}
              fill="var(--osd-text)"
              fillOpacity={isPeak ? 1 : 0.75}
              fontWeight={isPeak ? 600 : 400}
            >
              {d.label}
            </text>
            <rect
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70}ms` }}
              x={padL}
              y={y}
              width={w}
              height={barH}
              fill="var(--osd-accent)"
              fillOpacity={isPeak ? 1 : 0.32}
              rx={6}
            />
            <text
              className="osd-fade"
              style={{ animationDelay: `${i * 70 + 400}ms` }}
              x={padL + w + 12}
              y={y + barH / 2}
              dominantBaseline="central"
              fontSize={26}
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

const DivergingBar = () => {
  const data = [
    { label: 'Easy to use', positive: 72, negative: 8 },
    { label: 'Fast enough', positive: 65, negative: 14 },
    { label: 'Pricing clear', positive: 48, negative: 28 },
    { label: 'Support responsive', positive: 38, negative: 32 },
    { label: 'Docs helpful', positive: 41, negative: 26 },
  ];
  const W = 800;
  const H = 640;
  const padL = 280;
  const padR = 80;
  const padT = 56;
  const padB = 80;
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
      <line
        x1={center}
        y1={padT}
        x2={center}
        y2={padT + plotH}
        stroke="var(--osd-text)"
        strokeOpacity={0.4}
        strokeWidth={1.5}
      />
      {data.map((d, i) => {
        const y = padT + rowH * i + (rowH - barH) / 2;
        const wPos = scale(d.positive);
        const wNeg = scale(d.negative);
        return (
          <g key={d.label}>
            <text
              x={padL - 20}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={24}
              fill="var(--osd-text)"
              fillOpacity={0.85}
            >
              {d.label}
            </text>
            <path
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70}ms`, transformOrigin: 'right' }}
              d={halfRoundPath(center - wNeg, y, wNeg, barH, 6, 'left')}
              fill="color-mix(in oklch, var(--osd-text) 55%, var(--osd-accent))"
              fillOpacity={0.55}
            />
            <path
              className="osd-bar-h"
              style={{ animationDelay: `${i * 70 + 120}ms` }}
              d={halfRoundPath(center, y, wPos, barH, 6, 'right')}
              fill="var(--osd-accent)"
            />
            <text
              className="osd-fade"
              style={{
                animationDelay: `${i * 70 + 500}ms`,
                fontVariantNumeric: 'tabular-nums',
              }}
              x={center - wNeg - 10}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={22}
              fill="var(--osd-text)"
              fillOpacity={0.7}
            >
              {d.negative}%
            </text>
            <text
              className="osd-fade"
              style={{
                animationDelay: `${i * 70 + 500}ms`,
                fontVariantNumeric: 'tabular-nums',
              }}
              x={center + wPos + 10}
              y={y + barH / 2}
              dominantBaseline="central"
              fontSize={22}
              fontWeight={600}
              fill="var(--osd-text)"
            >
              {d.positive}%
            </text>
          </g>
        );
      })}
      <text
        x={center - halfW * 0.5}
        y={padT + plotH + 40}
        textAnchor="middle"
        fontSize={22}
        fill="var(--osd-text)"
        fillOpacity={0.6}
      >
        ← Disagree
      </text>
      <text
        x={center + halfW * 0.5}
        y={padT + plotH + 40}
        textAnchor="middle"
        fontSize={22}
        fill="var(--osd-text)"
        fillOpacity={0.6}
      >
        Agree →
      </text>
    </svg>
  );
};

const StackedBars = () => {
  const data = [
    { label: 'Q1', a: 28, b: 14 },
    { label: 'Q2', a: 36, b: 22 },
    { label: 'Q3', a: 44, b: 27 },
    { label: 'Q4', a: 41, b: 30 },
  ];
  const W = 540;
  const H = 640;
  const padL = 60;
  const padR = 16;
  const padT = 60;
  const padB = 64;
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
          <g key={d.label} className="osd-bar-v" style={{ animationDelay: `${i * 80}ms` }}>
            <rect x={x} y={yA} width={barW} height={ha} fill="var(--osd-accent)" />
            <path
              d={halfRoundPath(x, yB, barW, hb, 4, 'top')}
              fill="var(--osd-accent)"
              fillOpacity={0.32}
            />
            <text
              x={x + barW / 2}
              y={padT + plotH + 38}
              textAnchor="middle"
              fontSize={24}
              fill="var(--osd-text)"
              fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <g
        transform={`translate(${padL}, 18)`}
        className="osd-fade"
        style={{ animationDelay: '400ms' }}
      >
        <rect width={16} height={16} fill="var(--osd-accent)" rx={2} />
        <text x={26} y={13} fontSize={20} fill="var(--osd-text)" fillOpacity={0.7}>
          Web
        </text>
        <rect x={104} width={16} height={16} fill="var(--osd-accent)" fillOpacity={0.32} rx={2} />
        <text x={130} y={13} fontSize={20} fill="var(--osd-text)" fillOpacity={0.7}>
          Mobile
        </text>
      </g>
    </svg>
  );
};

const GroupedBars = () => {
  const data = [
    { label: 'Q1', actual: 42, target: 50 },
    { label: 'Q2', actual: 58, target: 55 },
    { label: 'Q3', actual: 71, target: 65 },
    { label: 'Q4', actual: 64, target: 75 },
  ];
  const W = 800;
  const H = 640;
  const padL = 72;
  const padR = 24;
  const padT = 80;
  const padB = 72;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data.flatMap((d) => [d.actual, d.target]));
  const slot = plotW / data.length;
  const groupW = slot * 0.66;
  const barW = (groupW - 8) / 2;
  return (
    <svg width={W} height={H} role="img" aria-label="Actual vs target by quarter">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      {data.map((d, i) => {
        const groupX = padL + slot * i + (slot - groupW) / 2;
        const xA = groupX;
        const xB = groupX + barW + 8;
        const hA = (d.actual / max) * plotH * 0.88;
        const hB = (d.target / max) * plotH * 0.88;
        return (
          <g key={d.label} className="osd-bar-v" style={{ animationDelay: `${i * 80}ms` }}>
            <path
              d={halfRoundPath(xA, padT + plotH - hA, barW, hA, 6, 'top')}
              fill="var(--osd-accent)"
            />
            <path
              d={halfRoundPath(xB, padT + plotH - hB, barW, hB, 6, 'top')}
              fill="var(--osd-accent)"
              fillOpacity={0.32}
            />
            <text
              x={groupX + groupW / 2}
              y={padT + plotH + 40}
              textAnchor="middle"
              fontSize={26}
              fill="var(--osd-text)"
              fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <g
        transform={`translate(${padL}, 22)`}
        className="osd-fade"
        style={{ animationDelay: '400ms' }}
      >
        <rect width={16} height={16} fill="var(--osd-accent)" rx={3} />
        <text x={26} y={13} fontSize={22} fill="var(--osd-text)" fillOpacity={0.7}>
          Actual
        </text>
        <rect x={116} width={16} height={16} fill="var(--osd-accent)" fillOpacity={0.32} rx={3} />
        <text x={142} y={13} fontSize={22} fill="var(--osd-text)" fillOpacity={0.7}>
          Target
        </text>
      </g>
    </svg>
  );
};

const LineChart = () => {
  const data = [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 18 },
    { label: 'Mar', value: 24 },
    { label: 'Apr', value: 27 },
    { label: 'May', value: 39 },
    { label: 'Jun', value: 52 },
    { label: 'Jul', value: 60 },
  ];
  const W = 800;
  const H = 640;
  const padL = 72;
  const padR = 40;
  const padT = 48;
  const padB = 64;
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
        fill="none"
        stroke="var(--osd-accent)"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <g key={d.label} className="osd-fade" style={{ animationDelay: `${300 + i * 90}ms` }}>
          <circle cx={xs(i)} cy={ys(d.value)} r={i === peakIdx ? 11 : 6} fill="var(--osd-accent)" />
          {i === peakIdx && (
            <text
              x={xs(i)}
              y={ys(d.value) - 26}
              textAnchor="middle"
              fontSize={26}
              fontWeight={700}
              fill="var(--osd-text)"
            >
              {d.value}M
            </text>
          )}
          <text
            x={xs(i)}
            y={padT + plotH + 38}
            textAnchor="middle"
            fontSize={24}
            fill="var(--osd-text)"
            fillOpacity={0.65}
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

const AreaChart = () => {
  const data = [4, 9, 14, 22, 28, 36, 47, 58, 68, 80];
  const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'];
  const W = 800;
  const H = 640;
  const padL = 72;
  const padR = 40;
  const padT = 48;
  const padB = 64;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...data);
  const xs = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const ys = (v: number) => padT + plotH - (v / max) * plotH * 0.88;
  const linePts = data.map((v, i) => `${xs(i)},${ys(v)}`).join(' ');
  const areaPts = `${padL},${padT + plotH} ${linePts} ${padL + plotW},${padT + plotH}`;
  const lastIdx = data.length - 1;
  return (
    <svg width={W} height={H} role="img" aria-label="Cumulative signups">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} />
      <polygon
        className="osd-fade"
        style={{ animationDelay: '250ms' }}
        points={areaPts}
        fill="var(--osd-accent)"
        fillOpacity={0.18}
      />
      <polyline
        className="osd-draw"
        pathLength="1"
        points={linePts}
        fill="none"
        stroke="var(--osd-accent)"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <g className="osd-fade" style={{ animationDelay: '1000ms' }}>
        <circle cx={xs(lastIdx)} cy={ys(data[lastIdx])} r={11} fill="var(--osd-accent)" />
        <text
          x={xs(lastIdx) - 16}
          y={ys(data[lastIdx]) - 16}
          textAnchor="end"
          fontSize={26}
          fontWeight={700}
          fill="var(--osd-text)"
        >
          {data[lastIdx]}K
        </text>
      </g>
      {labels.map((label, i) =>
        i % 2 === 0 ? (
          <text
            key={label}
            x={xs(i)}
            y={padT + plotH + 38}
            textAnchor="middle"
            fontSize={24}
            fill="var(--osd-text)"
            fillOpacity={0.65}
          >
            {label}
          </text>
        ) : null,
      )}
    </svg>
  );
};

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
  const W = 800;
  const H = 640;
  const padL = 72;
  const padR = 32;
  const padT = 80;
  const padB = 72;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const stacks = data.map((d) => ({
    s1: d.mobile,
    s2: d.mobile + d.web,
    s3: d.mobile + d.web + d.other,
  }));
  const max = Math.max(...stacks.map((s) => s.s3));
  const xs = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const ys = (v: number) => padT + plotH - (v / max) * plotH * 0.92;
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
      <polygon
        className="osd-fade"
        style={{ animationDelay: '0ms' }}
        points={makeBand(zero, lvl1)}
        fill="var(--osd-accent)"
      />
      <polygon
        className="osd-fade"
        style={{ animationDelay: '180ms' }}
        points={makeBand(lvl1, lvl2)}
        fill="var(--osd-accent)"
        fillOpacity={0.55}
      />
      <polygon
        className="osd-fade"
        style={{ animationDelay: '360ms' }}
        points={makeBand(lvl2, lvl3)}
        fill="var(--osd-accent)"
        fillOpacity={0.28}
      />
      {data.map((d, i) => (
        <text
          key={d.label}
          x={xs(i)}
          y={padT + plotH + 38}
          textAnchor="middle"
          fontSize={24}
          fill="var(--osd-text)"
          fillOpacity={0.65}
        >
          {d.label}
        </text>
      ))}
      <g
        transform={`translate(${padL}, 26)`}
        className="osd-fade"
        style={{ animationDelay: '540ms' }}
      >
        <rect width={16} height={16} fill="var(--osd-accent)" rx={3} />
        <text x={26} y={13} fontSize={22} fill="var(--osd-text)" fillOpacity={0.7}>
          Mobile
        </text>
        <rect x={124} width={16} height={16} fill="var(--osd-accent)" fillOpacity={0.55} rx={3} />
        <text x={150} y={13} fontSize={22} fill="var(--osd-text)" fillOpacity={0.7}>
          Web
        </text>
        <rect x={224} width={16} height={16} fill="var(--osd-accent)" fillOpacity={0.28} rx={3} />
        <text x={250} y={13} fontSize={22} fill="var(--osd-text)" fillOpacity={0.7}>
          Other
        </text>
      </g>
    </svg>
  );
};

const SlopeChart = () => {
  const data = [
    { label: 'Discovery', before: 38, after: 72 },
    { label: 'Activation', before: 64, after: 65 },
    { label: 'Onboarding', before: 52, after: 78 },
    { label: 'Checkout', before: 58, after: 41 },
    { label: 'Retention', before: 46, after: 59 },
  ];
  const heroIdx = data.reduce(
    (acc, d, i) =>
      Math.abs(d.after - d.before) > Math.abs(data[acc].after - data[acc].before) ? i : acc,
    0,
  );
  const W = 800;
  const H = 640;
  const padL = 240;
  const padR = 120;
  const padT = 80;
  const padB = 48;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const all = data.flatMap((d) => [d.before, d.after]);
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const ys = (v: number) => padT + (1 - (v - min) / range) * plotH * 0.9 + plotH * 0.05;
  return (
    <svg width={W} height={H} role="img" aria-label="NPS before vs after">
      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + plotH}
        stroke="var(--osd-text)"
        strokeOpacity={0.15}
      />
      <line
        x1={padL + plotW}
        y1={padT}
        x2={padL + plotW}
        y2={padT + plotH}
        stroke="var(--osd-text)"
        strokeOpacity={0.15}
      />
      <text
        x={padL}
        y={padT - 28}
        textAnchor="middle"
        fontSize={24}
        fontWeight={600}
        fill="var(--osd-text)"
        fillOpacity={0.7}
      >
        Before
      </text>
      <text
        x={padL + plotW}
        y={padT - 28}
        textAnchor="middle"
        fontSize={24}
        fontWeight={600}
        fill="var(--osd-text)"
        fillOpacity={0.7}
      >
        After
      </text>
      {data.map((d, i) => {
        const isHero = i === heroIdx;
        const yB = ys(d.before);
        const yA = ys(d.after);
        const op = isHero ? 1 : 0.32;
        return (
          <g key={d.label} className="osd-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
            <line
              x1={padL}
              y1={yB}
              x2={padL + plotW}
              y2={yA}
              stroke="var(--osd-accent)"
              strokeOpacity={op}
              strokeWidth={isHero ? 5 : 3}
            />
            <circle
              cx={padL}
              cy={yB}
              r={isHero ? 10 : 6}
              fill="var(--osd-accent)"
              fillOpacity={op}
            />
            <circle
              cx={padL + plotW}
              cy={yA}
              r={isHero ? 10 : 6}
              fill="var(--osd-accent)"
              fillOpacity={op}
            />
            <text
              x={padL - 18}
              y={yB}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={24}
              fontWeight={isHero ? 600 : 400}
              fill="var(--osd-text)"
              fillOpacity={isHero ? 1 : 0.65}
            >
              {d.label}{' '}
              <tspan fontSize={22} fillOpacity={0.5}>
                {d.before}
              </tspan>
            </text>
            <text
              x={padL + plotW + 18}
              y={yA}
              dominantBaseline="central"
              fontSize={24}
              fontWeight={isHero ? 700 : 500}
              fill="var(--osd-text)"
              fillOpacity={isHero ? 1 : 0.65}
            >
              {d.after}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

type SliceDatum = { label: string; value: number };

const SliceLegend = ({ data, total }: { data: SliceDatum[]; total: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 260 }}>
    {data.map((d, i) => (
      <div
        key={d.label}
        className="osd-fade-up"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          animationDelay: `${300 + i * 90}ms`,
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: sliceColors[i % sliceColors.length],
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: 28, color: 'var(--osd-text)' }}>{d.label}</span>
        <span
          style={{
            fontSize: 28,
            color: 'var(--osd-text)',
            opacity: 0.55,
            marginLeft: 'auto',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round((d.value / total) * 100)}%
        </span>
      </div>
    ))}
  </div>
);

const PieChart = () => {
  const data: SliceDatum[] = [
    { label: 'Organic', value: 48 },
    { label: 'Referral', value: 22 },
    { label: 'Social', value: 18 },
    { label: 'Direct', value: 12 },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 440;
  const H = 440;
  const cx = W / 2;
  const cy = H / 2;
  const r = 200;
  let angle = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
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
      <SliceLegend data={data} total={total} />
    </div>
  );
};

const DonutChart = () => {
  const data: SliceDatum[] = [
    { label: 'Mobile', value: 56 },
    { label: 'Desktop', value: 28 },
    { label: 'Tablet', value: 11 },
    { label: 'Other', value: 5 },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 440;
  const H = 440;
  const cx = W / 2;
  const cy = H / 2;
  const r = 200;
  let angle = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <svg width={W} height={H} role="img" aria-label="Sessions by device">
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
        <circle cx={cx} cy={cy} r={116} fill="var(--osd-bg)" />
        <g className="osd-fade-up" style={{ animationDelay: '600ms' }}>
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize={52}
            fontWeight={800}
            fill="var(--osd-text)"
            fontFamily="var(--osd-font-display)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 32}
            textAnchor="middle"
            fontSize={22}
            fill="var(--osd-text)"
            fillOpacity={0.6}
            letterSpacing="0.14em"
          >
            TOTAL
          </text>
        </g>
      </svg>
      <SliceLegend data={data} total={total} />
    </div>
  );
};

type TreeDatum = { label: string; value: number };

const Treemap = () => {
  const items: TreeDatum[] = [
    { label: 'Mobile', value: 48 },
    { label: 'Web', value: 22 },
    { label: 'Native app', value: 14 },
    { label: 'Embed', value: 9 },
    { label: 'API', value: 7 },
  ];
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, d) => s + d.value, 0);
  const W = 800;
  const H = 640;
  const leaderShare = sorted[0].value / total;
  const restTotal = total - sorted[0].value;
  const stackTopBottom = leaderShare > 0.4;
  let rects: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    value: number;
    i: number;
  }>;
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
            <rect
              x={r.x + 4}
              y={r.y + 4}
              width={r.w - 8}
              height={r.h - 8}
              fill="var(--osd-accent)"
              fillOpacity={op}
              rx={8}
            />
            {r.w > 90 && r.h > 60 && (
              <>
                <text
                  x={r.x + 24}
                  y={r.y + 44}
                  fontSize={isLargest ? 36 : 24}
                  fontWeight={700}
                  fill={useBg ? 'var(--osd-bg)' : 'var(--osd-text)'}
                >
                  {r.label}
                </text>
                <text
                  x={r.x + 24}
                  y={r.y + (isLargest ? 88 : 78)}
                  fontSize={isLargest ? 28 : 20}
                  fontWeight={600}
                  fill={useBg ? 'var(--osd-bg)' : 'var(--osd-text)'}
                  fillOpacity={0.85}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
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

const FunnelChart = () => {
  const data = [
    { label: 'Visitors', value: 10000 },
    { label: 'Signed up', value: 4200 },
    { label: 'Activated', value: 1800 },
    { label: 'Paying', value: 620 },
  ];
  const W = 800;
  const H = 640;
  const padT = 24;
  const padB = 24;
  const stageH = (H - padT - padB) / data.length;
  const maxW = 660;
  const minW = 140;
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
        const labelInside = wTop > 260;
        const drop =
          i === 0
            ? null
            : `${(((data[i - 1].value - d.value) / data[i - 1].value) * 100).toFixed(0)}% drop`;
        return (
          <g key={d.label} className="osd-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
            <polygon points={pts} fill="var(--osd-accent)" fillOpacity={1 - i * 0.16} />
            {labelInside ? (
              <>
                <text
                  x={W / 2}
                  y={y + stageH / 2 - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={28}
                  fontWeight={700}
                  fill="var(--osd-bg)"
                >
                  {d.label}
                </text>
                <text
                  x={W / 2}
                  y={y + stageH / 2 + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={24}
                  fill="var(--osd-bg)"
                  fillOpacity={0.85}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {d.value.toLocaleString()}
                </text>
              </>
            ) : (
              <text
                x={(W + wTop) / 2 + 20}
                y={y + stageH / 2}
                dominantBaseline="central"
                fontSize={26}
                fontWeight={600}
                fill="var(--osd-text)"
              >
                {d.label}
                <tspan fill="var(--osd-text)" fillOpacity={0.5}>
                  {'  '}
                  {d.value.toLocaleString()}
                </tspan>
              </text>
            )}
            {drop && (
              <text
                x={W - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={20}
                fill="var(--osd-text)"
                fillOpacity={0.5}
              >
                {drop}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

type WaterfallDatum = {
  label: string;
  value: number;
  kind: 'pos' | 'neg' | 'total';
};

const WaterfallChart = () => {
  const data: WaterfallDatum[] = [
    { label: 'Open', value: 100, kind: 'total' },
    { label: 'New ARR', value: 32, kind: 'pos' },
    { label: 'Expansion', value: 12, kind: 'pos' },
    { label: 'Churn', value: -18, kind: 'neg' },
    { label: 'Close', value: 126, kind: 'total' },
  ];
  const W = 800;
  const H = 640;
  const padL = 60;
  const padR = 28;
  const padT = 56;
  const padB = 72;
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
            x1={x1}
            y1={prevTop}
            x2={x2}
            y2={prevTop}
            stroke="var(--osd-text)"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
          />
        );
      })}
      {data.map((d, i) => {
        const x = xCenter(i) - barW / 2;
        const yTop = yScale(positions[i].top);
        const yBot = yScale(positions[i].bottom);
        const h = Math.max(yBot - yTop, 2);
        const fillColor =
          d.kind === 'pos'
            ? 'var(--osd-accent)'
            : d.kind === 'neg'
              ? 'color-mix(in oklch, var(--osd-text) 78%, var(--osd-accent))'
              : 'var(--osd-text)';
        const roundSide = d.kind === 'neg' ? 'bottom' : 'top';
        return (
          <g key={d.label} className="osd-bar-v" style={{ animationDelay: `${i * 110}ms` }}>
            <path
              d={halfRoundPath(x, yTop, barW, h, 4, roundSide)}
              fill={fillColor}
              fillOpacity={d.kind === 'total' ? 0.88 : 1}
            />
            <text
              x={x + barW / 2}
              y={yTop - 12}
              textAnchor="middle"
              fontSize={24}
              fontWeight={d.kind === 'total' ? 700 : 500}
              fill="var(--osd-text)"
            >
              {d.kind === 'pos' ? `+${d.value}` : d.value}
            </text>
            <text
              x={x + barW / 2}
              y={padT + plotH + 38}
              textAnchor="middle"
              fontSize={24}
              fill="var(--osd-text)"
              fillOpacity={0.65}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const ScatterChart = () => {
  // Data scatters visibly around the trend (alternating above / below)
  // so it reads as a scatter plot, not a wobbly line.
  const data = [
    { x: 6, y: 28 },
    { x: 13, y: 11 },
    { x: 18, y: 36 },
    { x: 25, y: 18 },
    { x: 30, y: 14 },
    { x: 36, y: 42 },
    { x: 41, y: 26 },
    { x: 47, y: 50 },
    { x: 52, y: 33 },
    { x: 58, y: 58 },
    { x: 63, y: 40 },
    { x: 69, y: 65 },
    { x: 74, y: 49 },
    { x: 80, y: 72 },
    { x: 85, y: 56 },
    { x: 91, y: 78 },
  ];
  const W = 1080;
  const H = 640;
  const padL = 80;
  const padR = 48;
  const padT = 40;
  const padB = 72;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxX = 100;
  const maxY = 90;
  const xs = (v: number) => padL + (v / maxX) * plotW;
  const ys = (v: number) => padT + plotH - (v / maxY) * plotH;

  const meanX = data.reduce((s, d) => s + d.x, 0) / data.length;
  const meanY = data.reduce((s, d) => s + d.y, 0) / data.length;
  const slope =
    data.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0) /
    data.reduce((s, d) => s + (d.x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const trendY = (x: number) => slope * x + intercept;

  return (
    <svg width={W} height={H} role="img" aria-label="Engagement vs revenue">
      <HGrid padL={padL} padT={padT} plotW={plotW} plotH={plotH} ticks={4} />
      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + plotH}
        stroke="var(--osd-text)"
        strokeOpacity={0.3}
      />
      <line
        className="osd-draw"
        pathLength="1"
        x1={xs(2)}
        y1={ys(trendY(2))}
        x2={xs(98)}
        y2={ys(trendY(98))}
        stroke="var(--osd-accent)"
        strokeOpacity={0.6}
        strokeWidth={2.5}
        strokeDasharray="10 12"
        style={{ animationDelay: '800ms' }}
      />
      {data.map((d, i) => (
        <circle
          key={i}
          className="osd-pop"
          style={{ animationDelay: `${i * 40}ms` }}
          cx={xs(d.x)}
          cy={ys(d.y)}
          r={12}
          fill="var(--osd-accent)"
          fillOpacity={0.78}
        />
      ))}
      <text
        x={padL + plotW}
        y={padT + plotH + 48}
        textAnchor="end"
        fontSize={22}
        fill="var(--osd-text)"
        fillOpacity={0.6}
      >
        Engagement →
      </text>
      <text
        x={-padT - plotH / 2}
        y={28}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={22}
        fill="var(--osd-text)"
        fillOpacity={0.6}
      >
        Revenue →
      </text>
    </svg>
  );
};

type QuadItem = { label: string; x: number; y: number };

const QuadrantChart = () => {
  const items: QuadItem[] = [
    { label: 'Onboarding revamp', x: 0.18, y: 0.78 },
    { label: 'Search overhaul', x: 0.72, y: 0.85 },
    { label: 'Billing redesign', x: 0.74, y: 0.32 },
    { label: 'Dashboard tweaks', x: 0.32, y: 0.32 },
    { label: 'Auto-save', x: 0.24, y: 0.62 },
    { label: 'Notifications', x: 0.52, y: 0.5 },
  ];
  const W = 1680;
  const H = 700;
  const padL = 100;
  const padR = 32;
  const padT = 32;
  const padB = 60;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const cx = padL + plotW / 2;
  const cy = padT + plotH / 2;
  const xs = (v: number) => padL + v * plotW;
  const ys = (v: number) => padT + (1 - v) * plotH;
  const inSweet = (d: QuadItem) => d.x < 0.5 && d.y > 0.5;
  return (
    <svg width={W} height={H} role="img" aria-label="Effort vs value matrix">
      <rect
        x={padL}
        y={padT}
        width={plotW / 2}
        height={plotH / 2}
        fill="var(--osd-accent)"
        fillOpacity={0.08}
      />
      <rect
        x={padL}
        y={padT}
        width={plotW}
        height={plotH}
        fill="none"
        stroke="var(--osd-text)"
        strokeOpacity={0.18}
        rx={4}
      />
      <line
        x1={padL}
        y1={cy}
        x2={padL + plotW}
        y2={cy}
        stroke="var(--osd-text)"
        strokeOpacity={0.2}
      />
      <line
        x1={cx}
        y1={padT}
        x2={cx}
        y2={padT + plotH}
        stroke="var(--osd-text)"
        strokeOpacity={0.2}
      />
      <text
        x={padL + 20}
        y={padT + 32}
        fontSize={22}
        fontWeight={700}
        fill="var(--osd-accent)"
        letterSpacing="0.14em"
      >
        QUICK WINS
      </text>
      <text
        x={padL + plotW - 20}
        y={padT + 32}
        textAnchor="end"
        fontSize={22}
        fontWeight={600}
        fill="var(--osd-text)"
        fillOpacity={0.55}
        letterSpacing="0.14em"
      >
        BIG BETS
      </text>
      <text
        x={padL + 20}
        y={padT + plotH - 18}
        fontSize={22}
        fontWeight={600}
        fill="var(--osd-text)"
        fillOpacity={0.45}
        letterSpacing="0.14em"
      >
        FILL-INS
      </text>
      <text
        x={padL + plotW - 20}
        y={padT + plotH - 18}
        textAnchor="end"
        fontSize={22}
        fontWeight={600}
        fill="var(--osd-text)"
        fillOpacity={0.45}
        letterSpacing="0.14em"
      >
        TIME SINKS
      </text>
      <text
        x={cx}
        y={padT + plotH + 52}
        textAnchor="middle"
        fontSize={24}
        fill="var(--osd-text)"
        fillOpacity={0.7}
      >
        Effort →
      </text>
      <g transform={`translate(${padL - 44}, ${cy}) rotate(-90)`}>
        <text textAnchor="middle" fontSize={24} fill="var(--osd-text)" fillOpacity={0.7}>
          Value →
        </text>
      </g>
      {items.map((d, i) => {
        const hot = inSweet(d);
        return (
          <g key={d.label} className="osd-pop" style={{ animationDelay: `${i * 80}ms` }}>
            <circle
              cx={xs(d.x)}
              cy={ys(d.y)}
              r={hot ? 15 : 10}
              fill="var(--osd-accent)"
              fillOpacity={hot ? 1 : 0.45}
            />
            <text
              x={xs(d.x)}
              y={ys(d.y) - 26}
              textAnchor="middle"
              fontSize={24}
              fontWeight={hot ? 700 : 500}
              fill="var(--osd-text)"
              fillOpacity={hot ? 1 : 0.6}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

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
  const W = 800;
  const H = 640;
  const padL = 100;
  const padR = 24;
  const padT = 80;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const cellW = plotW / colLabels.length;
  const cellH = plotH / rowLabels.length;
  const max = 100;
  return (
    <svg width={W} height={H} role="img" aria-label="Cohort retention heatmap">
      {colLabels.map((l, c) => (
        <text
          key={l}
          x={padL + cellW * c + cellW / 2}
          y={padT - 22}
          textAnchor="middle"
          fontSize={24}
          fill="var(--osd-text)"
          fillOpacity={0.6}
        >
          {l}
        </text>
      ))}
      {data.map((row, r) =>
        row.map((v, c) => {
          const op = Math.max(v / max, 0.06);
          const useBg = op > 0.55;
          return (
            <g
              key={`${r}-${c}`}
              className="osd-fade"
              style={{ animationDelay: `${(r + c) * 35}ms` }}
            >
              <rect
                x={padL + cellW * c + 4}
                y={padT + cellH * r + 4}
                width={cellW - 8}
                height={cellH - 8}
                fill="var(--osd-accent)"
                fillOpacity={op}
                rx={6}
              />
              <text
                x={padL + cellW * c + cellW / 2}
                y={padT + cellH * r + cellH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={useBg ? 600 : 500}
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
        <text
          key={l}
          x={padL - 18}
          y={padT + cellH * r + cellH / 2}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={24}
          fill="var(--osd-text)"
          fillOpacity={0.75}
        >
          {l}
        </text>
      ))}
    </svg>
  );
};

type GanttDatum = {
  label: string;
  start: number;
  end: number;
  kind?: 'milestone';
  status?: 'active';
};

const GanttChart = () => {
  const data: GanttDatum[] = [
    { label: 'Discovery', start: 0, end: 3 },
    { label: 'Design', start: 3, end: 6 },
    { label: 'Engineering', start: 5, end: 11, status: 'active' },
    { label: 'QA', start: 9, end: 12 },
    { label: 'Beta', start: 10, end: 12 },
    { label: 'Launch', start: 12, end: 12, kind: 'milestone' },
  ];
  const totalWeeks = 12;
  const today = 6.5;
  const W = 1680;
  const H = 640;
  const padL = 280;
  const padR = 144;
  const padT = 96;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const rowH = plotH / data.length;
  const barH = rowH * 0.5;
  const xs = (w: number) => padL + (w / totalWeeks) * plotW;
  const ticks = Array.from({ length: totalWeeks / 2 + 1 }, (_, i) => i * 2);

  return (
    <svg width={W} height={H} role="img" aria-label="Q3 launch roadmap">
      {ticks.map((w) => (
        <line
          key={`grid-${w}`}
          x1={xs(w)}
          y1={padT - 8}
          x2={xs(w)}
          y2={padT + plotH}
          stroke="var(--osd-text)"
          strokeOpacity={w === 0 ? 0.3 : 0.07}
        />
      ))}
      {ticks.map((w) => (
        <text
          key={`lbl-${w}`}
          x={xs(w)}
          y={padT - 26}
          textAnchor="middle"
          fontSize={22}
          fill="var(--osd-text)"
          fillOpacity={0.6}
        >
          W{w}
        </text>
      ))}
      {data.map((d, i) => {
        const y = padT + rowH * i + (rowH - barH) / 2;
        const x = xs(d.start);
        const w = Math.max(xs(d.end) - xs(d.start), 4);
        const isActive = d.status === 'active';
        const isMilestone = d.kind === 'milestone';
        return (
          <g key={d.label}>
            <text
              x={padL - 24}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={26}
              fill="var(--osd-text)"
              fillOpacity={isActive || isMilestone ? 1 : 0.75}
              fontWeight={isActive || isMilestone ? 600 : 400}
            >
              {d.label}
            </text>
            {isMilestone ? (
              <>
                <polygon
                  className="osd-pop"
                  style={{ animationDelay: `${i * 80}ms` }}
                  points={`${x},${y + barH / 2 - 18} ${x + 18},${y + barH / 2} ${x},${y + barH / 2 + 18} ${x - 18},${y + barH / 2}`}
                  fill="var(--osd-accent)"
                />
                <text
                  className="osd-fade"
                  style={{ animationDelay: `${i * 80 + 400}ms` }}
                  x={x + 30}
                  y={y + barH / 2}
                  dominantBaseline="central"
                  fontSize={22}
                  fontWeight={700}
                  fill="var(--osd-text)"
                >
                  W{d.start}
                </text>
              </>
            ) : (
              <>
                <rect
                  className="osd-bar-h"
                  style={{ animationDelay: `${i * 80}ms` }}
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  fill="var(--osd-accent)"
                  fillOpacity={isActive ? 1 : 0.32}
                  rx={8}
                />
                <text
                  className="osd-fade"
                  style={{ animationDelay: `${i * 80 + 400}ms` }}
                  x={x + w + 14}
                  y={y + barH / 2}
                  dominantBaseline="central"
                  fontSize={22}
                  fontWeight={isActive ? 700 : 500}
                  fill="var(--osd-text)"
                  fillOpacity={isActive ? 1 : 0.7}
                >
                  W{d.start}–W{d.end}
                </text>
              </>
            )}
          </g>
        );
      })}
      <g className="osd-fade" style={{ animationDelay: '900ms' }}>
        <line
          x1={xs(today)}
          y1={padT - 12}
          x2={xs(today)}
          y2={padT + plotH + 4}
          stroke="var(--osd-accent)"
          strokeOpacity={0.75}
          strokeWidth={2.5}
          strokeDasharray="6 6"
        />
        <text
          x={xs(today)}
          y={padT - 56}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill="var(--osd-accent)"
          letterSpacing="0.14em"
        >
          TODAY
        </text>
      </g>
    </svg>
  );
};

const KpiCard = ({
  label,
  value,
  delta,
  index,
}: {
  label: string;
  value: string;
  delta: string;
  index: number;
}) => (
  <div
    className="osd-fade-up"
    style={{
      width: 480,
      height: 196,
      padding: '28px 32px',
      borderLeft: '6px solid var(--osd-accent)',
      background: 'color-mix(in oklch, var(--osd-text) 4%, transparent)',
      borderRadius: 'var(--osd-radius)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      animationDelay: `${index * 120}ms`,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        fontSize: 22,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--osd-text)',
        opacity: 0.55,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 92,
        fontWeight: 800,
        lineHeight: 1,
        color: 'var(--osd-text)',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 24, color: 'var(--osd-accent)', fontWeight: 600 }}>{delta}</div>
  </div>
);

const Sparkline = ({
  values,
  delay = 0,
  width = 320,
  height = 64,
}: {
  values: number[];
  delay?: number;
  width?: number;
  height?: number;
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
        className="osd-draw"
        pathLength="1"
        style={{ animationDelay: `${delay}ms` }}
        points={pts}
        fill="none"
        stroke="var(--osd-accent)"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

const SparkCard = ({
  label,
  value,
  values,
  index,
}: {
  label: string;
  value: string;
  values: number[];
  index: number;
}) => (
  <div
    className="osd-fade-up"
    style={{
      width: 540,
      height: 300,
      padding: '32px 36px',
      borderLeft: '6px solid var(--osd-accent)',
      background: 'color-mix(in oklch, var(--osd-text) 4%, transparent)',
      borderRadius: 'var(--osd-radius)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      animationDelay: `${index * 120}ms`,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        fontSize: 26,
        color: 'var(--osd-text)',
        opacity: 0.55,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 92,
        fontWeight: 800,
        lineHeight: 1,
        color: 'var(--osd-text)',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    <Sparkline values={values} delay={index * 120 + 300} width={468} height={88} />
  </div>
);

const Progress = ({ label, value, index }: { label: string; value: number; index: number }) => {
  const W = 1680;
  const H = 22;
  return (
    <div
      className="osd-fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: W,
        animationDelay: `${index * 110}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}>
        <span style={{ color: 'var(--osd-text)' }}>{label}</span>
        <span
          style={{
            color: 'var(--osd-text)',
            opacity: 0.6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}%
        </span>
      </div>
      <svg width={W} height={H} aria-label={`${label} ${value} percent`}>
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          rx={H / 2}
          fill="var(--osd-text)"
          fillOpacity={0.12}
        />
        <rect
          className="osd-grow-x"
          style={{ animationDelay: `${index * 110 + 200}ms` }}
          x={0}
          y={0}
          width={(value / 100) * W}
          height={H}
          rx={H / 2}
          fill="var(--osd-accent)"
        />
      </svg>
    </div>
  );
};

const PageShell = ({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) => (
  <div style={fill}>
    <Style />
    <div
      style={{
        padding: '88px 120px',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="osd-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <PageHeading>{heading}</PageHeading>
      </div>
      <div
        className="osd-fade-up"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          animationDelay: '180ms',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const Cover: Page = () => (
  <div style={fill}>
    <Style />
    <div
      style={{
        padding: '0 160px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <div className="osd-fade-up">
        <Eyebrow>Chart gallery · open-slide</Eyebrow>
      </div>
      <h1
        className="osd-fade-up"
        style={{
          animationDelay: '120ms',
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.02,
          margin: 0,
          maxWidth: 1500,
        }}
      >
        Twenty charts,
        <br />
        <span style={{ color: 'var(--osd-accent)' }}>zero dependencies.</span>
      </h1>
      <p
        className="osd-fade-up"
        style={{
          animationDelay: '240ms',
          fontSize: 'var(--osd-size-body)',
          color: 'var(--osd-text)',
          opacity: 0.7,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 1200,
        }}
      >
        Every chart on the following pages is hand-authored inline SVG, themed via{' '}
        <code
          style={{
            background: 'color-mix(in oklch, var(--osd-text) 8%, transparent)',
            padding: '2px 12px',
            borderRadius: 8,
            fontSize: 28,
          }}
        >
          var(--osd-X)
        </code>{' '}
        — drag the accent slider in the Design panel and watch them all re-theme live.
      </p>
    </div>
  </div>
);

const BarsPage: Page = () => (
  <PageShell eyebrow="01 · Bars" heading="Compare values across categories.">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 48,
        alignItems: 'start',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Vertical · quarterly revenue ($M)</ChartCaption>
        <VerticalBars />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Horizontal · headcount by team</ChartCaption>
        <HorizontalBars />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Stacked · web vs mobile</ChartCaption>
        <StackedBars />
      </div>
    </div>
  </PageShell>
);

const TrendsPage: Page = () => (
  <PageShell eyebrow="02 · Trends" heading="One metric over time.">
    <div style={{ display: 'flex', gap: 80, alignItems: 'start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Line · monthly active users (M)</ChartCaption>
        <LineChart />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Area · cumulative signups (K)</ChartCaption>
        <AreaChart />
      </div>
    </div>
  </PageShell>
);

const PartsPage: Page = () => (
  <PageShell eyebrow="03 · Parts of a whole" heading="Shares that sum to one.">
    <div style={{ display: 'flex', gap: 120, alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <ChartCaption>Pie · traffic by source</ChartCaption>
        <PieChart />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <ChartCaption>Donut · sessions by device</ChartCaption>
        <DonutChart />
      </div>
    </div>
  </PageShell>
);

const FlowsPage: Page = () => (
  <PageShell eyebrow="04 · Stages & flows" heading="From step to step.">
    <div style={{ display: 'flex', gap: 80, alignItems: 'start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Funnel · acquisition to revenue</ChartCaption>
        <FunnelChart />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Waterfall · ARR open to close ($M)</ChartCaption>
        <WaterfallChart />
      </div>
    </div>
  </PageShell>
);

const CorrelationPage: Page = () => (
  <PageShell eyebrow="05 · Correlation & headline numbers" heading="Two variables. Three numbers.">
    <div style={{ display: 'flex', gap: 56, alignItems: 'stretch', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Scatter · engagement vs revenue per account</ChartCaption>
        <ScatterChart />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 18,
          paddingTop: 40,
        }}
      >
        <KpiCard label="ARR" value="$4.2M" delta="▲ 38% YoY" index={0} />
        <KpiCard label="Active users" value="62K" delta="▲ 21% MoM" index={1} />
        <KpiCard label="NPS" value="64" delta="▲ 12 pts" index={2} />
      </div>
    </div>
  </PageShell>
);

const MiniPage: Page = () => (
  <PageShell eyebrow="06 · Inline accents" heading="Sparklines and progress.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80, width: '100%' }}>
      <div style={{ display: 'flex', gap: 30 }}>
        <SparkCard
          label="Sign-ups · 7d"
          value="2.4K"
          values={[12, 18, 22, 19, 28, 36, 41]}
          index={0}
        />
        <SparkCard
          label="Revenue · 7d"
          value="$84K"
          values={[42, 38, 51, 49, 62, 58, 71]}
          index={1}
        />
        <SparkCard
          label="Churn · 7d"
          value="0.8%"
          values={[1.4, 1.2, 1.1, 0.9, 1.0, 0.8, 0.7]}
          index={2}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        <Progress label="Quarterly goal" value={72} index={0} />
        <Progress label="Onboarding completion" value={48} index={1} />
        <Progress label="Feature adoption" value={91} index={2} />
      </div>
    </div>
  </PageShell>
);

const RoadmapPage: Page = () => (
  <PageShell eyebrow="07 · Roadmap" heading="From kickoff to launch.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
      <ChartCaption>Gantt · Q3 launch plan (weeks)</ChartCaption>
      <GanttChart />
    </div>
  </PageShell>
);

const ComparisonsPage: Page = () => (
  <PageShell eyebrow="08 · Comparisons" heading="Two values per category.">
    <div style={{ display: 'flex', gap: 80, alignItems: 'start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Grouped · actual vs target</ChartCaption>
        <GroupedBars />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Slope · NPS before vs after</ChartCaption>
        <SlopeChart />
      </div>
    </div>
  </PageShell>
);

const PositioningPage: Page = () => (
  <PageShell eyebrow="09 · Positioning" heading="Where it lands on two axes.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
      <ChartCaption>2×2 quadrant · effort vs value</ChartCaption>
      <QuadrantChart />
    </div>
  </PageShell>
);

const CompositionPage: Page = () => (
  <PageShell eyebrow="10 · Composition" heading="How the total breaks down.">
    <div style={{ display: 'flex', gap: 80, alignItems: 'start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Stacked area · revenue by platform</ChartCaption>
        <StackedArea />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Treemap · channel share</ChartCaption>
        <Treemap />
      </div>
    </div>
  </PageShell>
);

const DensityPage: Page = () => (
  <PageShell eyebrow="11 · Density & direction" heading="Patterns across rows and sides.">
    <div style={{ display: 'flex', gap: 80, alignItems: 'start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Heatmap · cohort retention</ChartCaption>
        <Heatmap />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ChartCaption>Diverging bar · survey responses</ChartCaption>
        <DivergingBar />
      </div>
    </div>
  </PageShell>
);

const codeChip = {
  background: 'color-mix(in oklch, var(--osd-text) 8%, transparent)',
  padding: '2px 12px',
  borderRadius: 8,
  fontSize: 28,
} as const;

const Outro: Page = () => (
  <div style={fill}>
    <Style />
    <div
      style={{
        padding: '0 160px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <div className="osd-fade-up">
        <Eyebrow>Build your own · open-slide</Eyebrow>
      </div>
      <h1
        className="osd-fade-up"
        style={{
          animationDelay: '120ms',
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.02,
          margin: 0,
          maxWidth: 1500,
        }}
      >
        Don't draw them.
        <br />
        <span style={{ color: 'var(--osd-accent)' }}>Ask your agent.</span>
      </h1>
      <p
        className="osd-fade-up"
        style={{
          animationDelay: '240ms',
          fontSize: 'var(--osd-size-body)',
          color: 'var(--osd-text)',
          opacity: 0.75,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 1300,
        }}
      >
        Every pattern in this deck lives in the <code style={codeChip}>slide-authoring</code> skill
        that ships with open-slide. Open any slide, say{' '}
        <code style={codeChip}>"add a waterfall chart for ARR"</code>, and the agent pastes a
        themed, animated, dependency-free component straight into{' '}
        <code style={codeChip}>index.tsx</code>.
      </p>
    </div>
  </div>
);

export const meta: SlideMeta = {
  title: 'Chart Gallery',
  createdAt: '2026-05-22T14:29:04.890Z',
};

export default [
  Cover,
  BarsPage,
  TrendsPage,
  PartsPage,
  FlowsPage,
  CorrelationPage,
  MiniPage,
  RoadmapPage,
  ComparisonsPage,
  PositioningPage,
  CompositionPage,
  DensityPage,
  Outro,
] satisfies Page[];
