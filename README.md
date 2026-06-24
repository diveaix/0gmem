# 0G-Mem

**Memory, risk review, learning, and proof infrastructure for AI trading agents.**

0G-Mem is not a trading bot. It is the layer that existing trading agents call before and after they act. Agents keep their own strategy, wallet, market data, and execution system. 0G-Mem gives them persistent memory, pre-execution safety review, failure learning, API-key scoped access, MCP tools, and 0G proof anchoring.

Built for the 0G hackathon.

![0G-Mem memory map](packages/web/public/assets/minimal-memory-map.png)

## What This Website Can Do

The web app is the operator control plane for 0G-Mem.

### Landing Page

The landing page explains the product boundary clearly:

- 0G-Mem is infrastructure for agents, not an auto-trading agent.
- It provides memory, safety, learning, and proof.
- It shows how SDK, API, MCP, 0G Storage, 0G Compute, and 0G Chain fit together.
- It gives judges and developers the product story without needing to read code first.

### Dashboard

The dashboard shows only real workspace data. It does not show seeded fake memories.

It can:

- show saved memory records for the logged-in workspace
- show connected agent count based on real memory data
- show source counts for SDK, MCP, REST API, and manual dashboard entries
- display a bubble map of memory by source and agent
- show exactly where a selected memory came from
- manually add memory for an agent
- save manual memory through the authenticated API
- run a sample Aegis transaction review
- display the review decision, risk score, reason, and proof provider
- show provenance for all visible memory
- link users to the connection guide
- link users to API key management

### API Keys Page

The API Keys page is the identity and access layer for connected agents.

It can:

- create API keys for trading agents
- show the raw API key secret once
- copy the secret to clipboard
- list active and revoked keys
- revoke keys
- show active key count
- show revoked key count
- show last-used information when available
- explain how to use the key from SDK, MCP, and REST clients

Why this matters: the API has to know whose memory belongs to whom. Dashboard users log in with email. Agents use API keys. Every memory written by an agent is scoped to that authenticated workspace.

### Connect Page

The Connect page shows how real agents integrate with 0G-Mem.

It can:

- switch between SDK, MCP, and REST integration paths
- show install commands
- show copyable quick-start commands
- show minimal code snippets
- explain the runtime workflow:
  1. save memory
  2. fetch context
  3. review plan
  4. execute or stop
  5. record outcome
- show 0G mainnet proof registry status
- link to the API Keys page for credentials
- link to the live 0G checklist

### Email Login

The local hackathon auth flow supports email confirmation.

In dev mode, requesting login returns a confirmation link that can be opened immediately. After login, the dashboard can create API keys for agents. The API stores hashes of secrets, not raw API keys.

## What Agents Get

Agents can use 0G-Mem through three integration paths:

| Path | Best For | What It Does |
| --- | --- | --- |
| TypeScript SDK | Node or TypeScript agents | Direct memory, profile, context, review, outcome, learning, and proof calls |
| REST API | Python agents, workers, notebooks, hosted services | HTTP access with API-key workspace scoping |
| Streamable HTTP MCP | Claude, Codex, and LLM agents | One URL plus bearer-token tool calls for memory, review, outcome recording, and reflection |

## Product Boundary

0G-Mem is:

- an SDK for existing AI trading agents
- a memory layer for skills, strategies, policies, trades, and failures
- a safety layer around transaction plans
- a learning layer after failed or skipped execution
- a proof layer for decisions and reports
- an operator dashboard for visibility and access management

0G-Mem is not:

- a trading agent
- a strategy engine
- a copy-trading platform
- a wallet extension
- a leaderboard for other agents
- a mock bot
- a replacement for an agent's executor

## How It Works

```text
Existing Trading Agent
  |
  | 1. saves strategy, policy, skills, and prior outcomes
  v
0G-Mem Memory
  |
  | 2. retrieves context before a transaction plan
  v
Aegis Review
  |
  | 3. decodes calldata, checks policy, asks private compute for reasoning
  v
Decision
  |
  | ALLOW / WARN / BLOCK / REQUIRE_HUMAN
  v
Agent Executor or Human Review
  |
  | 4. records outcome, failures, and lessons
  v
0G-Mem Learning + Proofs
```

## Core Modules

| Module | Purpose |
| --- | --- |
| `ogmem.memory` | Add and search structured memories |
| `ogmem.context` | Retrieve relevant memories before a trade plan |
| `ogmem.profile` | Return stable agent profile plus dynamic context |
| `aegis.risk` | Review transaction plans before execution |
| `trades` | Record executed, failed, reverted, or skipped outcomes |
| `learning` | Reflect on failures and store lessons |
| `proofs` | Generate local proofs or anchor decisions on 0G Chain |
| `ZeroGMemApiClient` | Use the hosted/local API through agent API keys |
| `mcp` | Expose 0G-Mem as tools to LLM agents |
| `web` | Operator UI for dashboard, API keys, and connections |

## Memory Types

0G-Mem stores the kinds of context an autonomous trading agent needs before it touches money:

