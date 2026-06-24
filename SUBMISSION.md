# 0G-Mem SDK Hackathon Submission

## One-Liner

0G-Mem is a decentralized memory, risk, learning, and proof SDK for autonomous trading agents that already have their own strategy and execution systems.

## What We Built

0G-Mem gives trading agents the missing infrastructure around execution:

- persistent operational memory for skills, strategies, policies, trades, failures, feedback, and protocol profiles
- Aegis pre-execution risk review for transaction plans
- EVM calldata decoding for common ERC20 approvals and transfers
- private reasoning hooks through 0G Compute Router / 0G Private Computer
- failure reflection that stores future lessons without silently loosening policy
- proof hash recording for 0G Chain
- HTTP adapter for non-TypeScript agents
- MCP server for LLM agent clients
- landing page and operator dashboard for the hackathon demo
- local file mode for demos and 0G adapters for live infrastructure

This is not a trading agent, copy-trading product, leaderboard, or mock bot. The product boundary is the SDK that other agents call.

## Why It Matters

Autonomous trading agents can produce technically valid transactions that are still unsafe for the owner, current strategy, or recent failure history. The missing layer is not more alpha. It is memory, safety, learning, and auditability.

0G-Mem lets an agent ask:

1. What am I allowed to do?
2. What went wrong before?
3. Does this transaction plan violate policy?
4. Should I execute, warn, block, or ask a human?
5. Can the owner later verify what I saw and decided?

## How 0G Is Used

### 0G Storage

0G Storage is the source of truth for memory objects and risk reports. The SDK ships with local and file-backed storage for development, plus an optional `ZeroGStorageAdapter` that uploads JSON memory artifacts through the official 0G Storage SDK.

Source: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk

### 0G Compute Router / Private Computer

0G Compute is used for private risk explanations and failure reflections. The Router is OpenAI-compatible, which keeps the SDK integration simple for agent developers. The current docs list the mainnet Router endpoint as `https://router-api.0g.ai/v1` and show `zai-org/GLM-5-FP8` in the quickstart.

Sources:

- https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview
- https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart

### 0G Chain

0G Chain anchors compact proof records for plan hashes, report hashes, decisions, and actor identity. The Solidity proof registry is in `contracts/AegisProofRegistry.sol`. The live deployment checklist uses 0G Galileo testnet chain ID `16602` and mainnet chain ID `16661`, matching the current contract deployment docs.

Source: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts

## Supermemory Check

We inspected Supermemory because its API ergonomics are strong: `add`, `profile`, hybrid search, local mode, MCP tools, and one-call context retrieval. 0G-Mem borrows that developer shape, not the brand or consumer product.

What we adopted:

- one-call `profile.get()` for stable agent profile plus recent dynamic context
- SDK-first API with optional HTTP adapter
- local mode for fast development
- MCP-friendly primitives for future agent clients

What we intentionally did not copy:

- consumer personal memory app
- general connector platform
- Supermemory UI/brand
- unrelated document ingestion features

Source: https://github.com/supermemoryai/supermemory

## Demo Commands

Install and verify:

```bash
npm install
npm run build
npm test
```

Run the main demo flow:

```bash
npm run example:flow
```

Run the HTTP adapter smoke demo:

```bash
npm run api:smoke
```

Run the website:

```bash
npm run web:dev
```

Run the Streamable HTTP MCP server:

```bash
npm run mcp:http:dev
```

Run individual demo steps:

```bash
npm run example:seed
npm run example:review-file
npm run example:outcome
```

## Demo Story

1. Seed the agent with policy and strategy memory.
2. Submit a risky transaction plan from an external trading agent client.
3. 0G-Mem retrieves relevant context.
4. Aegis decodes the calldata and detects an unlimited approval to an unknown spender.
5. The SDK returns `BLOCK`, stores a risk report, and records a proof hash.
6. A failed outcome can be recorded later, producing a reusable failure lesson.

## Current MVP Status

Done:

- TypeScript monorepo
- SDK facade with separate modules in one package
- local/file memory storage
- optional 0G Storage adapter
- 0G Compute Router compatible client
- Aegis risk review
- EVM calldata decoder
- trade outcome recording
- failure learning
- local and 0G Chain proof recorders
- HTTP adapter
- MCP server
- landing page and operator dashboard
- examples
- tests
- contract source

Live steps that require credentials:

- 0G Storage upload with funded private key
- 0G Compute Router call with `sk-` API key and balance
- 0G Chain proof registry deployment

See `docs/LIVE_0G_CHECKLIST.md`.
