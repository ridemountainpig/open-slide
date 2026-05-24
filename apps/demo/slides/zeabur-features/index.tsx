import { type Page, type SlideMeta, useSlidePageNumber } from '@open-slide/core';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const ScrambleText = ({
  words,
  holdMs = 1800,
  tickMs = 55,
}: {
  words: string[];
  holdMs?: number;
  tickMs?: number;
}) => {
  const [display, setDisplay] = useState(words[0]);
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        await wait(holdMs);
        if (cancelled) return;

        const from = words[indexRef.current];
        const next = (indexRef.current + 1) % words.length;
        const to = words[next];
        indexRef.current = next;

        const maxLen = Math.max(from.length, to.length);
        const queue = Array.from({ length: maxLen }, (_, i) => {
          const start = Math.floor(Math.random() * 8);
          const end = start + 6 + Math.floor(Math.random() * 8);
          return {
            from: from[i] ?? '',
            to: to[i] ?? '',
            start,
            end,
            char: '',
          };
        });

        let frame = 0;
        while (!cancelled) {
          let done = true;
          let output = '';
          for (const q of queue) {
            if (frame >= q.end) {
              output += q.to;
            } else if (frame >= q.start) {
              if (!q.char || Math.random() < 0.28) {
                q.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
              }
              output += q.char;
              done = false;
            } else {
              output += q.from;
              done = false;
            }
          }
          setDisplay(output);
          if (done) break;
          frame++;
          await wait(tickMs);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [words, holdMs, tickMs]);

  return <span style={{ whiteSpace: 'pre' }}>{display}</span>;
};

const styles = `
@keyframes zb-fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zb-pulse  { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
@keyframes zb-tplIn { from { opacity: 0; transform: translateY(20px) scale(0.96); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
@keyframes zb-tplMark { 0% { opacity: 0; transform: scale(0.5) rotate(-12deg); } 60% { transform: scale(1.08) rotate(0); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes zb-tplSweep { from { transform: translateX(-120%); } to { transform: translateX(220%); } }
`;

const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Menlo', monospace";

const C = {
  bg: '#0A0A0A',
  surface: '#0F0F12',
  surfaceHi: '#16161B',
  border: '#2D2D38',
  borderSeam: '#3A3A48',
  text: '#FFFFFF',
  muted: '#8B8B95',
  mutedDim: '#52525B',
  accent: '#7C3AED',
  accentBright: '#A78BFA',
  accentSoft: 'rgba(124, 58, 237, 0.15)',
  success: '#10B981',
} as const;

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 116,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: '-0.025em',
      margin: 0,
      color: C.text,
    }}
  >
    {children}
  </h1>
);

const PageHeading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SANS,
      fontSize: 60,
      fontWeight: 600,
      letterSpacing: '-0.018em',
      lineHeight: 1.06,
      margin: 0,
      color: C.text,
      maxWidth: 1320,
    }}
  >
    {children}
  </h2>
);

const Lead = ({ children, max = 1180 }: { children: ReactNode; max?: number }) => (
  <p
    style={{
      fontFamily: SANS,
      fontSize: 30,
      lineHeight: 1.5,
      color: C.muted,
      margin: 0,
      maxWidth: max,
    }}
  >
    {children}
  </p>
);

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
        fontFamily: MONO,
        fontSize: 16,
        letterSpacing: '0.04em',
        color: C.muted,
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

const Eyebrow = ({ children, chip = false }: { children: ReactNode; chip?: boolean }) =>
  chip ? (
    <div
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px',
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        background: C.surface,
        fontFamily: MONO,
        fontSize: 16,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: C.muted,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C.accentBright,
          boxShadow: `0 0 8px ${C.accentBright}`,
        }}
      />
      {children}
    </div>
  ) : (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 17,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: C.muted,
      }}
    >
      {children}
    </div>
  );

type StatusTone = 'push' | 'building' | 'deployed';

const Status = ({ tone, children }: { tone: StatusTone; children: ReactNode }) => {
  const live = tone === 'deployed' || tone === 'building';
  const fill = live ? C.accent : C.accentSoft;
  const ink = live ? C.text : C.accentBright;
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
        fontFamily: MONO,
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

const Stripes = ({ height = 14 }: { height?: number }) => (
  <div
    aria-hidden
    style={{
      height,
      width: '100%',
      backgroundImage: `repeating-linear-gradient(-45deg, ${C.accent} 0 6px, transparent 6px 14px)`,
      opacity: 0.55,
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
    }}
  />
);

const AskBar = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 18px',
      borderRadius: 6,
      background: C.surfaceHi,
      border: `1px solid ${C.border}`,
      fontFamily: MONO,
      fontSize: 20,
      color: C.muted,
    }}
  >
    <span style={{ color: C.accentBright }}>Ask Zeabur Agent</span>
    <span style={{ flex: 1 }}>to deploy…</span>
    <span aria-hidden style={{ color: C.mutedDim, fontSize: 22 }}>
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
        background: C.accent,
        color: C.text,
        fontSize: 18,
      }}
    >
      ↑
    </span>
  </div>
);

