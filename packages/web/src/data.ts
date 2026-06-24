import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Brain,
  Cpu,
  Database,
  GitBranch,
  KeyRound,
  Link2,
  Plug,
  ShieldCheck,
  TerminalSquare,
  Workflow,
  UserCircle2
} from "lucide-react";

export type Decision = "ALLOW" | "WARN" | "BLOCK" | "REQUIRE_HUMAN";

export type MemoryKind =
  | "agent_profile"
  | "skill"
  | "strategy"
  | "policy"
  | "trade_plan"
  | "executed_trade"
  | "risk_report"
  | "blocked_action"
  | "failure_lesson"
  | "human_feedback"
  | "protocol_profile";

export type MemorySource = "SDK" | "MCP" | "API" | "Manual";

export type MemoryNode = {
  id: string;
  kind: MemoryKind;
  title: string;
  detail: string;
  agentId: string;
  agentName: string;
  source: MemorySource;
  from: string;
  age: string;
  size: number;
  x: number;
  y: number;
  confidence: number;
  tags: string[];
  linked: string[];
  status: "synced" | "local";
};

export type ConnectionMethod = {
  id: "sdk" | "api" | "mcp";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  command: string;
  bullets: string[];
};

export const kindLabels: Record<MemoryKind, string> = {
  agent_profile: "Agent profile",
  skill: "Skill",
  strategy: "Strategy",
  policy: "Policy",
  trade_plan: "Trade plan",
  executed_trade: "Executed trade",
  risk_report: "Risk report",
  blocked_action: "Blocked action",
  failure_lesson: "Failure lesson",
  human_feedback: "Human feedback",
  protocol_profile: "Protocol profile"
};

export const sourceMeta: Record<
  MemorySource,
  { label: string; color: string; soft: string; detail: string }
> = {
  SDK: {
    label: "SDK",
    color: "#2563eb",
    soft: "rgba(37, 99, 235, 0.08)",
    detail: "native agent runtime"
  },
  MCP: {
    label: "MCP",
    color: "#7c3aed",
    soft: "rgba(124, 58, 237, 0.08)",
    detail: "tool call from an LLM agent"
  },
  API: {
    label: "API",
    color: "#0891b2",
    soft: "rgba(8, 145, 178, 0.08)",
    detail: "HTTP service or worker"
  },
  Manual: {
    label: "Manual",
    color: "#ea580c",
    soft: "rgba(234, 88, 12, 0.08)",
    detail: "operator dashboard entry"
  }
};

export const agentOptions = [
  { id: "agent-arb-01", name: "Arb Sentinel" },
  { id: "agent-yield-02", name: "Yield Steward" },
  { id: "agent-risk-03", name: "Policy Keeper" }
];

export const stackItems = [
  {
    title: "0G Storage",
    detail: "Durable memory artifacts: strategies, trade outcomes, failures, policy files, and agent profiles.",
    icon: Database
  },
  {
    title: "0G Compute",
    detail: "Private reasoning path for explanations, failure reflection, and policy summaries.",
    icon: Cpu
  },
  {
    title: "0G Chain",
    detail: "Compact proof hashes for review decisions, report integrity, and memory provenance.",
    icon: KeyRound
  },
  {
    title: "Agent interfaces",
    detail: "SDK, MCP, and REST entry points so teams can connect the agents they already run.",
    icon: TerminalSquare
  }
];

export const connectionMethods: ConnectionMethod[] = [
  {
    id: "sdk",
    title: "TypeScript SDK",
    subtitle: "Best for agents already running in Node or a TypeScript execution service.",
    icon: Braces,
    command: "npm install @0g-mem/sdk",
    bullets: [
      "Add memories from the agent runtime",
      "Fetch profile and context before a trade plan",
      "Record outcomes and failure lessons after execution"
    ]
  },
  {
    id: "mcp",
    title: "Streamable HTTP MCP",
    subtitle: "Best for Codex, Claude, and LLM agents that connect through a hosted MCP URL.",
    icon: Plug,
    command: "https://your-0gmem-api.example.com/mcp",
    bullets: [
      "Paste one HTTPS URL into the MCP client",
      "Use the agent API key as the bearer token",
      "Expose memory, context, review, outcomes, and reflection tools"
    ]
  },
  {
    id: "api",
    title: "REST API",
    subtitle: "Best for Python agents, workers, notebooks, and hosted services.",
    icon: Link2,
    command: "npm run api:dev",
    bullets: [
      "POST /memory",
      "GET /profile and POST /context",
      "POST /review-plan and POST /learning/reflect"
    ]
  }
];