- `agent_profile`
- `skill`
- `strategy`
- `policy`
- `trade_plan`
- `executed_trade`
- `risk_report`
- `blocked_action`
- `failure_lesson`
- `human_feedback`
- `protocol_profile`

## Aegis Review

Aegis is the safety layer around a trading agent. It reviews a transaction plan and returns:

- `ALLOW`
- `WARN`
- `BLOCK`
- `REQUIRE_HUMAN`

Deterministic checks include:

- unlimited ERC20 approvals
- approval amount above policy
- unknown spender
- unknown recipient
- unknown protocol contract
- blocked calldata selector
- selector outside an allowlist
- native value above policy
- transaction batch size limit
- missing trusted protocol context
- repeated failure patterns through memory retrieval

The review also asks the compute layer for private reasoning when 0G Compute credentials are configured.

## How 0G Is Used

### 0G Storage

0G Storage is the intended durable memory layer for memory artifacts, policies, profiles, risk reports, outcomes, and failure lessons.

The SDK currently ships with:

- local in-memory storage
- JSON file storage
- optional 0G Storage adapter in `packages/sdk/src/storage-0g.ts`

Local/file mode keeps the hackathon demo easy to run. The storage adapter is where live 0G Storage credentials plug in.

### 0G Compute Router / Private Computer Direction

0G-Mem uses 0G Compute Router as the private reasoning interface when `OG_COMPUTE_API_KEY` is configured.

Used for:

- risk explanation during Aegis review
- failure reflection after a failed/reverted/skipped plan
- private reasoning over strategy, policy, transaction, and memory context

Honest status: this repo uses the Router-compatible compute integration today. It does not yet implement a deeper direct TEE-specific 0G Private Computer workflow beyond the Router abstraction.

### 0G Chain

0G Chain anchors compact proof records for risk decisions.

The deployed proof registry is:

```text
0xCbc3AE7d33c2F6E2600E0F9E3fE1610DD84E14A5
```

Deployment metadata:

```text
Chain ID: 16661
Tx:       0xffe1448b9e116124b316998633500027d4e299602e2072795e8990ea6ca0c013
Block:    36980011
```

Contract:

```text
contracts/AegisProofRegistry.sol
```

## Quick Start

### Requirements

- Node.js 22+
- npm
- Git

### Install

```bash
npm install
```

### Run API

```bash
npm run api:dev
```

Expected output:

```text
0G-Mem API listening on http://localhost:8787
0G proof registry enabled at 0xCbc3AE7d33c2F6E2600E0F9E3fE1610DD84E14A5
```

If port `8787` is already in use, the API is already running or another process owns the port.

### Run Website

```bash
npm run web:dev
```

Open:

```text
http://127.0.0.1:5173
```

Useful pages:

```text
http://127.0.0.1:5173/#dashboard
http://127.0.0.1:5173/#api-keys
http://127.0.0.1:5173/#connect
```

### Build and Test

```bash
npm run build
npm test
```

## Environment Variables

Create `.env` in the project root for live integrations. The file is ignored by git.

```env
OG_STORAGE_INDEXER_RPC=
OG_EVM_RPC=
OG_STORAGE_PRIVATE_KEY=

OG_COMPUTE_API_KEY=
OG_COMPUTE_BASE_URL=https://router-api.0g.ai/v1
OG_COMPUTE_MODEL=zai-org/GLM-5-FP8

AEGIS_REGISTRY_ADDRESS=0xCbc3AE7d33c2F6E2600E0F9E3fE1610DD84E14A5
OG_CHAIN_PRIVATE_KEY=

OG_MEM_APP_URL=http://127.0.0.1:5173
OG_MEM_API_MEMORY_PATH=.0g-mem/api-memory.json
OG_MEM_API_AUTH_PATH=.0g-mem/auth.json
```

## SDK Usage

```ts
import { ZeroGMem } from "@0g-mem/sdk";

const mem = new ZeroGMem();

await mem.memory.add({
  agentId: "agent-risk-03",
  kind: "policy",
  title: "Approval ceiling",
  content: {
    maxTokenApprovalAmount: "1000000000",
    trustedSpenders: ["0x1111111111111111111111111111111111111111"]
  },
  tags: ["policy", "approval"]
});

const context = await mem.context.forTradePlan({
  agentId: "agent-risk-03",
  intent: "Approve USDC before entering a vault",
  txs
});

const verdict = await mem.aegis.risk.reviewPlan({
  agentId: "agent-risk-03",
  intent: "Approve USDC before entering a vault",
  txs,
  context
});

if (verdict.decision !== "ALLOW") {
  throw new Error(verdict.reason);
}
```

## API Client Usage

Create an API key at `/#api-keys`, then use it from an agent runtime.

```ts
import { ZeroGMemApiClient } from "@0g-mem/sdk";

const client = new ZeroGMemApiClient({
  apiKey: process.env.OGMEM_API_KEY,
  baseUrl: "http://127.0.0.1:8787"
});

await client.memory.add({
  agentId: "agent-arb-01",
  kind: "strategy",
  title: "ETH/USDC rebalance rules",
  content: {
    maxTradeUsd: 500,
    maxSlippageBps: 75
  }
});

const review = await client.aegis.risk.reviewPlan({
  agentId: "agent-arb-01",
  intent: "Rebalance ETH/USDC",
  txs
});
```