const SeamFrame = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 48,
      border: `1.5px dashed #4A4A55`,
      pointerEvents: 'none',
    }}
  />
);

const Glow = ({ x = '50%', y = '50%', size = 1300 }: { x?: string; y?: string; size?: number }) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(circle, ${C.accent} 0%, transparent 60%)`,
      opacity: 0.18,
      filter: 'blur(60px)',
      pointerEvents: 'none',
    }}
  />
);

const NewPill = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px 8px 6px',
      borderRadius: 4,
      background: C.surface,
      border: `1px solid ${C.border}`,
      fontFamily: SANS,
      fontSize: 20,
      color: C.muted,
      alignSelf: 'flex-start',
    }}
  >
    <span
      style={{
        padding: '5px 12px',
        borderRadius: 2,
        background: C.accent,
        color: C.text,
        fontFamily: MONO,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      New
    </span>
    <span style={{ color: C.text }}>{children}</span>
    <span aria-hidden style={{ color: C.accentBright }}>
      →
    </span>
  </div>
);

const PRRow = ({
  id,
  message,
  statuses,
  dim = false,
}: {
  id: string;
  message: string;
  statuses: StatusTone[];
  dim?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.bg,
      opacity: dim ? 0.45 : 1,
    }}
  >
    <span aria-hidden style={{ color: C.accentBright, fontSize: 16 }}>
      ⎇
    </span>
    <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: C.text }}>PR #{id}</span>
    <span
      style={{
        fontFamily: SANS,
        fontSize: 17,
        color: C.muted,
        marginRight: 'auto',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </span>
    <div style={{ display: 'flex', gap: 6 }}>
      {statuses.map((s) => (
        <Status key={s} tone={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </Status>
      ))}
    </div>
  </div>
);

const DeployFeed = () => (
  <div
    style={{
      padding: '22px 22px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          background: C.accentSoft,
          color: C.accentBright,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 14,
        }}
      >
        {'<>'}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.text }}>
        You Only Focus On Coding
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PRRow id="2190" message="feat: add export functionality" statuses={['push', 'building']} />
      <PRRow id="2189" message="chore: upgrade dependencies" statuses={['deployed']} />
      <PRRow id="2188" message="feat: add user authentication" statuses={['deployed']} />
      <PRRow id="2187" message="fix: resolve memory leak issue" statuses={['deployed']} dim />
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 16,
        lineHeight: 1.5,
        color: C.muted,
        margin: 0,
        marginTop: 'auto',
      }}
    >
      Zeabur Agent processes your code, detects the language, analyzes framework.
    </p>
  </div>
);

const pageBase: CSSProperties = {
  width: '100%',
  height: '100%',
  background: `${C.bg} radial-gradient(circle, rgba(167, 139, 250, 0.08) 1px, transparent 1.5px) 0 0 / 16px 16px`,
  color: C.text,
  padding: '96px 120px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};

const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'space-between', paddingBottom: 120 }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="82%" y="22%" />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <NewPill>Becoming a builder in the AI era</NewPill>
      <Title>
        Your AI DevOps Engineer
        <br />
        handling all your{' '}
        <ScrambleText words={['deployments', 'rollouts', 'monitoring', 'scaling', 'incidents']} />
      </Title>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 30,
          lineHeight: 1.5,
          color: C.muted,
          margin: 0,
          maxWidth: 1180,
        }}
      >
        You only focus on coding. Zeabur Agent processes your code, detects the language, and
        analyzes the framework — then ships the whole stack from a single prompt.
      </p>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        alignItems: 'stretch',
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <div
        style={{
          padding: '22px 22px',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.mutedDim,
          }}
        >
          Try it now
        </div>
        <AskBar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PromptHint q="Deploy this Next.js app to Tokyo." />
          <PromptHint q="Find me a cheap VPS, 2 cores / 4 GB." />
          <PromptHint q="Add a custom domain with SSL." />
        </div>
        <div
          style={{
            marginTop: 'auto',
            fontFamily: MONO,
            fontSize: 16,
            color: C.mutedDim,
          }}
        >
          Or skip the chat: <span style={{ color: C.accentBright }}>$ npx @zeabur/cli init</span>
        </div>
      </div>
      <DeployFeed />
    </div>
    <Footer />
  </div>
);

const PromptHint = ({ q }: { q: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      borderRadius: 4,
      border: `1px solid ${C.border}`,
      background: C.bg,
      fontFamily: MONO,
      fontSize: 17,
      color: C.muted,
    }}
  >
    <span aria-hidden style={{ color: C.accentBright }}>
      ❯
    </span>
    {q}
  </div>
);

type Tool = {
  name: string;
  body: string;
  icon: ReactNode;
  meta: string;
};

const ToolCard = ({ tool, delay }: { tool: Tool; delay: number }) => (
  <li
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: '26px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span
        aria-hidden
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          background: C.accentSoft,
          color: C.accentBright,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}
      >
        {tool.icon}
      </span>
      <h3
        style={{
          fontFamily: SANS,
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: 0,
          color: C.text,
        }}
      >
        {tool.name}
      </h3>
      <span
        style={{
          marginLeft: 'auto',
          padding: '5px 12px',
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          fontFamily: MONO,
          fontSize: 15,
          color: C.muted,
          letterSpacing: '0.04em',
        }}
      >
        {tool.meta}
      </span>
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 22,
        lineHeight: 1.55,
        color: C.muted,
        margin: 0,
      }}
    >
      {tool.body}
    </p>
  </li>
);

const Platform: Page = () => (
  <div style={{ ...pageBase, gap: 0, padding: '64px 120px 110px', justifyContent: 'flex-start' }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="14%" y="80%" size={1500} />
    <Stripes />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        marginTop: 48,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <Eyebrow>Platform</Eyebrow>
      <h2
        style={{
          fontFamily: SANS,
          fontSize: 68,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          lineHeight: 1.08,
          margin: 0,
          color: C.text,
          textAlign: 'center',
          maxWidth: 1400,
        }}
      >
        Build world-class projects with the right tools
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 28,
          lineHeight: 1.5,
          color: C.muted,
          margin: 0,
          textAlign: 'center',
          maxWidth: 1200,
        }}
      >
        Four products. One dashboard. Each piece replaces a separate vendor — wired together so a
        single prompt can ship the whole stack.
      </p>
    </div>
    <ul
      style={{
        margin: '48px 0 0',
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gridAutoRows: '1fr',
        gap: 18,
        flex: 1,
      }}
    >
      <ToolCard
        delay={0}
        tool={{
          name: 'Servers & Clusters',
          icon: '⌬',
          meta: '10 regions',
          body: 'Enterprise-grade dedicated compute across AWS, GCP, Hetzner, Linode, DigitalOcean and more — provisioned and monitored for you.',
        }}
      />
      <ToolCard
        delay={80}
        tool={{
          name: 'AI Hub',
          icon: '✦',
          meta: '40+ models',
          body: 'Call GPT, Claude, Gemini, DeepSeek, Llama and more through one OpenAI-compatible API. No per-vendor contracts.',
        }}
      />
      <ToolCard
        delay={160}
        tool={{
          name: 'Domain & DNS',
          icon: '◯',
          meta: 'auto-SSL',
          body: 'Search, register and resolve domains in one place. Instant activation, automatic DNS, zero manual setup.',
        }}
      />
      <ToolCard
        delay={240}
        tool={{
          name: 'Email Service',
          icon: '✉',
          meta: 'custom domain',
          body: 'Send transactional and marketing email from your own domain. High deliverability, simple API, built-in analytics.',
        }}
      />
    </ul>
    <Footer path="zeabur.com/products" />
  </div>
);

const FeatureItem = ({ icon, title, body }: { icon: ReactNode; title: string; body: string }) => (
  <div
    style={{
      padding: '18px 22px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <span
      aria-hidden
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        background: C.accentSoft,
        color: C.accentBright,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <h4
        style={{
          fontFamily: SANS,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: 0,
          color: C.text,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 18,
          lineHeight: 1.5,
          color: C.muted,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  </div>
);

const ProductHeader = ({
  eyebrow,
  heading,
  lead,
}: {
  eyebrow: string;
  heading: ReactNode;
  lead: ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
    }}
  >
    <Eyebrow chip>{eyebrow}</Eyebrow>
    <PageHeading>{heading}</PageHeading>
    <Lead>{lead}</Lead>
  </div>
);

const RegionDot = ({ name, active = false }: { name: string; active?: boolean }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 4,
      border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? C.accentSoft : C.bg,
      fontFamily: MONO,
      fontSize: 16,
      color: active ? C.accentBright : C.muted,
    }}
  >
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: active ? C.accentBright : C.mutedDim,
        boxShadow: active ? `0 0 8px ${C.accentBright}` : undefined,
      }}
    />
    {name}
  </span>
);

const ProviderChip = ({ name }: { name: string }) => (
  <span
    style={{
      padding: '8px 14px',
      borderRadius: 4,
      border: `1px solid ${C.border}`,
      background: C.surface,
      fontFamily: MONO,
      fontSize: 16,
      color: C.text,
    }}
  >
    {name}
  </span>
);

const ServerCard = ({
  icon,
  title,
  body,
  tagLabel,
  tags,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tagLabel: string;
  tags: string[];
}) => (
  <div
    style={{
      padding: '24px 26px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 6,
          background: C.accentSoft,
          color: C.accentBright,
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
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: 0,
          color: C.text,
        }}
      >
        {title}
      </h4>
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 20,
        lineHeight: 1.55,
        color: C.muted,
        margin: 0,
      }}
    >
      {body}
    </p>
    <div style={{ height: 1, background: C.border, marginTop: 'auto' }} />
    <div
      style={{
        fontFamily: MONO,
        fontSize: 13,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.mutedDim,
      }}
    >
      {tagLabel}
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tags.map((t) => (
        <span
          key={t}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${C.border}`,
            background: C.bg,
            fontFamily: MONO,
            fontSize: 14,
            color: C.muted,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  </div>
);