export const demoPlan = {
  agentId: "agent-risk-03",
  intent: "Approve USDC before depositing into a vault",
  txs: [
    {
      chainId: 16602,
      to: "0x1111111111111111111111111111111111111111",
      data: "0x095ea7b30000000000000000000000002222222222222222222222222222222222222222ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      value: "0",
      label: "Unlimited USDC approval to unknown spender"
    }
  ],
  metadata: { source: "web-dashboard-demo" }
};

export const productPillars = [
  {
    title: "Memory before action",
    body: "The agent retrieves its own history, policy, skills, prior trades, and failures before it proposes transactions.",
    icon: Database
  },
  {
    title: "Safety around execution",
    body: "Aegis reviews plans and returns ALLOW, WARN, BLOCK, or REQUIRE_HUMAN without becoming the trading agent.",
    icon: ShieldCheck
  },
  {
    title: "Learning after outcomes",
    body: "Failures and wins are stored as reusable lessons so future plans start from evidence, not amnesia.",
    icon: GitBranch
  }
];

/* ── New data for supermemory-style landing ────────────── */

export type ProductFeature = {
  id: string;
  num: string;
  title: string;
  headline: string;
  body: string;
  icon: LucideIcon;
};

export const productFeatures: ProductFeature[] = [
  {
    id: "memory",
    num: "01",
    title: "Memory",
    headline: "Persistent context across sessions",
    body: "Agent strategies, skills, policies, past trades, and failure lessons are stored in 0G Storage and retrieved before every decision. No amnesia between runs.",
    icon: Brain
  },
  {
    id: "aegis",
    num: "02",
    title: "Aegis Risk",
    headline: "Pre-execution safety review",
    body: "Every transaction plan passes through deterministic policy checks and private AI reasoning before it touches money. Returns ALLOW, WARN, BLOCK, or REQUIRE_HUMAN.",
    icon: ShieldCheck
  },
  {
    id: "learning",
    num: "03",
    title: "Learning",
    headline: "Structured failure reflection",
    body: "Failed trades produce reusable lessons with root cause analysis, suggested policy changes, and human-approval flags. Future reviews start from evidence.",
    icon: GitBranch
  },
  {
    id: "proofs",
    num: "04",
    title: "Proofs",
    headline: "Verifiable audit trail on 0G Chain",
    body: "Decision hashes, risk reports, and memory artifacts are anchored on-chain. Owners can verify that nothing was silently changed.",
    icon: KeyRound
  },
  {
    id: "profiles",
    num: "05",
    title: "Profiles",
    headline: "One-call agent identity",
    body: "Retrieve an agent's stable operating profile plus recent dynamic context in a single call. Skills, strategy, policy, and protocol trust — all in one response.",
    icon: UserCircle2
  },
  {
    id: "context",
    num: "06",
    title: "Context",
    headline: "Relevant memory retrieval",
    body: "Before a trade plan is reviewed, the context module retrieves matching policies, past failures, trusted protocols, and strategy rules automatically.",
    icon: Workflow
  }
];

export type ComparisonRow = {
  aspect: string;
  legacy: string;
  ogmem: string;
};

export const comparisonRows: ComparisonRow[] = [
  { aspect: "Memory", legacy: "Stateless between runs", ogmem: "Persistent across sessions" },
  { aspect: "Safety", legacy: "Hope for the best", ogmem: "Policy + AI review before execution" },
  { aspect: "Learning", legacy: "Repeat the same mistakes", ogmem: "Structured failure lessons" },
  { aspect: "Audit", legacy: "No trail", ogmem: "Proof hashes on 0G Chain" },
  { aspect: "Storage", legacy: "Centralized or none", ogmem: "Decentralized on 0G Storage" },
  { aspect: "Privacy", legacy: "Exposed reasoning", ogmem: "Private compute via 0G Router" }
];

export type HowItWorksStep = {
  num: string;
  title: string;
  body: string;
};

export const howItWorksSteps: HowItWorksStep[] = [
  { num: "1", title: "Plug in", body: "Install the SDK, start the MCP server, or point your agent at the REST API." },
  { num: "2", title: "Add memory", body: "Store strategies, policies, skills, and protocol trust profiles." },
  { num: "3", title: "Review plan", body: "Submit a transaction plan. Aegis checks policy, calldata, and past failures." },
  { num: "4", title: "Execute or stop", body: "Act on the ALLOW/WARN/BLOCK/REQUIRE_HUMAN decision." },
  { num: "5", title: "Record & learn", body: "Store outcomes. Generate failure lessons. Anchor proof hashes on chain." }
];
