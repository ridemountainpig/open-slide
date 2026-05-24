import { type Page, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

const styles = `
@keyframes zb-fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zb-pulse  { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
`;

const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Menlo', monospace";

const C = {
  bg: '#0A0A0A',
  surface: '#0F0F12',
  surfaceHi: '#16161B',
  border: '#1C1C22',
  borderSeam: '#4A4A55',
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
      border: `1.5px dashed ${C.borderSeam}`,
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
        handling all your deployments
      </Title>
      <Lead>
        You only focus on coding. Zeabur Agent processes your code, detects the language, and
        analyzes the framework — then ships the whole stack from a single prompt.
      </Lead>
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
  delay,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tagLabel: string;
  tags: string[];
  delay: number;
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
      animation: 'zb-fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
      animationDelay: `${delay}ms`,
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
      }}
    >
      <ServerCard
        delay={0}
        icon="⌬"
        title="Dedicated Servers"
        body="Individual instances from the world's top cloud providers — pick a region, pick a spec."
        tagLabel="Providers"
        tags={['AWS', 'GCP', 'Hetzner', 'Linode']}
      />
      <ServerCard
        delay={80}
        icon="◈"
        title="Managed Clusters"
        body="3-node high availability. Zeabur provisions, upgrades and monitors — you ship code."
        tagLabel="What you get"
        tags={['3-node HA', 'Auto upgrade', 'No infra ops']}
      />
      <ServerCard
        delay={160}
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

type SkillSpec = { name: string; body: string; icon: string; chips: string[]; active?: boolean };

const SkillCard = ({ skill, delay }: { skill: SkillSpec; delay: number }) => (
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

export default [Cover, Servers, Platform, Skills];