const Servers: Page = () => (
  <div style={{ ...pageBase, gap: 36 }}>
    <style>{styles}</style>
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 18,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <ServerCard
        icon="⌬"
        title="Dedicated Servers"
        body="Individual instances from the world's top cloud providers — pick a region, pick a spec."
        tagLabel="Providers"
        tags={['AWS', 'GCP', 'Hetzner', 'Linode', 'DigitalOcean']}
      />
      <ServerCard
        icon="◈"
        title="Managed Clusters"
        body="3-node high availability. Zeabur provisions, upgrades and monitors — you ship code."
        tagLabel="What you get"
        tags={['3-node HA', 'Auto upgrade', 'No infra ops']}
      />
      <ServerCard
        icon="✶"
        title="Wonder Mesh"
        body="Turn a Mac mini, laptop or Raspberry Pi into a Zeabur-managed server, no public IP needed."
        tagLabel="Bring your own"
        tags={['Mac mini', 'Laptop', 'Raspberry Pi']}
      />
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '22px 24px',
        borderRadius: 6,
        border: `1px solid ${C.border}`,
        background: C.surface,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '180ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Eyebrow>Global coverage · 10 regions</Eyebrow>
        <span style={{ marginLeft: 'auto' }}>
          <Status tone="deployed">Live</Status>
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <RegionDot name="Newark" />
        <RegionDot name="Dallas" />
        <RegionDot name="Los Angeles" active />
        <RegionDot name="Seattle" />
        <RegionDot name="Chicago" />
        <RegionDot name="Toronto" />
        <RegionDot name="Frankfurt" active />
        <RegionDot name="Tokyo" active />
        <RegionDot name="Singapore" />
        <RegionDot name="Sydney" />
      </div>
      <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Eyebrow>Providers</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 'auto' }}>
          <ProviderChip name="AWS" />
          <ProviderChip name="GCP" />
          <ProviderChip name="Hetzner" />
          <ProviderChip name="Linode" />
          <ProviderChip name="DigitalOcean" />
          <ProviderChip name="Tencent" />
          <ProviderChip name="Aliyun" />
        </div>
      </div>
    </div>
    <Footer path="zeabur.com/product/dedicated-server" />
  </div>
);

