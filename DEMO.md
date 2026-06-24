# 0G-Mem Demo Script

## Setup

```bash
npm install
npm run build
npm test
```

Start the website:

```bash
npm run web:dev
```

Open:

```text
http://127.0.0.1:5173
```

Optional, for the dashboard review button to call the real local API:

```bash
npm run api:dev
```

## 2-3 Minute Flow

### 1. Frame The Product

Say:

0G-Mem is not a trading agent. It is the memory, safety, learning, and proof SDK that trading agents call before and after execution.

### 2. Seed Agent Memory

```bash
npm run example:seed
```

What this proves:

- an external agent can store policy and strategy memory
- local file mode works across separate runs
- the memory schema supports policies, strategies, skills, trades, and lessons

### 3. Review A Risky Plan

```bash
npm run example:review-file
```

Point out:

- the transaction is a real EVM-style transaction object
- calldata is decoded as `approve(address,uint256)`
- Aegis blocks unlimited approval to an unknown spender
- the verdict includes deterministic findings, matched memories, private reasoning, decoded transactions, and proof hashes

### 4. Show Failure Learning

```bash
npm run example:outcome
```

Point out:

- the SDK records what happened after execution
- a failure lesson is generated and stored as memory
- future reviews can retrieve that lesson before the agent acts again

### 5. Show Non-TypeScript Integration

```bash
npm run api:smoke
```

Point out:

- Python agents, hosted agents, or local automation can call the HTTP adapter
- `/profile`, `/context`, and `/review-plan` map cleanly to agent pre-action workflows
- the SDK remains the core product
- REST and Streamable HTTP MCP expose the same primitives to non-TypeScript agents

### 6. Show MCP Integration

```bash
npm run mcp:http:dev
```

Point out:

- LLM agents can call 0G-Mem through one Streamable HTTP URL instead of importing TypeScript
- the MCP server uses the same SDK under the hood
- clients pass the agent API key as a bearer token
- available tools include memory, profile, context, review, outcome, and reflection

### 7. Show The Website

Open the landing page and dashboard:

```text
http://127.0.0.1:5173
```

Point out:

- the first screen states the real product boundary
- generated imagery makes the memory and proof layer concrete
- the dashboard can call the local REST API when `npm run api:dev` is running
- the connect view gives SDK, REST, and MCP paths for real agents

## Expected Judge Takeaway

Trading agents do not need another demo bot. They need infrastructure that makes existing agents safer, more persistent, and auditable.

0G-Mem uses 0G where it matters:

- 0G Storage for persistent decentralized memory
- 0G Compute Router / Private Computer for private risk reasoning
- 0G Chain for verifiable decision proofs
- SDK, REST, and MCP so agents can connect from different runtimes

## Live 0G Add-On

If credentials are available, switch from local mode to live 0G mode using `.env.example` and `docs/LIVE_0G_CHECKLIST.md`.
