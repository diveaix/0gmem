import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Check,
  Code2,
  Database,
  GitBranch,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Plus,
  RadioTower,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
  ChevronDown
} from "lucide-react";
import {
  agentOptions,
  connectionMethods,
  demoPlan,
  kindLabels,
  productFeatures,
  productPillars,
  comparisonRows,
  howItWorksSteps,
  sourceMeta,
  stackItems,
  type ConnectionMethod,
  type Decision,
  type MemoryKind,
  type MemoryNode,
  type MemorySource,
  type ProductFeature
} from "./data";

type View = "landing" | "dashboard" | "connect" | "api-keys";
type ReviewState = "idle" | "loading" | "success" | "error";
type SaveState = "idle" | "saving" | "success" | "local" | "error";
type MethodId = ConnectionMethod["id"];

type ReviewPayload = {
  verdict: {
    decision: Decision;
    riskScore: number;
    reason: string;
    decodedTransactions?: unknown[];
    matchedMemories?: string[];
  };
  proof?: {
    provider?: string;
    proofHash?: string;
    txHash?: string;
    decisionId?: string;
  };
  source?: "api";
  error?: string;
};

type ManualMemoryForm = {
  agentId: string;
  agentName: string;
  kind: MemoryKind;
  title: string;
  detail: string;
  tags: string;
};

type ApiMemoryRecord = {
  id: string;
  agentId: string;
  kind: MemoryKind;
  title: string;
  content?: Record<string, unknown>;
  tags?: string[];
  createdAt?: string;
};

type AuthUser = {
  id: string;
  email: string;
  emailVerifiedAt?: string;
};

type ApiKeySummary = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
};

type AuthStatus = "loading" | "anonymous" | "authenticated";
type LoginState = "idle" | "sending" | "sent" | "error";
type KeyState = "idle" | "creating" | "created" | "error";

const apiBaseUrl =
  import.meta.env.VITE_0GMEM_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8787";

const emptyManualForm: ManualMemoryForm = {
  agentId: agentOptions[0].id,
  agentName: agentOptions[0].name,
  kind: "strategy",
  title: "",
  detail: "",
  tags: ""
};

/* ── Logo ─────────────────────────────────────────────── */

function Logo() {
  return (
    <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="brand-icon">
      <path d="m96.5 83.7h48.5c0.8-0.1 1.4-0.8 1.5-1.6 0.1-2.3-1.2-3.6-50 1.6z" fill="currentColor"/>
      <path d="m146.5 67.8c-0.1-0.8-0.8-1.6-1.7-1.6h-48.3l34.5-34.2c0.3-0.4 0.5-1.6 0-2.2-2.9-3.6-6.4-7.1-10.5-10.6-0.5-0.4-1.3-0.5-2-0.2-0.3 0.1-0.6 0.5-0.8 0.7l-34.3 33.5v-47.7c0-1.1-0.8-1.8-1.6-1.8-4.5-0.3-8.8-0.4-13.8 0-0.8 0.1-1.7 0.8-1.7 1.8v47.6l-34.1-33.6c-0.5-0.6-1.3-0.8-2.2-0.5-3.7 2.9-7.3 6.4-11 10.7-0.4 0.6-0.3 1.8 0.1 2.2l23.9 23.5c2.4 2.4 5.8 4.2 10.8 4.7h22.3c7.5-0.2 13.7 6.5 13.9 14.4v21.1c0.2 4 1.8 8.2 5 11.5l22.8 23.1c0.5 0.7 1.4 1 2.5 0.5 3.6-3 7.1-6.2 10.7-10.5 0.5-0.6 0.6-1.9-0.1-2.3l-34.4-34.2h48.5c0.9 0 1.5-1 1.5-1.7 0.4-4.7 0.4-9.4 0-14.2z" fill="currentColor"/>
      <path d="m75.1 66.2h-69.8c-1 0-1.7 0.7-1.8 1.6-0.4 4.7-0.4 9.5 0.1 14.3 0.1 0.8 0.8 1.6 1.7 1.6h48.4l-34.6 34.3c-0.5 0.4-0.5 1.6-0.1 2.2 2.8 3.5 6.2 6.9 10.5 10.4 0.5 0.4 1.4 0.5 2 0.2l34.8-34.7-0.1 48.1c0 0.8 0.8 1.6 1.6 1.7 4.4 0.4 9.4 0.5 14.4 0 0.8 0 1.6-0.8 1.6-1.7l-0.1-69.5c-0.3-4.6-3.8-8.5-8.6-8.5z" fill="currentColor"/>
    </svg>
  );
}

/* ── Code Scramble Background ────────────────────────── */

const CODE_CHARS = "{}();=>const let var await async import export function return if else for while new this .map.filter.reduce.find0123456789abcdefABCDEF01sdk.memory.add({agentId:kind:content:})risk.reviewPlan({intent:txs})verdict.decision//→ALLOW|BLOCK";
const CODE_SNIPPETS = [
  "const", "let", "var", "await", "async", "import", "from", "export",
  "function", "return", "if", "else", "=>", "new", ".add", ".get",
  "sdk", "memory", "risk", "plan", "agent", "0G", "tx", "hash",
  "proof", "chain", "block", "allow", "warn", "0x", "uint", "key",
  "{", "}", "(", ")", ";", ":", "=", "/", ".", ",", "[", "]",
  "++", "--", "&&", "||", "!=", "===", ">>", "<<", "0xff", "null",
  "true", "false", "void", "type", "enum", "class", "extends",
];

type CellState = {
  char: string;
  targetChar: string;
  alpha: number;
  targetAlpha: number;
  scrambleTimer: number;
  lastScramble: number;
};

function CodeScrambleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const cellsRef = useRef<CellState[][]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0, cellW: 0, cellH: 0 });
  const rafRef = useRef(0);
  const frameRef = useRef(0);

  const CELL_W = 18;
  const CELL_H = 22;
  const INFLUENCE_RADIUS = 220;
  const SCRAMBLE_SPEED = 60; // ms between character changes near cursor

  const randomChar = useCallback(() => {
    if (Math.random() < 0.35) {
      return CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    }
    return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }, []);

  const initCells = useCallback((cols: number, rows: number) => {
    const grid: CellState[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < cols; c++) {
        const ch = randomChar();
        row.push({
          char: ch,
          targetChar: ch,
          alpha: 0.04 + Math.random() * 0.03,
          targetAlpha: 0.04 + Math.random() * 0.03,
          scrambleTimer: 0,
          lastScramble: 0,
        });
      }
      grid.push(row);
    }
    return grid;
  }, [randomChar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas!.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / CELL_W) + 1;
      const rows = Math.ceil(h / CELL_H) + 1;
      dimsRef.current = { cols, rows, cellW: CELL_W, cellH: CELL_H };

      // Preserve existing cells where possible, fill gaps
      const oldCells = cellsRef.current;
      const newCells: CellState[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: CellState[] = [];
        for (let c = 0; c < cols; c++) {
          if (oldCells[r] && oldCells[r][c]) {
            row.push(oldCells[r][c]);
          } else {
            const ch = randomChar();
            row.push({
              char: ch, targetChar: ch,
              alpha: 0.04 + Math.random() * 0.03,
              targetAlpha: 0.04 + Math.random() * 0.03,
              scrambleTimer: 0, lastScramble: 0,
            });
          }
        }
        newCells.push(row);
      }
      cellsRef.current = newCells;
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = { ...mouseRef.current, active: false };
    }

    function render() {
      const now = performance.now();
      frameRef.current++;
      const { cols, rows, cellW, cellH } = dimsRef.current;
      const w = canvas!.width / (window.devicePixelRatio || 1);
      const h = canvas!.height / (window.devicePixelRatio || 1);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `500 11px "JetBrains Mono", "Geist Mono", monospace`;
      ctx!.textBaseline = "middle";

      const cells = cellsRef.current;

      for (let r = 0; r < rows && r < cells.length; r++) {
        for (let c = 0; c < cols && c < cells[r].length; c++) {
          const cell = cells[r][c];
          const cx = c * cellW + cellW / 2;
          const cy = r * cellH + cellH / 2;

          // Distance from mouse
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inRadius = mouseActive && dist < INFLUENCE_RADIUS;
          const proximity = inRadius ? 1 - (dist / INFLUENCE_RADIUS) : 0;

          if (inRadius) {
            // Scramble: higher proximity = faster scramble, higher opacity
            const scrambleInterval = SCRAMBLE_SPEED + (1 - proximity) * 300;
            cell.targetAlpha = 0.06 + proximity * 0.28;

            if (now - cell.lastScramble > scrambleInterval) {
              cell.targetChar = randomChar();
              cell.lastScramble = now;
            }
          } else {
            // Idle: very faint, slow occasional flicker
            cell.targetAlpha = 0.04 + Math.random() * 0.02;
            if (Math.random() < 0.001) {
              cell.targetChar = randomChar();
              cell.lastScramble = now;
            }
          }

          // Lerp alpha
          cell.alpha += (cell.targetAlpha - cell.alpha) * 0.12;

          // Char transition
          if (cell.char !== cell.targetChar) {
            cell.char = cell.targetChar;
          }

          // Only render if visible enough
          if (cell.alpha > 0.015) {
            // Use blue tint near cursor, grey elsewhere
            if (inRadius && proximity > 0.3) {
              ctx!.fillStyle = `rgba(37, 99, 235, ${cell.alpha * 0.85})`;
            } else {
              ctx!.fillStyle = `rgba(180, 185, 195, ${cell.alpha})`;
            }
            ctx!.fillText(cell.char.charAt(0), cx, cy);
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    resize();
    // Initialize cells if empty
    if (cellsRef.current.length === 0) {
      cellsRef.current = initCells(dimsRef.current.cols, dimsRef.current.rows);
    }

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    // Also track mouse on the parent to capture all movement
    const parent = canvas.parentElement;
    parent?.addEventListener("mousemove", handleMouseMove);
    parent?.addEventListener("mouseleave", handleMouseLeave);

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      parent?.removeEventListener("mousemove", handleMouseMove);
      parent?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [randomChar, initCells]);

  return <canvas ref={canvasRef} className="code-scramble-canvas" aria-hidden="true" />;
}

/* ── Steps Showcase ──────────────────────────────────── */

const stepSnippets: { file: string; content: React.ReactNode }[] = [
  {
    file: "setup.sh",
    content: (
      <code>
        <span className="cm">{"# 1. Install the SDK"}</span>{"\n"}
        <span className="fn">npm</span>{" install "}<span className="str">@0g-mem/sdk</span>{"\n\n"}
        <span className="cm">{"# 2. Or start the Streamable HTTP MCP server"}</span>{"\n"}
        <span className="fn">npm</span>{" run "}<span className="str">mcp:http:dev</span>{"\n\n"}
        <span className="cm">{"# Initialize the client"}</span>{"\n"}
        <span className="kw">import</span>{" { ZeroGMemApiClient } "}<span className="kw">from</span>{" "}<span className="str">"@0g-mem/sdk"</span>{"\n"}
        <span className="kw">const</span>{" client = "}<span className="kw">new</span>{" "}<span className="fn">ZeroGMemApiClient</span>{"({\n"}
        {"  "}<span className="prop">apiKey</span>{": process.env."}<span className="prop">OGMEM_API_KEY</span>{"\n"}{"})"}{";"}
      </code>
    )
  },
  {
    file: "memory.ts",
    content: (
      <code>
        <span className="cm">{"// Store a policy for the trading agent"}</span>{"\n"}
        <span className="kw">await</span>{" client.memory."}<span className="fn">add</span>{"({\n"}
        {"  "}<span className="prop">agentId</span>{": "}<span className="str">"trader-01"</span>{",\n"}
        {"  "}<span className="prop">kind</span>{": "}<span className="str">"policy"</span>{",\n"}
        {"  "}<span className="prop">title</span>{": "}<span className="str">"Max single trade limit"</span>{",\n"}
        {"  "}<span className="prop">content</span>{": { "}<span className="prop">maxTradeUsd</span>{": "}<span className="prop">500</span>{" },\n"}
        {"  "}<span className="prop">tags</span>{": ["}<span className="str">"risk"</span>{", "}<span className="str">"limits"</span>{"]\n"}
        {"});\n\n"}
        <span className="cm">{"// Store a skill the agent learned"}</span>{"\n"}
        <span className="kw">await</span>{" client.memory."}<span className="fn">add</span>{"({\n"}
        {"  "}<span className="prop">agentId</span>{": "}<span className="str">"trader-01"</span>{",\n"}
        {"  "}<span className="prop">kind</span>{": "}<span className="str">"skill"</span>{",\n"}
        {"  "}<span className="prop">title</span>{": "}<span className="str">"Uniswap V3 routing"</span>{"\n"}
        {"});"}
      </code>
    )
  },
  {
    file: "review.ts",
    content: (
      <code>
        <span className="cm">{"// Submit a transaction plan for review"}</span>{"\n"}
        <span className="kw">const</span>{" review = "}<span className="kw">await</span>{" client.aegis.risk."}<span className="fn">reviewPlan</span>{"({\n"}
        {"  "}<span className="prop">agentId</span>{": "}<span className="str">"trader-01"</span>{",\n"}
        {"  "}<span className="prop">intent</span>{": "}<span className="str">"Swap 100 USDC → ETH"</span>{",\n"}
        {"  "}<span className="prop">txs</span>{": [{\n"}
        {"    "}<span className="prop">to</span>{": "}<span className="str">"0x1111...1111"</span>{",\n"}
        {"    "}<span className="prop">data</span>{": "}<span className="str">"0x095ea7b3..."</span>{",\n"}
        {"    "}<span className="prop">label</span>{": "}<span className="str">"USDC approval"</span>{"\n"}
        {"  }]\n"}{"})"}{";"}
        {"\n\n"}{"console."}<span className="fn">log</span>{"(review.verdict."}<span className="prop">decision</span>{");\n"}
        <span className="cm">{"// → ALLOW | WARN | BLOCK | REQUIRE_HUMAN"}</span>
      </code>
    )
  },
  {
    file: "execute.ts",
    content: (
      <code>
        <span className="cm">{"// Act on the verdict"}</span>{"\n"}
        <span className="kw">const</span>{" { "}<span className="prop">decision</span>{", "}<span className="prop">reasons</span>{" } = review.verdict;\n\n"}
        <span className="kw">if</span>{" (decision === "}<span className="str">"ALLOW"</span>{") {\n"}
        {"  "}<span className="kw">await</span>{" "}<span className="fn">executeTrade</span>{"(plan.txs);\n"}
        {"  console."}<span className="fn">log</span>{"("}<span className="str">"✓ Trade executed"</span>{");\n"}
        {"} "}<span className="kw">else if</span>{" (decision === "}<span className="str">"REQUIRE_HUMAN"</span>{") {\n"}
        {"  "}<span className="kw">await</span>{" "}<span className="fn">notifyOperator</span>{"({ plan, reasons });\n"}
        {"} "}<span className="kw">else</span>{" {\n"}
        {"  console."}<span className="fn">log</span>{"("}<span className="str">"✗ Blocked:"</span>{", reasons);\n"}
        {"}"}
      </code>
    )
  },
  {
    file: "learn.ts",
    content: (
      <code>
        <span className="cm">{"// Record trade outcome"}</span>{"\n"}
        <span className="kw">await</span>{" client.memory."}<span className="fn">add</span>{"({\n"}
        {"  "}<span className="prop">agentId</span>{": "}<span className="str">"trader-01"</span>{",\n"}
        {"  "}<span className="prop">kind</span>{": "}<span className="str">"executed_trade"</span>{",\n"}
        {"  "}<span className="prop">title</span>{": "}<span className="str">"Swap 100 USDC → ETH"</span>{",\n"}
        {"  "}<span className="prop">content</span>{": { "}<span className="prop">slippage</span>{": "}<span className="prop">0.3</span>{", "}<span className="prop">gasUsd</span>{": "}<span className="prop">2.1</span>{" }\n"}
        {"});\n\n"}
        <span className="cm">{"// Generate failure lesson if needed"}</span>{"\n"}
        <span className="kw">const</span>{" lesson = "}<span className="kw">await</span>{" client.learning."}<span className="fn">reflect</span>{"({\n"}
        {"  "}<span className="prop">agentId</span>{": "}<span className="str">"trader-01"</span>{",\n"}
        {"  "}<span className="prop">tradeId</span>{": outcome.id\n"}
        {"});\n\n"}
        <span className="cm">{"// Lesson stored & used in future reviews"}</span>{"\n"}
        {"console."}<span className="fn">log</span>{"(lesson."}<span className="prop">rootCause</span>{");"}
      </code>
    )
  }
];

function StepsShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setActiveStep((s) => (s + 1) % 5);
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [paused]);

  function handleStepClick(index: number) {
    setActiveStep(index);
    setProgress(0);
  }

  const snippet = stepSnippets[activeStep];

  return (
    <div className="steps-layout" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="steps-list">
        {howItWorksSteps.map((step, i) => (
          <button
            className={`step-item${i === activeStep ? " step-active" : ""}`}
            key={step.num}
            onClick={() => handleStepClick(i)}
            type="button"
          >
            <span className="step-num">{step.num}</span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
            {i === activeStep && (
              <div className="step-progress">
                <div className="step-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="code-terminal-wrap">
        <div className="code-terminal" key={activeStep}>
          <div className="code-terminal-bar">
            <div className="code-terminal-dots"><span /><span /><span /></div>
            <span className="code-terminal-file">{snippet.file}</span>
          </div>
          <pre className="code-terminal-body">{snippet.content}</pre>
        </div>
      </div>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────── */

export function App() {
  const [activeView, setActiveView] = useState<View>(viewFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [review, setReview] = useState<ReviewPayload | undefined>();
  const [reviewError, setReviewError] = useState<string | undefined>();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authUser, setAuthUser] = useState<AuthUser | undefined>();
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [loginMessage, setLoginMessage] = useState("Use the email that owns this workspace.");
  const [verificationUrl, setVerificationUrl] = useState<string | undefined>();
  const [keyState, setKeyState] = useState<KeyState>("idle");
  const [keyMessage, setKeyMessage] = useState("Create one key per trading agent or runtime.");
  const [newKeySecret, setNewKeySecret] = useState<string | undefined>();

  useEffect(() => {
    function onHashChange() {
      setActiveView(viewFromHash());
      setMenuOpen(false);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        credentials: "include"
      });
      if (!response.ok) {
        setAuthStatus("anonymous");
        setAuthUser(undefined);
        setApiKeys([]);
        return;
      }
      const payload = await response.json();
      setAuthUser(payload.user);
      setApiKeys(Array.isArray(payload.apiKeys) ? payload.apiKeys : []);
      setAuthStatus("authenticated");
    } catch {
      setAuthStatus("anonymous");
      setAuthUser(undefined);
      setApiKeys([]);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  function navigate(view: View) {
    window.location.hash = view === "landing" ? "" : view;
    setActiveView(view);
    setMenuOpen(false);
  }

  async function runReview() {
    setReviewState("loading");
    setReviewError(undefined);
    try {
      const response = await fetch(`${apiBaseUrl}/review-plan`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoPlan)
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const payload = await response.json();
      setReview({ verdict: payload.verdict, proof: payload.proof, source: "api" });
      setReviewState("success");
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "API unavailable");
      setReviewState("error");
    }
  }

  async function requestLogin(email: string) {
    setLoginState("sending");
    setVerificationUrl(undefined);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/request-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `API returned ${response.status}`);
      setVerificationUrl(payload.verificationUrl);
      setLoginState("sent");
      setLoginMessage("Confirmation link created. Open it to finish login.");
    } catch (error) {
      setLoginState("error");
      setLoginMessage(error instanceof Error ? error.message : "Could not start login.");
    }
  }

  async function createApiKey(name: string) {
    setKeyState("creating");
    setNewKeySecret(undefined);
    try {
      const response = await fetch(`${apiBaseUrl}/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `API returned ${response.status}`);
      setNewKeySecret(payload.secret);
      setApiKeys((items) => [payload.apiKey, ...items]);
      setKeyState("created");
      setKeyMessage("Copy this key now. It will not be shown again.");
    } catch (error) {
      setKeyState("error");
      setKeyMessage(error instanceof Error ? error.message : "Could not create API key.");
    }
  }

  async function revokeApiKey(id: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api-keys/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? `API returned ${response.status}`);
      }
      setApiKeys((items) =>
        items.map((item) =>
          item.id === id ? { ...item, revokedAt: new Date().toISOString() } : item
        )
      );
    } catch (error) {
      setKeyState("error");
      setKeyMessage(error instanceof Error ? error.message : "Could not revoke API key.");
    }
  }

  async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include"
    }).catch(() => undefined);
    setAuthUser(undefined);
    setApiKeys([]);
    setAuthStatus("anonymous");
    setNewKeySecret(undefined);
  }

  return (
    <div className="site-shell">
      {/* ── Navbar ── */}
      <header className="topbar">
        <button className="brand" onClick={() => navigate("landing")} type="button">
          <span className="brand-logo"><Logo /></span>
          <strong>0G/MEM</strong>
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary">
          <button className={activeView === "landing" ? "active" : ""} onClick={() => navigate("landing")} type="button">Product</button>
          <button className={activeView === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")} type="button">Dashboard</button>
          <button className={activeView === "api-keys" ? "active" : ""} onClick={() => navigate("api-keys")} type="button">API Keys</button>
          <button className={activeView === "connect" ? "active" : ""} onClick={() => navigate("connect")} type="button">Connect</button>
        </nav>

        <div className="nav-cta-group">
          {authUser ? (
            <button className="nav-login-btn" onClick={logout} type="button" title="Log out">
              {authUser.email}
              <LogOut size={12} />
            </button>
          ) : (
            <button className="nav-login-btn" onClick={() => navigate("dashboard")} type="button">
              Login
              <ChevronDown size={10} />
            </button>
          )}
          <button className="nav-primary-btn" onClick={() => navigate("dashboard")} type="button">
            <span className="nav-primary-label">Start Building</span>
            <span className="nav-primary-arrow" aria-hidden="true">
              <svg viewBox="0 0 14 14"><path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
            </span>
          </button>
        </div>

        <button className="nav-toggle" onClick={() => setMenuOpen((o) => !o)} type="button" aria-label="Toggle navigation">
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      {activeView === "landing" && <Landing onDashboard={() => navigate("dashboard")} onConnect={() => navigate("connect")} />}
      {activeView === "dashboard" && (
        <Dashboard
          apiKeys={apiKeys}
          authStatus={authStatus}
          authUser={authUser}
          loginMessage={loginMessage}
          loginState={loginState}
          onApiKeys={() => navigate("api-keys")}
          onConnect={() => navigate("connect")}
          onRequestLogin={requestLogin}
          onRunReview={runReview}
          review={review}
          reviewError={reviewError}
          reviewState={reviewState}
          verificationUrl={verificationUrl}
        />
      )}
      {activeView === "api-keys" && (
        <ApiKeysPage
          apiKeys={apiKeys}
          authStatus={authStatus}
          authUser={authUser}
          keyMessage={keyMessage}
          keyState={keyState}
          loginMessage={loginMessage}
          loginState={loginState}
          newKeySecret={newKeySecret}
          onConnect={() => navigate("connect")}
          onCreateApiKey={createApiKey}
          onRequestLogin={requestLogin}
          onRevokeApiKey={revokeApiKey}
          verificationUrl={verificationUrl}
        />
      )}
      {activeView === "connect" && (
        <Connect
          apiKeys={apiKeys}
          authStatus={authStatus}
          authUser={authUser}
          loginMessage={loginMessage}
          loginState={loginState}
          onApiKeys={() => navigate("api-keys")}
          onRequestLogin={requestLogin}
          verificationUrl={verificationUrl}
        />
      )}
    </div>
  );
}

/* ── Landing ──────────────────────────────────────────── */

function Landing({ onConnect, onDashboard }: { onConnect: () => void; onDashboard: () => void }) {
  const [activeFeature, setActiveFeature] = useState(productFeatures[0].id);
  const [copied, setCopied] = useState(false);
  const currentFeature = productFeatures.find((f) => f.id === activeFeature) ?? productFeatures[0];

  async function copyNpx() {
    try {
      await navigator.clipboard.writeText("npm install @0g-mem/sdk");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* silent */ }
  }

  return (
    <main className="landing-main">
      <CodeScrambleBackground />
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-center">
          {/* Announcement chip */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener"
            className="announcement-chip"
          >
            <span className="chip-label">
              <span className="chip-dot" aria-hidden="true" />
              <span className="chip-label-text">New</span>
            </span>
            <span className="chip-body">
              <span className="chip-body-text">Built for the 0G Zero Cup Hackathon</span>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 6h6m0 0L6 3m3 3L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </a>

          {/* Headline */}
          <h1 className="hero-headline">
            The safety layer for<br />
            trading agents<span className="accent-dot">.</span>
          </h1>

          {/* Subhead */}
          <p className="hero-subhead">
            0G/MEM gives your agents persistent memory, risk review, failure learning,
            and verifiable proofs, all built in. Decentralized on 0G. Works with any agent.
          </p>

          {/* CTA group */}
          <div className="hero-cta-group">
            <div className="hero-cta-row">
              <button className="btn-primary" onClick={onDashboard} type="button">
                <span className="btn-primary-label">Start Building</span>
                <span className="btn-primary-arrow" aria-hidden="true">
                  <svg viewBox="0 0 14 14"><path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                </span>
              </button>
              <button className="btn-secondary" onClick={onConnect} type="button">
                Connect an agent
              </button>
            </div>

            {/* NPX pill */}
            <button
              className="npx-pill"
              onClick={copyNpx}
              type="button"
              data-copied={copied ? "true" : "false"}
            >
              <span className="dollar">$</span>
              <span className="npx-text">npm install @0g-mem/sdk</span>
              <span className="npx-copied">Copied</span>
              <span className="npx-icon">
                {copied
                  ? <Check size={16} className="icon-check" />
                  : <Clipboard size={16} className="icon-clipboard" />
                }
              </span>
            </button>

            {/* Tertiary link */}
            <a href="#dashboard" className="personal-link">
              <span>Open operator dashboard</span>
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </a>
          </div>

          {/* Logo ticker */}
          <div className="hero-ticker">
            <p className="hero-ticker-label">Built on the 0G decentralized stack</p>
            <div className="hero-ticker-logos">
              <span><Database size={16} /> 0G Storage</span>
              <span><ShieldCheck size={16} /> 0G Compute</span>
              <span><GitBranch size={16} /> 0G Chain</span>
              <span><Code2 size={16} /> SDK</span>
              <span><RadioTower size={16} /> MCP</span>
              <span><ArrowRight size={16} /> REST</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 1: Product Catalog ── */}
      <div className="section-container">
        <span className="section-num">1 / 6</span>
        <div className="feature-tabs-layout">
          <h2>Six things 0G/MEM gives your trading agent.</h2>
          <nav className="feature-tab-list" aria-label="Product features">
            {productFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  className={`feature-tab-btn${f.id === activeFeature ? " active" : ""}`}
                  onClick={() => setActiveFeature(f.id)}
                  type="button"
                >
                  <span className="feature-tab-num">{f.num}</span>
                  <Icon size={16} />
                  {f.title}
                </button>
              );
            })}
          </nav>
          <FeatureDetailCard feature={currentFeature} />
        </div>
      </div>

      {/* ── Section 2: What We Do ── */}
      <div className="section-container">
        <span className="section-num">2 / 6</span>
        <h2 style={{ margin: "0 0 32px", fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", maxWidth: 560 }}>
          Not a bot. The infrastructure your agent calls.
        </h2>
        <div className="split-cards">
          <div className="split-card">
            <Code2 size={20} />
            <h3>SDK and MCP</h3>
            <p>TypeScript SDK for native agent runtimes. MCP server for LLM agents that discover tools at runtime. Same modules underneath.</p>
          </div>
          <div className="split-card">
            <RadioTower size={20} />
            <h3>REST API</h3>
            <p>HTTP endpoints for Python agents, workers, notebooks, and hosted services. POST memory, GET context, POST review.</p>
          </div>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Without 0G/MEM</th>
              <th>With 0G/MEM</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.aspect}>
                <td>{row.aspect}</td>
                <td>{row.legacy}</td>
                <td>{row.ogmem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Section 3: How It Works ── */}
      <div className="section-container">
        <span className="section-num">3 / 6</span>
        <h2 className="section-heading">
          Five steps from install to verifiable safety.
        </h2>
        <StepsShowcase />
      </div>

      {/* ── Section 4: 0G Stack ── */}
      <div className="section-container">
        <span className="section-num">4 / 6</span>
        <h2 style={{ margin: "0 0 32px", fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", maxWidth: 560 }}>
          Decentralized memory, private reasoning, verifiable proof.
        </h2>
        <div className="stack-grid">
          {stackItems.map((item) => {
            const Icon = item.icon;
            return (
              <article className="stack-item" key={item.title}>
                <Icon size={16} />
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Section 5: Pillars ── */}
      <div className="section-container">
        <span className="section-num">5 / 6</span>
        <div className="feature-section" style={{ padding: 0, maxWidth: "100%" }}>
          <h2 style={{ margin: "0 0 48px", fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", maxWidth: 560 }}>
            Three things 0G/MEM gives your agent.
          </h2>
          <div className="feature-list">
            {productPillars.map((pillar, i) => (
              <article className="feature-item" key={pillar.title}>
                <span className="feature-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 6: Connect CTA ── */}
      <div className="section-container">
        <span className="section-num">6 / 6</span>
        <div className="split-cards">
          <div className="split-card">
            <Database size={20} />
            <h3>For SDK agents</h3>
            <p>Install @0g-mem/sdk, add memory, review plans, record outcomes, and anchor proofs — all from TypeScript.</p>
          </div>
          <div className="split-card">
            <RadioTower size={20} />
            <h3>For LLM agents</h3>
            <p>Start the MCP server. Claude, Codex, and any MCP-compatible agent discovers tools automatically.</p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-cta-banner">
          <h2>Your trading agents deserve memory.</h2>
          <p>Persistent context, safety review, failure learning, and verifiable proof. Built on 0G.</p>
          <div className="footer-cta-actions">
            <button className="btn-primary" onClick={onDashboard} type="button">
              <span className="btn-primary-label">Start Building</span>
              <span className="btn-primary-arrow" aria-hidden="true">
                <svg viewBox="0 0 14 14"><path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </span>
            </button>
            <button className="btn-secondary" onClick={onConnect} type="button">
              Connect an agent
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-inner">
            <p>0G/MEM · Built for the 0G Zero Cup Hackathon</p>
            <div className="footer-links">
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
              <a href="#dashboard">Dashboard</a>
              <a href="#connect">Connect</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Feature Detail Card ─────────────────────────────── */

function FeatureDetailCard({ feature }: { feature: ProductFeature }) {
  const Icon = feature.icon;
  return (
    <div className="feature-detail-card">
      <Icon size={24} />
      <h3>{feature.title}</h3>
      <p className="feature-headline">{feature.headline}</p>
      <p>{feature.body}</p>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────── */

function Dashboard({
  apiKeys,
  authStatus,
  authUser,
  loginMessage,
  loginState,
  onApiKeys,
  onConnect,
  onRequestLogin,
  onRunReview,
  review,
  reviewError,
  reviewState,
  verificationUrl
}: {
  apiKeys: ApiKeySummary[];
  authStatus: AuthStatus;
  authUser?: AuthUser;
  loginMessage: string;
  loginState: LoginState;
  onApiKeys: () => void;
  onConnect: () => void;
  onRequestLogin: (email: string) => Promise<void>;
  onRunReview: () => void;
  review?: ReviewPayload;
  reviewError?: string;
  reviewState: ReviewState;
  verificationUrl?: string;
}) {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [manualForm, setManualForm] = useState<ManualMemoryForm>(emptyManualForm);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("Manual memories are persisted through the authenticated API.");

  const selectedMemory = selectedId
    ? memories.find((m) => m.id === selectedId)
    : undefined;

  const sourceCounts = useMemo(() => {
    return memories.reduce(
      (acc, m) => { acc[m.source] += 1; return acc; },
      { SDK: 0, MCP: 0, API: 0, Manual: 0 } as Record<MemorySource, number>
    );
  }, [memories]);

  const connectedAgents = useMemo(() => {
    return new Set(memories.map((memory) => memory.agentId)).size;
  }, [memories]);

  const dashboardStats = useMemo(() => {
    const activeKeys = apiKeys.filter((key) => !key.revokedAt).length;
    const activeSources = Object.values(sourceCounts).filter((count) => count > 0).length;
    return [
      {
        label: "Saved records",
        value: memories.length.toLocaleString(),
        detail: memories.length === 1 ? "real memory in this workspace" : "real memories in this workspace"
      },
      {
        label: "Connected agents",
        value: connectedAgents.toLocaleString(),
        detail: "agents with saved memory"
      },
      {
        label: "Active API keys",
        value: activeKeys.toLocaleString(),
        detail: "keys agents can use right now"
      },
      {
        label: "Sources active",
        value: activeSources.toLocaleString(),
        detail: "SDK, MCP, API, or manual sources seen"
      }
    ];
  }, [apiKeys, connectedAgents, memories.length, sourceCounts]);

  useEffect(() => {
    if (!authUser) {
      setMemories([]);
      setSelectedId(undefined);
      return;
    }

    let cancelled = false;
    async function loadApiMemories() {
      try {
        const responses = await Promise.all(
          agentOptions.map(async (agent) => {
            const r = await fetch(`${apiBaseUrl}/memory?agentId=${encodeURIComponent(agent.id)}&limit=20`, {
              credentials: "include"
            });
            if (!r.ok) return [];
            const p = await r.json();
            return Array.isArray(p.memories) ? p.memories : [];
          })
        );
        if (cancelled) return;
        const apiMems = responses.flat().filter(isApiMemoryRecord).map((m, i) => mapApiMemory(m, i));
        setMemories(apiMems);
        setSelectedId((current) => {
          if (current && apiMems.some((memory) => memory.id === current)) return current;
          return apiMems[0]?.id;
        });
      } catch { /* API optional */ }
    }
    void loadApiMemories();
    return () => { cancelled = true; };
  }, [authUser?.id]);

  async function handleAddMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualForm.title.trim() || !manualForm.detail.trim()) {
      setSaveState("error");
      setSaveMessage("Add a title and memory content before saving.");
      return;
    }
    setSaveState("saving");
    const tags = parseTags(manualForm.tags);
    const newMem = makeManualMemory(manualForm, tags, memories.length);
    try {
      const r = await fetch(`${apiBaseUrl}/memory`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: manualForm.agentId, kind: manualForm.kind, title: manualForm.title.trim(),
          content: { note: manualForm.detail.trim(), agentName: manualForm.agentName, source: "Manual", capturedFrom: "dashboard", tags },
          tags: ["manual", ...tags], visibility: "private", createdAt: new Date().toISOString()
        })
      });
      if (!r.ok) throw new Error(`API returned ${r.status}`);
      const payload = await r.json();
      const saved = { ...newMem, id: payload.memory?.id ?? newMem.id, status: "synced" as const, from: "POST /memory" };
      setMemories((items) => [saved, ...items]);
      setSelectedId(saved.id);
      setSaveState("success");
      setSaveMessage("Saved through the 0G/MEM API and added to the graph.");
      setManualForm((f) => ({ ...f, title: "", detail: "", tags: "" }));
    } catch (error) {
      setSaveState("error");
      setSaveMessage(`Memory was not saved. ${error instanceof Error ? error.message : "API unavailable."}`);
    }
  }

  function handleAgentChange(agentId: string) {
    const agent = agentOptions.find((x) => x.id === agentId) ?? agentOptions[0];
    setManualForm((f) => ({ ...f, agentId: agent.id, agentName: agent.name }));
  }

  if (authStatus === "loading") {
    return (
      <main className="dashboard-layout">
        <section className="auth-shell">
          <Loader2 className="spin" size={18} />
          <p>Checking workspace session...</p>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="dashboard-layout">
        <AuthPanel
          loginMessage={loginMessage}
          loginState={loginState}
          onRequestLogin={onRequestLogin}
          verificationUrl={verificationUrl}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-layout">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">memory control plane</p>
          <h1>See what every connected agent remembers.</h1>
          <p>Data enters through SDK, MCP, REST API, or manual operator notes. The graph keeps source and agent identity visible.</p>
        </div>
        <div className="dashboard-actions">
          <button className="secondary-action" onClick={onConnect} type="button">Connection guide</button>
          <button className="primary-action" onClick={onRunReview} type="button">
            {reviewState === "loading" ? <Loader2 className="spin" size={15} /> : <ShieldCheck size={15} />}
            Review sample plan
          </button>
        </div>
      </section>

      <section className="metric-grid">
        {dashboardStats.map((s) => (
          <article className="metric-card" key={s.label}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <p>{s.detail}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel map-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">saved data map</p>
              <h2>Memory by source and agent</h2>
            </div>
            <div className="legend">
              {(Object.keys(sourceMeta) as MemorySource[]).map((src) => (
                <span key={src}><i style={{ background: sourceMeta[src].color }} />{src}</span>
              ))}
            </div>
          </div>
          <MemoryBubbleMap memories={memories} selectedId={selectedId} onSelect={setSelectedId} />
        </article>

        <aside className="panel detail-panel">
          {selectedMemory ? (
            <>
              <div className="panel-header">
                <div>
                  <p className="eyebrow">selected memory</p>
                  <h2>{selectedMemory.title}</h2>
                </div>
                <span className={`sync-pill ${selectedMemory.status}`}>
                  {selectedMemory.status === "synced" ? "synced" : "local"}
                </span>
              </div>
              <p className="detail-copy">{selectedMemory.detail}</p>
              <dl className="detail-list">
                <div><dt>Agent</dt><dd>{selectedMemory.agentName}</dd></div>
                <div><dt>Source</dt><dd>{selectedMemory.source}</dd></div>
                <div><dt>From</dt><dd>{selectedMemory.from}</dd></div>
                <div><dt>Kind</dt><dd>{kindLabels[selectedMemory.kind]}</dd></div>
              </dl>
              <div className="tag-row">
                {selectedMemory.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </>
          ) : (
            <EmptyPanel
              eyebrow="selected memory"
              title="No memory selected"
              detail="Add memory manually or connect an agent through the SDK, MCP server, or REST API."
            />
          )}
        </aside>

        <article className="panel workspace-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">workspace access</p>
              <h2>Agent API keys live on their own page</h2>
            </div>
            <KeyRound size={18} />
          </div>
          <div className="account-row">
            <span>{authUser.email}</span>
            <strong>verified email</strong>
          </div>
          <p className="detail-copy">
            Create one key per trading agent or runtime. New keys are shown once,
            then agents use them through the SDK, MCP server, or REST API.
          </p>
          <button className="primary-action full" onClick={onApiKeys} type="button">
            <KeyRound size={15} />
            Manage API keys
          </button>
        </article>

        <article className="panel form-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">manual capture</p>
              <h2>Add memory</h2>
            </div>
            <Plus size={16} />
          </div>
          <form className="memory-form" onSubmit={handleAddMemory}>
            <label>
              <span>AI agent</span>
              <select value={manualForm.agentId} onChange={(e) => handleAgentChange(e.target.value)}>
                {agentOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label>
              <span>Memory kind</span>
              <select value={manualForm.kind} onChange={(e) => setManualForm((f) => ({ ...f, kind: e.target.value as MemoryKind }))}>
                {(Object.entries(kindLabels) as [MemoryKind, string][]).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label>
              <span>Title</span>
              <input value={manualForm.title} onChange={(e) => setManualForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Avoid low liquidity pools" />
            </label>
            <label>
              <span>Memory content</span>
              <textarea value={manualForm.detail} onChange={(e) => setManualForm((f) => ({ ...f, detail: e.target.value }))} placeholder="What should the agent remember before it trades?" rows={4} />
            </label>
            <label>
              <span>Tags</span>
              <input value={manualForm.tags} onChange={(e) => setManualForm((f) => ({ ...f, tags: e.target.value }))} placeholder="policy, slippage, vault" />
            </label>
            <button className="primary-action full" type="submit" disabled={saveState === "saving"}>
              {saveState === "saving" ? <Loader2 className="spin" size={15} /> : <Save size={15} />}
              Save memory
            </button>
          </form>
          <div className={`status-note ${saveState}`}>
            {saveState === "success" && <CheckCircle2 size={14} />}
            {saveMessage}
          </div>
        </article>

        <article className="panel review-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">aegis review</p>
              <h2>Sample transaction decision</h2>
            </div>
            {review ? <DecisionPill decision={review.verdict.decision} /> : <span className="pending-pill">Not run</span>}
          </div>
          {review ? (
            <>
              <div className="risk-meter">
                <span>{review.verdict.riskScore}</span>
                <p>{review.verdict.reason}</p>
              </div>
              <div className="review-source">
                {review.proof?.provider === "0g"
                  ? `Recorded on 0G Chain${review.proof.txHash ? `: ${shortHash(review.proof.txHash)}` : "."}`
                  : `Verdict returned by the API. Proof provider: ${review.proof?.provider ?? "not reported"}.`}
              </div>
            </>
          ) : (
            <div className={`status-note ${reviewState === "error" ? "error" : ""}`}>
              {reviewState === "error"
                ? `Review failed. ${reviewError ?? "API unavailable."}`
                : "No review has been run for this workspace session yet."}
            </div>
          )}
        </article>

        <article className="panel provenance-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">provenance</p>
              <h2>Where memory came from</h2>
            </div>
            <Search size={16} />
          </div>
          <div className="source-summary">
            {(Object.keys(sourceMeta) as MemorySource[]).map((src) => (
              <div key={src}>
                <span style={{ color: sourceMeta[src].color }}>{sourceCounts[src]}</span>
                <strong>{src}</strong>
                <p>{sourceMeta[src].detail}</p>
              </div>
            ))}
          </div>
          <div className="provenance-list">
            {memories.length > 0 ? (
              memories.slice(0, 7).map((m) => (
                <button key={m.id} onClick={() => setSelectedId(m.id)} type="button">
                  <span>{m.source}</span>
                  <strong>{m.title}</strong>
                  <small>{m.agentName}</small>
                </button>
              ))
            ) : (
              <div className="empty-row">No memory provenance yet.</div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

/* ── Bubble Map ───────────────────────────────────────── */

function MemoryBubbleMap({ memories, onSelect, selectedId }: { memories: MemoryNode[]; onSelect: (id: string) => void; selectedId?: string }) {
  return (
    <div className="bubble-stage">
      <svg className="bubble-lines" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        {memories.map((m) => (
          <line key={m.id} x1="50" y1="50" x2={m.x} y2={m.y} style={{ stroke: sourceMeta[m.source].color }} />
        ))}
      </svg>
      <div className="memory-core">
        <Database size={18} />
        <strong>0G/MEM</strong>
        <span>shared memory</span>
      </div>
      {memories.length === 0 && (
        <div className="bubble-empty">
          <strong>No saved memories yet</strong>
          <span>Connect an agent or add the first memory manually.</span>
        </div>
      )}
      {memories.map((m) => (
        <button
          className={m.id === selectedId ? "memory-bubble active" : "memory-bubble"}
          key={m.id}
          onClick={() => onSelect(m.id)}
          style={{ "--x": `${m.x}%`, "--y": `${m.y}%`, "--size": `${m.size}px`, "--source": sourceMeta[m.source].color, "--soft": sourceMeta[m.source].soft } as CSSProperties}
          type="button"
        >
          <span>{m.source}</span>
          <strong>{m.title}</strong>
          <small>{m.agentName}</small>
        </button>
      ))}
    </div>
  );
}

/* ── Connect ──────────────────────────────────────────── */

function ApiKeysPage({
  apiKeys,
  authStatus,
  authUser,
  keyMessage,
  keyState,
  loginMessage,
  loginState,
  newKeySecret,
  onConnect,
  onCreateApiKey,
  onRequestLogin,
  onRevokeApiKey,
  verificationUrl
}: {
  apiKeys: ApiKeySummary[];
  authStatus: AuthStatus;
  authUser?: AuthUser;
  keyMessage: string;
  keyState: KeyState;
  loginMessage: string;
  loginState: LoginState;
  newKeySecret?: string;
  onConnect: () => void;
  onCreateApiKey: (name: string) => Promise<void>;
  onRequestLogin: (email: string) => Promise<void>;
  onRevokeApiKey: (id: string) => Promise<void>;
  verificationUrl?: string;
}) {
  const activeKeys = apiKeys.filter((key) => !key.revokedAt);
  const revokedKeys = apiKeys.length - activeKeys.length;
  const lastUsed = activeKeys
    .map((key) => key.lastUsedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (authStatus === "loading") {
    return (
      <main className="dashboard-layout">
        <section className="auth-shell">
          <Loader2 className="spin" size={18} />
          <p>Checking workspace session...</p>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="dashboard-layout">
        <AuthPanel
          loginMessage={loginMessage}
          loginState={loginState}
          onRequestLogin={onRequestLogin}
          verificationUrl={verificationUrl}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-layout">
      <section className="api-keys-hero">
        <div>
          <p className="eyebrow">workspace access</p>
          <h1>Issue keys for the agents that write memory.</h1>
          <p>Each SDK, MCP, or REST integration should have its own key so records can stay scoped, auditable, and easy to revoke.</p>
        </div>
        <button className="secondary-action" onClick={onConnect} type="button">
          Connection guide
          <ArrowRight size={14} />
        </button>
      </section>

      <section className="api-key-stats" aria-label="API key status">
        <article>
          <span>Active keys</span>
          <strong>{activeKeys.length}</strong>
          <p>usable by connected agents</p>
        </article>
        <article>
          <span>Revoked keys</span>
          <strong>{revokedKeys}</strong>
          <p>blocked from workspace access</p>
        </article>
        <article>
          <span>Last used</span>
          <strong>{lastUsed ? formatDate(lastUsed) : "never"}</strong>
          <p>based on API authentication</p>
        </article>
      </section>

      <section className="api-keys-grid">
        <ApiKeyPanel
          apiKeys={apiKeys}
          className="api-keys-manager"
          keyMessage={keyMessage}
          keyState={keyState}
          newKeySecret={newKeySecret}
          onCreateApiKey={onCreateApiKey}
          onRevokeApiKey={onRevokeApiKey}
          user={authUser}
        />

        <aside className="panel api-keys-guide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">agent setup</p>
              <h2>Use the key outside the dashboard</h2>
            </div>
            <Code2 size={18} />
          </div>
          <div className="key-setup-list">
            <div>
              <span>SDK</span>
              <code>OGMEM_API_KEY=ogm_live_...</code>
            </div>
            <div>
              <span>MCP</span>
              <code>Bearer token env var: OGMEM_API_KEY</code>
            </div>
            <div>
              <span>REST</span>
              <code>Authorization: Bearer ogm_live_...</code>
            </div>
          </div>
          <p className="detail-copy">
            The API stores only a hash of the key. Copy the secret when it is created;
            if it is lost, revoke it and issue a new one.
          </p>
        </aside>
      </section>
    </main>
  );
}

function AuthPanel({
  loginMessage,
  loginState,
  onRequestLogin,
  verificationUrl
}: {
  loginMessage: string;
  loginState: LoginState;
  onRequestLogin: (email: string) => Promise<void>;
  verificationUrl?: string;
}) {
  const [email, setEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onRequestLogin(email);
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel-copy">
        <p className="eyebrow">workspace login</p>
        <h1>Confirm your email before agents write memory.</h1>
        <p>
          Your dashboard session creates API keys. Your SDK and MCP agents use
          those keys so every memory record is scoped to your workspace.
        </p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <Mail size={20} />
        <h2>Email verification</h2>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </label>
        <button className="primary-action full" disabled={loginState === "sending"} type="submit">
          {loginState === "sending" ? <Loader2 className="spin" size={15} /> : <Mail size={15} />}
          Send confirmation link
        </button>
        <div className={`status-note ${loginState}`}>{loginMessage}</div>
        {verificationUrl && (
          <a className="verification-link" href={verificationUrl}>
            Open confirmation link
            <ArrowRight size={14} />
          </a>
        )}
      </form>
    </section>
  );
}

function ApiKeyPanel({
  apiKeys,
  className = "",
  keyMessage,
  keyState,
  newKeySecret,
  onCreateApiKey,
  onRevokeApiKey,
  user
}: {
  apiKeys: ApiKeySummary[];
  className?: string;
  keyMessage: string;
  keyState: KeyState;
  newKeySecret?: string;
  onCreateApiKey: (name: string) => Promise<void>;
  onRevokeApiKey: (id: string) => Promise<void>;
  user: AuthUser;
}) {
  const [name, setName] = useState("Trading agent key");
  const [copyLabel, setCopyLabel] = useState("Copy");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateApiKey(name);
  }

  async function copySecret() {
    if (!newKeySecret) return;
    try {
      await navigator.clipboard.writeText(newKeySecret);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy"), 1400);
    } catch {
      setCopyLabel("Failed");
      window.setTimeout(() => setCopyLabel("Copy"), 1400);
    }
  }

  return (
    <article className={`panel api-key-panel ${className}`}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">workspace identity</p>
          <h2>API keys for agent memory</h2>
        </div>
        <KeyRound size={18} />
      </div>

      <div className="account-row">
        <span>{user.email}</span>
        <strong>verified email</strong>
      </div>

      <form className="api-key-form" onSubmit={submit}>
        <label>
          <span>Key name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button className="primary-action" disabled={keyState === "creating"} type="submit">
          {keyState === "creating" ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
          Create API key
        </button>
      </form>

      {newKeySecret && (
        <div className="secret-box">
          <code>{newKeySecret}</code>
          <button onClick={copySecret} type="button">
            <Clipboard size={14} />
            {copyLabel}
          </button>
        </div>
      )}

      <div className={`status-note ${keyState}`}>{keyMessage}</div>

      <div className="api-key-list">
        {apiKeys.length === 0 ? (
          <p>No API keys yet.</p>
        ) : (
          apiKeys.map((apiKey) => (
            <div className={apiKey.revokedAt ? "revoked" : ""} key={apiKey.id}>
              <span>
                <strong>{apiKey.name}</strong>
                <small>{apiKey.prefix}...</small>
              </span>
              <button
                aria-label={`Revoke ${apiKey.name}`}
                disabled={Boolean(apiKey.revokedAt)}
                onClick={() => onRevokeApiKey(apiKey.id)}
                type="button"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function Connect({
  apiKeys,
  authStatus,
  authUser,
  loginMessage,
  loginState,
  onApiKeys,
  onRequestLogin,
  verificationUrl
}: {
  apiKeys: ApiKeySummary[];
  authStatus: AuthStatus;
  authUser?: AuthUser;
  loginMessage: string;
  loginState: LoginState;
  onApiKeys: () => void;
  onRequestLogin: (email: string) => Promise<void>;
  verificationUrl?: string;
}) {
  const [activeMethod, setActiveMethod] = useState<MethodId>("sdk");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const method = useMemo(() => connectionMethods.find((x) => x.id === activeMethod) ?? connectionMethods[0], [activeMethod]);
  const Icon = method.icon;

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(method.command);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy"), 1400);
    } catch {
      setCopyLabel("Failed");
      window.setTimeout(() => setCopyLabel("Copy"), 1400);
    }
  }

  const workflowSteps = [
    { num: "1", label: "Save memory", icon: Database },
    { num: "2", label: "Fetch context", icon: Search },
    { num: "3", label: "Review plan", icon: ShieldCheck },
    { num: "4", label: "Execute or stop", icon: CheckCircle2 },
    { num: "5", label: "Record outcome", icon: GitBranch }
  ];

  return (
    <main className="connect-layout">
      {/* ── Hero ── */}
      <section className="connect-hero">
        <div className="connect-hero-badge">
          <RadioTower size={12} />
          <span>Integration Surface</span>
        </div>
        <h1>Connect the agents<br />you already run<span className="accent-dot">.</span></h1>
        <p>The agent keeps its strategy loop, wallet, and executor.<br className="hide-mobile" />0G/MEM supplies memory, context retrieval, safety review, and proofs.</p>
      </section>

      {/* ── Method Selector ── */}
      <section className="connect-methods">
        {connectionMethods.map((item) => {
          const TabIcon = item.icon;
          const isActive = item.id === activeMethod;
          return (
            <button
              className={`connect-method-card${isActive ? " active" : ""}`}
              key={item.id}
              onClick={() => setActiveMethod(item.id)}
              type="button"
            >
              <span className="connect-method-icon">
                <TabIcon size={20} />
              </span>
              <strong>{item.title}</strong>
              <span className="connect-method-desc">{item.subtitle}</span>
              {isActive && <span className="connect-method-active-indicator" />}
            </button>
          );
        })}
      </section>

      {/* ── Main Content Grid ── */}
      <section className="connect-content">
        {/* Left: Integration detail */}
        <div className="connect-detail">
          <div className="connect-detail-header">
            <Icon size={20} />
            <h2>{method.title}</h2>
          </div>

          {/* Install command */}
          <div className="connect-command">
            <span className="connect-command-label">Quick start</span>
            <div className="connect-command-row">
              <code>
                <span className="dollar-sign">$</span>
                {method.command}
              </code>
              <button type="button" onClick={copyCommand} aria-label="Copy command">
                <Clipboard size={13} />
                {copyLabel}
              </button>
            </div>
          </div>

          {/* Features */}
          <ul className="connect-features">
            {method.bullets.map((b) => (
              <li key={b}>
                <span className="connect-feature-check">
                  <CheckCircle2 size={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* Code snippet */}
          <div className="connect-code-block">
            <div className="connect-code-header">
              <div className="connect-code-dots"><span /><span /><span /></div>
              <span>{method.id === "sdk" ? "agent.ts" : method.id === "mcp" ? "mcp-config.json" : "client.ts"}</span>
            </div>
            <pre><SyntaxHighlightedCode method={activeMethod} /></pre>
          </div>
        </div>

        {/* Right: Auth + Workflow + Status */}
        <div className="connect-sidebar">
          {/* Auth section */}
          <div className="connect-auth-section">
            {authStatus === "loading" ? (
              <div className="connect-auth-loading">
                <Loader2 className="spin" size={18} />
                <p>Checking workspace session...</p>
              </div>
            ) : authUser ? (
              <article className="panel connect-key-card">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">workspace keys</p>
                    <h2>{apiKeys.filter((key) => !key.revokedAt).length} active API keys</h2>
                  </div>
                  <KeyRound size={18} />
                </div>
                <p className="detail-copy">
                  Create and revoke agent credentials from the dedicated API Keys page.
                  Keep one key per runtime so access is easy to rotate.
                </p>
                <button className="primary-action full" onClick={onApiKeys} type="button">
                  Manage API keys
                  <ArrowRight size={14} />
                </button>
              </article>
            ) : (
              <AuthPanel
                loginMessage={loginMessage}
                loginState={loginState}
                onRequestLogin={onRequestLogin}
                verificationUrl={verificationUrl}
              />
            )}
          </div>

          {/* Live status */}
          <article className="connect-status-card">
            <div className="connect-status-header">
              <span className="connect-status-dot" />
              <strong>Live on 0G mainnet</strong>
            </div>
            <p>Proof registry deployed. Set API env variables, restart the API, then SDK and MCP calls use authenticated workspace data.</p>
            <div className="connect-status-address">
              <code>0xCbc3AE7d33c2F6E2600E0F9E3fE1610DD84E14A5</code>
            </div>
            <a href="/docs/live-0g-checklist.md" target="_blank" rel="noreferrer" className="connect-status-link">
              Read deployment checklist
              <ArrowRight size={13} />
            </a>
          </article>
        </div>
      </section>

      {/* ── Workflow Pipeline ── */}
      <section className="connect-workflow">
        <div className="connect-workflow-header">
          <span className="section-num">pipeline</span>
          <h2>Five steps from install to verifiable safety.</h2>
        </div>
        <div className="connect-pipeline">
          {workflowSteps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div className="connect-pipeline-step" key={step.num}>
                <div className="connect-pipeline-num">
                  <span>{step.num}</span>
                </div>
                <div className="connect-pipeline-icon">
                  <StepIcon size={18} />
                </div>
                <strong>{step.label}</strong>
                {i < workflowSteps.length - 1 && (
                  <div className="connect-pipeline-connector" aria-hidden="true">
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* ── Small Components ─────────────────────────────────── */

function EmptyPanel({ detail, eyebrow, title }: { detail: string; eyebrow: string; title: string }) {
  return (
    <div className="empty-panel">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{detail}</p>
    </div>
  );
}

function DecisionPill({ decision }: { decision: Decision }) {
  return <span className={`decision-pill ${decision.toLowerCase()}`}>{decision}</span>;
}

/* ── Utilities ────────────────────────────────────────── */

function connectionSnippet(method: MethodId) {
  if (method === "api") return `await fetch("http://127.0.0.1:8787/v1/memory", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer " + process.env.OGMEM_API_KEY,\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(memory)\n});`;
  if (method === "mcp") return `{\n  "name": "0gmem",\n  "type": "streamable-http",\n  "url": "https://your-0gmem-api.example.com/mcp",\n  "bearerTokenEnvVar": "OGMEM_API_KEY"\n}`;
  return `import { ZeroGMemApiClient } from "@0g-mem/sdk";\n\nconst client = new ZeroGMemApiClient({\n  apiKey: process.env.OGMEM_API_KEY,\n  baseUrl: "http://127.0.0.1:8787"\n});\n\nawait client.memory.add(memory);\nconst context = await client.context.forTradePlan(plan);\nconst review = await client.aegis.risk.reviewPlan(plan);`;
}

function SyntaxHighlightedCode({ method }: { method: MethodId }) {
  if (method === "sdk") {
    return (
      <code>
        <span className="syn-kw">import</span>{" { ZeroGMemApiClient } "}<span className="syn-kw">from</span> <span className="syn-str">"@0g-mem/sdk"</span>{";\n\n"}
        <span className="syn-kw">const</span> client = <span className="syn-kw">new</span> <span className="syn-fn">ZeroGMemApiClient</span>{"({\n"}
        {"  "}<span className="syn-prop">apiKey</span>{": process.env."}<span className="syn-prop">OGMEM_API_KEY</span>{",\n"}
        {"  "}<span className="syn-prop">baseUrl</span>{": "}<span className="syn-str">"http://127.0.0.1:8787"</span>{"\n"}{"})"}{";"}
        {"\n\n"}<span className="syn-kw">await</span> client.memory.<span className="syn-fn">add</span>{"(memory);\n"}
        <span className="syn-kw">const</span> context = <span className="syn-kw">await</span> client.context.<span className="syn-fn">forTradePlan</span>{"(plan);\n"}
        <span className="syn-kw">const</span> review = <span className="syn-kw">await</span> client.aegis.risk.<span className="syn-fn">reviewPlan</span>{"(plan);"}
      </code>
    );
  }
  if (method === "mcp") {
    return (
      <code>
        {"{\n"}
        {"  "}<span className="syn-prop">"name"</span>{": "}<span className="syn-str">"0gmem"</span>{",\n"}
        {"  "}<span className="syn-prop">"type"</span>{": "}<span className="syn-str">"streamable-http"</span>{",\n"}
        {"  "}<span className="syn-prop">"url"</span>{": "}<span className="syn-str">"https://your-0gmem-api.example.com/mcp"</span>{",\n"}
        {"  "}<span className="syn-prop">"bearerTokenEnvVar"</span>{": "}<span className="syn-str">"OGMEM_API_KEY"</span>{"\n"}
        {"}"}
      </code>
    );
  }
  // api
  return (
    <code>
      <span className="syn-kw">await</span> <span className="syn-fn">fetch</span>{"("}<span className="syn-str">"http://127.0.0.1:8787/v1/memory"</span>{", {\n"}
      {"  "}<span className="syn-prop">method</span>{": "}<span className="syn-str">"POST"</span>{",\n"}
      {"  "}<span className="syn-prop">headers</span>{": {\n"}
      {"    "}<span className="syn-str">"Authorization"</span>{": "}<span className="syn-str">"Bearer "</span>{" + process.env."}<span className="syn-prop">OGMEM_API_KEY</span>{",\n"}
      {"    "}<span className="syn-str">"Content-Type"</span>{": "}<span className="syn-str">"application/json"</span>{"\n"}
      {"  },\n"}
      {"  "}<span className="syn-prop">body</span>{": JSON."}<span className="syn-fn">stringify</span>{"(memory)\n"}
      {"});"}
    </code>
  );
}

function makeManualMemory(form: ManualMemoryForm, tags: string[], index: number): MemoryNode {
  const pos = nextBubblePosition(index);
  return {
    id: `manual-${Date.now()}`, kind: form.kind, title: form.title.trim(), detail: form.detail.trim(),
    agentId: form.agentId, agentName: form.agentName, source: "Manual", from: "dashboard operator note",
    age: "now", size: Math.min(138, Math.max(104, 96 + form.title.length)),
    x: pos.x, y: pos.y, confidence: 82, tags: tags.length > 0 ? tags : ["manual"], linked: [], status: "local"
  };
}

function nextBubblePosition(index: number) {
  const positions = [{ x: 18, y: 42 }, { x: 84, y: 32 }, { x: 48, y: 86 }, { x: 15, y: 76 }, { x: 88, y: 68 }, { x: 36, y: 14 }];
  return positions[index % positions.length];
}

function parseTags(value: string) {
  return value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);
}

function shortHash(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function mapApiMemory(memory: ApiMemoryRecord, index: number): MemoryNode {
  const content = memory.content ?? {};
  const agent = agentOptions.find((x) => x.id === memory.agentId);
  const agentName = typeof content.agentName === "string" ? content.agentName : agent?.name ?? memory.agentId;
  const source = isMemorySource(content.source) ? content.source : "API";
  const detail = typeof content.note === "string" ? content.note : typeof content.detail === "string" ? content.detail : "Persisted memory loaded from the 0G/MEM API.";
  const pos = nextBubblePosition(index);
  return {
    id: memory.id, kind: memory.kind, title: memory.title, detail, agentId: memory.agentId, agentName, source,
    from: source === "Manual" ? "POST /memory" : "GET /memory", age: memory.createdAt ? "synced" : "saved",
    size: Math.min(138, Math.max(104, 96 + memory.title.length)), x: pos.x, y: pos.y, confidence: 90,
    tags: memory.tags?.length ? memory.tags.slice(0, 5) : [source.toLowerCase()], linked: [], status: "synced"
  };
}

function isApiMemoryRecord(value: unknown): value is ApiMemoryRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.agentId === "string" && typeof value.title === "string" && typeof value.kind === "string" && value.kind in kindLabels;
}

function isMemorySource(value: unknown): value is MemorySource {
  return typeof value === "string" && value in sourceMeta;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function viewFromHash(): View {
  const hash = window.location.hash.replace("#", "");
  if (hash === "dashboard" || hash === "connect" || hash === "api-keys") return hash;
  return "landing";
}