const DomainCard = ({
  tld,
  tagline,
  active = false,
}: {
  tld: string;
  tagline: string;
  active?: boolean;
}) => (
  <div
    style={{
      padding: '22px 24px',
      borderRadius: 6,
      border: `1px solid ${active ? C.accent : C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: active ? `0 0 32px rgba(124, 58, 237, 0.18) inset` : undefined,
    }}
  >
    <div
      style={{
        fontFamily: MONO,
        fontSize: 44,
        fontWeight: 600,
        color: active ? C.accentBright : C.text,
        letterSpacing: '-0.01em',
      }}
    >
      {tld}
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 19,
        lineHeight: 1.5,
        color: C.muted,
        margin: 0,
      }}
    >
      {tagline}
    </p>
  </div>
);

const DnsRow = ({ type, value, note }: { type: string; value: string; note?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily: MONO,
      fontSize: 17,
      color: C.muted,
    }}
  >
    <span style={{ color: C.mutedDim, width: 72 }}>{type}</span>
    <span style={{ color: C.text }}>{value}</span>
    {note ? <span style={{ marginLeft: 'auto', color: C.mutedDim }}>{note}</span> : null}
  </div>
);

const Domain: Page = () => (
  <div style={{ ...pageBase, gap: 32 }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="12%" y="78%" size={1100} />
    <ProductHeader
      eyebrow="Domain & DNS"
      heading={
        <>
          Find a domain
          <br />
          for your new identity.
        </>
      }
      lead="Search, register and resolve domains in one place. Instant activation upon purchase, automatic DNS configuration, zero manual setup."
    />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 14,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <DomainCard tld=".com" tagline="The world's most popular extension." active />
      <DomainCard tld=".io" tagline="The developer's go-to domain." />
      <DomainCard tld=".dev" tagline="Built for developers, by Google." />
      <DomainCard tld=".app" tagline="Secure namespace for applications." />
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: 18,
        flex: 1,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '180ms',
      }}
    >
      <div
        style={{
          padding: '22px 24px',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            aria-hidden
            style={{
              color: C.accentBright,
              fontFamily: MONO,
              fontSize: 18,
            }}
          >
            ◯
          </span>
          <span style={{ fontFamily: MONO, fontSize: 20, color: C.text }}>example.com</span>
          <span style={{ marginLeft: 'auto' }}>
            <Status tone="deployed">Active</Status>
          </span>
        </div>
        <div style={{ height: 1, background: C.border }} />
        <DnsRow type="A" value="76.76.21.21" note="auto-SSL" />
        <DnsRow type="CNAME" value="cname.zeabur.app" />
        <DnsRow type="MX" value="mx.zeabur.email" note="priority 10" />
        <div style={{ height: 1, background: C.border, marginTop: 'auto' }} />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: C.mutedDim,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          One-click records · Instant propagation
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 14,
        }}
      >
        <FeatureItem
          icon="✓"
          title="Instant activation"
          body="Domains go live the moment you check out — no waiting on a registrar."
        />
        <FeatureItem
          icon="↻"
          title="Auto DNS configuration"
          body="Zeabur wires records to your services. SSL renews itself."
        />
      </div>
    </div>
    <Footer path="zeabur.com/product/domain" />
  </div>
);

const EmailMockup = () => (
  <div
    style={{
      padding: '20px 22px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: C.accentSoft,
            color: C.accentBright,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
          }}
        >
          ✉
        </span>
        <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.text }}>
          New Campaign · Welcome series
        </span>
      </div>
      <span
        style={{
          padding: '5px 12px',
          borderRadius: 999,
          background: 'rgba(16, 185, 129, 0.18)',
          color: C.success,
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        ✓ Sent
      </span>
    </div>
    <div style={{ fontFamily: MONO, fontSize: 16, color: C.mutedDim }}>
      from <span style={{ color: C.text }}>hello@yourbrand.com</span> · to 1,284 recipients · 99.2 %
      delivered
    </div>
    <div
      style={{
        height: 8,
        borderRadius: 4,
        background: C.bg,
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ width: '99%', height: '100%', background: C.success }} />
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}
    >
      <EmailStat label="Opens" value="42 %" />
      <EmailStat label="Clicks" value="18 %" />
      <EmailStat label="Bounces" value="0.4 %" />
    </div>
  </div>
);

const EmailStat = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      padding: '12px 14px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 14,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.mutedDim,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: SANS,
        fontSize: 30,
        fontWeight: 600,
        color: C.text,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
  </div>
);

const TxnEventRow = ({
  status,
  to,
  type,
  time,
}: {
  status: 'delivered' | 'opened' | 'queued';
  to: string;
  type: string;
  time: string;
}) => {
  const dot =
    status === 'delivered' ? C.success : status === 'opened' ? C.accentBright : C.mutedDim;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px',
        borderRadius: 4,
        border: `1px solid ${C.border}`,
        background: C.bg,
        fontFamily: MONO,
        fontSize: 14,
        color: C.muted,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dot,
          boxShadow: status === 'queued' ? undefined : `0 0 8px ${dot}`,
        }}
      />
      <span style={{ color: C.text, width: 80, textTransform: 'capitalize' }}>{status}</span>
      <span style={{ flex: 1, color: C.muted }}>{to}</span>
      <span style={{ color: C.mutedDim }}>{type}</span>
      <span style={{ color: C.mutedDim, width: 56, textAlign: 'right' }}>{time}</span>
    </div>
  );
};

const TxnEventsMockup = () => (
  <div
    style={{
      padding: '20px 22px',
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: C.accentSoft,
          color: C.accentBright,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
        }}
      >
        {'<>'}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.text }}>
        Transactional events
      </span>
      <span style={{ marginLeft: 'auto' }}>
        <Status tone="building">Live</Status>
      </span>
    </div>
    <TxnEventRow status="delivered" to="alice@stripe.com" type="receipt" time="2s ago" />
    <TxnEventRow status="opened" to="bob@acme.io" type="welcome" time="14s ago" />
    <TxnEventRow status="queued" to="carol@linear.app" type="invite" time="just now" />
  </div>
);

const Email: Page = () => (
  <div style={{ ...pageBase, gap: 32 }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="86%" y="20%" size={1100} />
    <ProductHeader
      eyebrow="Email Service"
      heading={
        <>
          Reliable email,
          <br />
          from your own domain.
        </>
      }
      lead="Send and receive transactional and marketing emails using your own domain. Optimized infrastructure keeps you out of spam — and the API stays out of your way."
    />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        gap: 18,
        flex: 1,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridAutoRows: '1fr',
          gap: 14,
        }}
      >
        <FeatureItem
          icon="@"
          title="Custom domain email"
          body="Send from hello@yourbrand.com — never via a third party."
        />
        <FeatureItem
          icon="↗"
          title="High deliverability"
          body="Optimized infrastructure keeps messages out of spam folders."
        />
        <FeatureItem
          icon="◇"
          title="Easy integration"
          body="Simple APIs — sending and receiving is a one-call affair."
        />
        <FeatureItem
          icon="◐"
          title="Delivery monitoring"
          body="Track delivery, opens, and bounces with built-in analytics."
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridAutoRows: '1fr',
          gap: 14,
        }}
      >
        <EmailMockup />
        <TxnEventsMockup />
      </div>
    </div>
    <Footer path="zeabur.com/product/email" />
  </div>
);

const ModelChip = ({ name, vendor }: { name: string; vendor: string }) => (
  <div
    style={{
      padding: '14px 18px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 14,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.mutedDim,
      }}
    >
      {vendor}
    </span>
    <span style={{ fontFamily: SANS, fontSize: 21, fontWeight: 600, color: C.text }}>{name}</span>
  </div>
);

const CodeBlock = () => (
  <div
    style={{
      padding: '22px 24px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surfaceHi,
      fontFamily: MONO,
      fontSize: 22,
      lineHeight: 1.6,
      color: C.muted,
    }}
  >
    <div style={{ color: C.mutedDim }}>{'// OpenAI-compatible — call any model'}</div>
    <div>
      <span style={{ color: C.accentBright }}>import</span> OpenAI{' '}
      <span style={{ color: C.accentBright }}>from</span>{' '}
      <span style={{ color: C.success }}>'openai'</span>
      {';'}
    </div>
    <div style={{ marginTop: 10 }}>
      <span style={{ color: C.accentBright }}>const</span>{' '}
      <span style={{ color: C.text }}>client</span> ={' '}
      <span style={{ color: C.accentBright }}>new</span> OpenAI({'{'}
    </div>
    <div style={{ paddingLeft: 24 }}>
      baseURL: <span style={{ color: C.success }}>'https://aihub.zeabur.com/v1'</span>,
    </div>
    <div style={{ paddingLeft: 24 }}>
      apiKey: <span style={{ color: C.text }}>process.env.ZEABUR_KEY</span>,
    </div>
    <div>{'});'}</div>
    <div style={{ marginTop: 10 }}>
      <span style={{ color: C.text }}>client</span>.chat.completions.create({'{'}
    </div>
    <div style={{ paddingLeft: 24 }}>
      model: <span style={{ color: C.success }}>'claude-sonnet-4.6'</span>,
    </div>
    <div style={{ paddingLeft: 24 }}>messages,</div>
    <div>{'});'}</div>
  </div>
);

const AiHub: Page = () => (
  <div style={{ ...pageBase, gap: 32 }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="50%" y="92%" size={1300} />
    <ProductHeader
      eyebrow="AI Hub"
      heading={
        <>
          One API.
          <br />
          Every frontier model.
        </>
      }
      lead="Call GPT, Claude, Gemini, DeepSeek, Llama, Qwen and more through a single OpenAI-compatible endpoint. Pay as you go. No credit card to start."
    />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        flex: 1,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <CodeBlock />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Eyebrow>40+ models · 10 providers</Eyebrow>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: MONO,
              fontSize: 15,
              color: C.mutedDim,
            }}
          >
            constantly expanding
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoRows: '1fr',
            gap: 10,
            flex: 1,
          }}
        >
          <ModelChip vendor="OpenAI" name="GPT-5" />
          <ModelChip vendor="Anthropic" name="Claude Sonnet" />
          <ModelChip vendor="Google" name="Gemini 3" />
          <ModelChip vendor="DeepSeek" name="V4 Pro" />
          <ModelChip vendor="Meta" name="Llama 3.3 70B" />
          <ModelChip vendor="Alibaba" name="Qwen 3 Next 80B" />
          <ModelChip vendor="Moonshot" name="Kimi K2" />
          <ModelChip vendor="Zhipu" name="GLM 4.6" />
          <ModelChip vendor="MiniMax" name="M1" />
          <ModelChip vendor="StepFun" name="Step 2" />
        </div>
      </div>
    </div>
    <Footer path="zeabur.com/product/ai-hub" />
  </div>
);

const TemplateCard = ({
  name,
  mark,
  markBg,
  markColor = C.text,
  downloads,
  description,
  publisher,
  delay,
}: {
  name: string;
  mark: string;
  markBg: string;
  markColor?: string;
  downloads: string;
  description: string;
  publisher: string;
  delay: number;
}) => (
  <div
    style={{
      position: 'relative',
      padding: '18px 20px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      overflow: 'hidden',
      animation: `zb-tplIn 720ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
    }}
  >
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '40%',
        height: '100%',
        background:
          'linear-gradient(100deg, transparent 0%, rgba(167, 139, 250, 0.12) 50%, transparent 100%)',
        pointerEvents: 'none',
        animation: `zb-tplSweep 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + 200}ms both`,
      }}
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        aria-hidden
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          background: markBg,
          color: markColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          flexShrink: 0,
          animation: `zb-tplMark 520ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 140}ms both`,
        }}
      >
        {mark}
      </span>
      <span
        style={{
          fontFamily: SANS,
          fontSize: 20,
          fontWeight: 600,
          color: C.text,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 13,
          color: C.mutedDim,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span aria-hidden style={{ fontSize: 12 }}>
          ↓
        </span>
        {downloads}
      </span>
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 16,
        lineHeight: 1.45,
        color: C.muted,
        margin: 0,
        flex: 1,
      }}
    >
      {description}
    </p>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 13,
        color: C.mutedDim,
        letterSpacing: '0.02em',
      }}
    >
      {publisher}
    </span>
  </div>
);