## REST API

The API is available at `http://127.0.0.1:8787`.

Authenticated agent routes accept:

```text
Authorization: Bearer ogm_live_...
```

Routes:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health |
| `POST` | `/auth/request-login` | Create email confirmation link |
| `GET` | `/auth/verify?token=...` | Verify dashboard session |
| `GET` | `/auth/me` | Current dashboard user and API keys |
| `POST` | `/api-keys` | Create an API key |
| `DELETE` | `/api-keys/:id` | Revoke an API key |
| `POST` | `/memory` | Add memory |
| `GET` | `/memory?agentId=...` | Search/list memory |
| `GET` | `/profile?agentId=...` | Get agent profile |
| `POST` | `/context` | Retrieve context for a trade plan |
| `POST` | `/review-plan` | Run Aegis review and proof recording |
| `POST` | `/trades/outcome` | Record execution outcome |
| `POST` | `/learning/reflect` | Create a failure lesson |

## Streamable HTTP MCP

Run the API and the Streamable HTTP MCP server:

```bash
npm run api:dev
npm run mcp:http:dev
```

Local MCP URL:

```text
http://127.0.0.1:8788/mcp
```

Codex, Claude, or any Streamable HTTP MCP client should use:

```json
{
  "name": "0gmem",
  "type": "streamable-http",
  "url": "http://127.0.0.1:8788/mcp",
  "bearerTokenEnvVar": "OGMEM_API_KEY"
}
```

The bearer token is the agent API key created in the dashboard. The MCP server
expects `Authorization: Bearer <0G-Mem API key>` and writes to that authenticated
workspace.

For public demos, host the API/MCP backend and use its HTTPS endpoint:

```text
https://your-0gmem-api.example.com/mcp
```

Tools exposed:

| Tool | Purpose |
| --- | --- |
| `0gmem_add_memory` | Store policy, strategy, trade, feedback, protocol, risk, or lesson memory |
| `0gmem_get_profile` | Return stable profile plus recent dynamic memory |
| `0gmem_context_for_trade_plan` | Retrieve context before risk review |
| `aegis_review_plan` | Return ALLOW, WARN, BLOCK, or REQUIRE_HUMAN |
| `0gmem_record_outcome` | Record executed, failed, reverted, or skipped outcomes |
| `0gmem_reflect_failure` | Create a failure lesson from outcome and context |

## Demo Commands

```bash
npm run example:seed
npm run example:review
npm run example:review-file
npm run example:outcome
npm run example:flow
npm run api:smoke
```

Demo story:

1. Seed memory with strategy and policy.
2. Submit a risky transaction plan.
3. Retrieve relevant memory context.
4. Decode calldata.
5. Detect an unlimited approval to an unknown spender.
6. Return `BLOCK`.
7. Store the risk report.
8. Anchor proof on 0G Chain when chain credentials are configured.
9. Record outcome.
10. Reflect on failure and store a future lesson.

## Repository Structure

```text
contracts/
  AegisProofRegistry.sol
  deploy-aegis.mjs
  deployments/

docs/
  AGENT_CONNECTIONS.md
  LIVE_0G_CHECKLIST.md
  SUPERMEMORY_NOTES.md

packages/
  api/
    src/auth.ts
    src/index.ts
    src/server.ts
  mcp/
    src/server.ts
  sdk/
    src/api-client.ts
    src/client.ts
    src/compute.ts
    src/context.ts
    src/learning.ts
    src/memory.ts
    src/proofs.ts
    src/risk.ts
    src/storage-0g.ts
  web/
    src/App.tsx
    src/styles.css
```

## What Is Complete

- React landing page
- dashboard with real workspace data
- email login flow
- API key creation and revocation
- dedicated API Keys page
- memory bubble map
- manual memory capture
- SDK integration path
- REST API integration path
- MCP integration path
- API-key scoped workspace data
- Aegis risk review
- deterministic ERC20 calldata checks
- failure reflection
- local/file storage
- optional 0G Storage adapter
- 0G Compute Router client
- 0G Chain proof recorder
- mainnet proof registry deployment
- build and test suite

## Security Notes

- 0G-Mem does not execute trades.
- 0G-Mem does not custody funds.
- 0G-Mem does not require agent wallet private keys.
- API key secrets are shown once and stored as hashes.
- The chain proof wallet is only used by the API/server proof recorder.
- Agents should keep one key per runtime so access can be revoked cleanly.

## Hackathon Docs

- `SUBMISSION.md`: judge-facing summary
- `DEMO.md`: demo script
- `docs/AGENT_CONNECTIONS.md`: SDK, REST, and MCP integration guide
- `docs/LIVE_0G_CHECKLIST.md`: live credential checklist
- `docs/SUPERMEMORY_NOTES.md`: Supermemory inspiration notes and boundaries