const Templates: Page = () => (
  <div style={{ ...pageBase, gap: 32 }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="50%" y="92%" size={1300} />
    <ProductHeader
      eyebrow="Templates"
      heading={
        <>
          Deploy templates,
          <br />
          all ready-to-use.
        </>
      }
      lead="Pre-built templates, all deploy-and-play — AI chatbots, databases, automations, and more. Share your own template and earn from every install."
    />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridAutoRows: '1fr',
        gap: 12,
        flex: 1,
      }}
    >
      <TemplateCard
        delay={0}
        name="LobeChat"
        mark="L"
        markBg="rgba(244, 114, 182, 0.18)"
        markColor="#F472B6"
        downloads="5,190"
        description="Open-source, high-performance chatbot framework."
        publisher="arvinxx"
      />
      <TemplateCard
        delay={90}
        name="WordPress"
        mark="W"
        markBg="rgba(59, 130, 246, 0.16)"
        markColor="#60A5FA"
        downloads="6,720"
        description="CMS that lets you host and build websites with a few clicks."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={180}
        name="Supabase"
        mark="⚡"
        markBg="rgba(16, 185, 129, 0.18)"
        markColor="#34D399"
        downloads="2,658"
        description="Open-source Firebase alternative built on Postgres."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={270}
        name="Dify"
        mark="if"
        markBg="rgba(99, 102, 241, 0.2)"
        markColor="#A5B4FC"
        downloads="3,493"
        description="Open-source LLM app development platform."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={90}
        name="RSSHub"
        mark="R"
        markBg="rgba(249, 115, 22, 0.18)"
        markColor="#FB923C"
        downloads="3,490"
        description="Everything is RSSible — a feed aggregator for the open web."
        publisher="pseudoyu"
      />
      <TemplateCard
        delay={180}
        name="Uptime-Kuma"
        mark="U"
        markBg="rgba(34, 197, 94, 0.18)"
        markColor="#4ADE80"
        downloads="2,251"
        description="Easy-to-use self-hosted monitoring and status page tool."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={270}
        name="PostgreSQL"
        mark="Pg"
        markBg="rgba(56, 189, 248, 0.16)"
        markColor="#7DD3FC"
        downloads="18,985"
        description="Free, open-source relational database with rich SQL support."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={360}
        name="n8n"
        mark="n8n"
        markBg="rgba(236, 72, 153, 0.18)"
        markColor="#F472B6"
        downloads="32,170"
        description="Flexible workflows focused on deep data integration."
        publisher="kaochenlong"
      />
      <TemplateCard
        delay={180}
        name="MySQL"
        mark="My"
        markBg="rgba(14, 165, 233, 0.16)"
        markColor="#38BDF8"
        downloads="9,740"
        description="Open-source relational database for production workloads."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={270}
        name="SillyTavern"
        mark="獸"
        markBg="rgba(244, 63, 94, 0.18)"
        markColor="#FB7185"
        downloads="9,265"
        description="Powerful sandbox for AI storytelling and roleplaying."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={360}
        name="Redis"
        mark="R"
        markBg="rgba(239, 68, 68, 0.18)"
        markColor="#F87171"
        downloads="7,293"
        description="In-memory database that persists on disk for fast access."
        publisher="Zeabur Official"
      />
      <TemplateCard
        delay={450}
        name="Python Function"
        mark="Py"
        markBg="rgba(250, 204, 21, 0.16)"
        markColor="#FACC15"
        downloads="3,305"
        description="Serverless Python runtime for jobs, scripts, and webhooks."
        publisher="Zeabur Official"
      />
    </div>
    <Footer path="zeabur.com/templates" />
  </div>
);

type Skill = { name: string; body: string; icon: string; chips: string[]; active?: boolean };

const SkillCard = ({ skill, delay }: { skill: Skill; delay: number }) => (
  <li
    style={{
      position: 'relative',
      background: C.surface,
      border: `1px solid ${skill.active ? C.accent : C.border}`,
      borderRadius: 6,
      padding: '26px 28px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: skill.active ? `0 0 32px rgba(124, 58, 237, 0.18) inset` : undefined,
      animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      animationDelay: `${delay}ms`,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: skill.active ? C.accentBright : C.text,
      }}
    >
      <span aria-hidden style={{ fontSize: 28, color: skill.active ? C.accentBright : C.muted }}>
        {skill.icon}
      </span>
      <h3
        style={{
          fontFamily: SANS,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          margin: 0,
          color: 'inherit',
        }}
      >
        {skill.name}
      </h3>
    </div>
    <p
      style={{
        fontFamily: SANS,
        fontSize: 20,
        lineHeight: 1.55,
        color: C.muted,
        margin: 0,
        flex: 1,
      }}
    >
      {skill.body}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {skill.chips.map((chip) => (
        <span
          key={chip}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${C.border}`,
            background: C.bg,
            fontFamily: MONO,
            fontSize: 15,
            color: skill.active ? C.accentBright : C.muted,
            letterSpacing: '0.04em',
          }}
        >
          {chip}
        </span>
      ))}
    </div>
    {skill.active ? (
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 3,
          width: '55%',
          background: C.accent,
          boxShadow: `0 0 12px ${C.accent}`,
        }}
      />
    ) : null}
  </li>
);

const AgentTranscript = () => (
  <div
    style={{
      padding: '20px 22px',
      borderRadius: 6,
      border: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flex: 1,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingBottom: 10,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ display: 'inline-flex', gap: 5 }}>
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#E84A4A' }}
        />
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#F2B544' }}
        />
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: '50%', background: C.success }}
        />
      </span>
      <span
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.mutedDim,
        }}
      >
        Zeabur Agent
      </span>
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontFamily: MONO,
        fontSize: 17,
        color: C.muted,
        lineHeight: 1.55,
      }}
    >
      <span style={{ color: C.text }}>
        <span style={{ color: C.accentBright }}>❯</span> Host a small Discord bot for my friends.
        Cheap VPS, 2 cores / 4 GB.
      </span>
      <span>
        <span style={{ color: C.success }}>✓</span> Calling{' '}
        <span style={{ color: C.accentBright }}>zeabur-browse-servers</span>
      </span>
      <span>
        Compared Linode, Hetzner and AWS. Best fit:{' '}
        <span style={{ color: C.text }}>Hetzner CX22</span> — 2 vCPU, 4 GB, €4.5/mo. Rent it?
      </span>
      <span style={{ color: C.text }}>
        <span style={{ color: C.accentBright }}>❯</span> Yes, Frankfurt region.
      </span>
      <span>
        <span style={{ color: C.success }}>✓</span> Calling{' '}
        <span style={{ color: C.accentBright }}>zeabur-server-rent</span>
      </span>
      <span>
        Server provisioned. <span style={{ color: C.text }}>de-fra-1.zeabur.cloud</span> online —
        deploy your bot whenever you're ready.
      </span>
    </div>
  </div>
);

const Skills: Page = () => (
  <div style={{ ...pageBase, gap: 0, padding: '64px 120px 110px', justifyContent: 'flex-start' }}>
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="50%" y="92%" size={1400} />
    <Stripes />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginTop: 28,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <Eyebrow>Zeabur Skills</Eyebrow>
      <h2
        style={{
          fontFamily: SANS,
          fontSize: 64,
          fontWeight: 600,
          letterSpacing: '-0.018em',
          lineHeight: 1.08,
          margin: 0,
          color: C.text,
          textAlign: 'center',
          maxWidth: 1280,
        }}
      >
        Run DevOps with a single prompt.
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 26,
          lineHeight: 1.5,
          color: C.muted,
          margin: 0,
          textAlign: 'center',
          maxWidth: 1280,
        }}
      >
        Zeabur Agent turns natural language into infrastructure actions — deploy services, rent
        servers, manage configs, all from one chat.
      </p>
    </div>
    <ul
      style={{
        margin: '28px 0 0',
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 16,
      }}
    >
      <SkillCard
        delay={0}
        skill={{
          name: 'Rent Servers',
          icon: '⌬',
          chips: ['AWS', 'Hetzner', 'Linode'],
          body: 'Browse and rent discounted servers — tell the agent your spec, region, and budget.',
          active: true,
        }}
      />
      <SkillCard
        delay={80}
        skill={{
          name: 'Deploy Services',
          icon: '☁',
          chips: ['Next.js', 'Astro', 'Django'],
          body: 'Deploy your local project or any template. Zeabur detects the framework and ships it.',
        }}
      />
      <SkillCard
        delay={160}
        skill={{
          name: 'Enable AI Models',
          icon: '✦',
          chips: ['GPT-5', 'Claude', 'Gemini 3'],
          body: 'Access frontier models through Zeabur AI Hub — skip managing API keys.',
        }}
      />
    </ul>
    <div style={{ marginTop: 18, display: 'flex', flex: 1 }}>
      <AgentTranscript />
    </div>
    <Footer path="zeabur.com/skills" />
  </div>
);

const Closing: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      gap: 32,
    }}
  >
    <style>{styles}</style>
    <SeamFrame />
    <Glow x="50%" y="50%" size={1500} />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <Eyebrow chip>Becoming a builder in the AI era</Eyebrow>
      <h1
        style={{
          fontFamily: SANS,
          fontSize: 104,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          margin: 0,
          color: C.text,
          maxWidth: 1480,
        }}
      >
        Ship the whole stack
        <br />
        with one prompt.
      </h1>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 30,
          lineHeight: 1.5,
          color: C.muted,
          margin: 0,
          maxWidth: 1200,
        }}
      >
        Servers, domains, email, AI — all under one dashboard, all reachable from a single chat with
        Zeabur Agent. Predictable pricing. Cost under control.
      </p>
    </div>
    <div
      style={{
        width: 720,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '120ms',
      }}
    >
      <AskBar />
    </div>
    <div
      style={{
        display: 'flex',
        gap: 18,
        fontFamily: MONO,
        fontSize: 18,
        color: C.mutedDim,
        animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: '200ms',
      }}
    >
      <span>
        <span style={{ color: C.accentBright }}>zeabur.com</span>
      </span>
      <span>·</span>
      <span>$ npx @zeabur/cli init</span>
    </div>
    <Footer />
  </div>
);

export const meta: SlideMeta = {
  title: 'Zeabur — Your AI DevOps Engineer',
  theme: 'zeabur',
  createdAt: '2026-05-23T08:03:24.877Z',
};

export default [
  Cover,
  Platform,
  Servers,
  Domain,
  Email,
  AiHub,
  Templates,
  Skills,
  Closing,
] satisfies Page[];
