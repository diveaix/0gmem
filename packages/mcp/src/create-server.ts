import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  JsonFileStorage,
  ZeroGMem,
  ZeroGMemApiClient,
  memoryInputSchema,
  tradePlanSchema,
  type MemoryInput,
  type TradePlan
} from "@0g-mem/sdk";

export type Create0GMemMcpServerOptions = {
  apiBaseUrl?: string;
  apiKey?: string;
  allowLocalFallback?: boolean;
  memoryPath?: string;
};

export function create0GMemMcpServer(options: Create0GMemMcpServerOptions = {}) {
  const sdk = options.allowLocalFallback
    ? new ZeroGMem(
        {},
        new JsonFileStorage(options.memoryPath ?? ".0g-mem/mcp-memory.json")
      )
    : undefined;
  const apiClient = options.apiKey
    ? new ZeroGMemApiClient({
        apiKey: options.apiKey,
        baseUrl: options.apiBaseUrl ?? "http://127.0.0.1:8787"
      })
    : undefined;

  const server = new McpServer({
    name: "0g-mem",
    version: "0.1.0"
  });

  server.tool(
    "0gmem_add_memory",
    "Store policy, strategy, trade, feedback, protocol, risk, or lesson memory for an agent.",
    memoryInputSchema.shape,
    async (input: MemoryInput) => {
      const memory = apiClient
        ? await apiClient.memory.add(input)
        : await requireLocalSdk(sdk).ogmem.memory.add(input);
      return jsonResult({ memory });
    }
  );

  server.tool(
    "0gmem_get_profile",
    "Return stable agent profile memory plus recent dynamic memory and optional search results.",
    {
      agentId: z.string().min(1),
      query: z.string().optional(),
      limit: z.number().int().positive().max(50).optional()
    },
    async (input: { agentId: string; query?: string; limit?: number }) => {
      const profile = apiClient
        ? await apiClient.profile.get(input)
        : await requireLocalSdk(sdk).ogmem.profile.get(input);
      return jsonResult({ profile });
    }
  );

  server.tool(
    "0gmem_context_for_trade_plan",
    "Retrieve relevant context for a transaction plan before risk review.",
    tradePlanSchema.shape,
    async (input: TradePlan) => {
      const context = apiClient
        ? await apiClient.context.forTradePlan(input)
        : await requireLocalSdk(sdk).ogmem.context.forTradePlan(input);
      return jsonResult({ context });
    }
  );

  server.tool(
    "aegis_review_plan",
    "Review a transaction plan and return ALLOW, WARN, BLOCK, or REQUIRE_HUMAN.",
    tradePlanSchema.shape,
    async (input) => {
      if (apiClient) {
        const review = await apiClient.aegis.risk.reviewPlan(input);
        return jsonResult(review);
      }

      const localSdk = requireLocalSdk(sdk);
      const context = await localSdk.ogmem.context.forTradePlan(input);
      const verdict = await localSdk.aegis.risk.reviewPlan({ ...input, context });
      const proof = await localSdk.proofs.recordDecision({
        agentId: input.agentId,
        planHash: verdict.planHash,
        reportHash: verdict.reportHash,
        decision: verdict.decision
      });
      return jsonResult({ context, verdict, proof });
    }
  );

  server.tool(
    "0gmem_record_outcome",
    "Record what happened after a transaction plan was executed, failed, reverted, or skipped.",
    {
      agentId: z.string().min(1),
      planId: z.string().min(1),
      txHashes: z.array(z.string()).default([]),
      status: z.enum(["executed", "failed", "reverted", "skipped"]),
      pnlUsd: z.number().optional(),
      reason: z.string().optional(),
      notes: z.string().optional()
    },
    async (input) => {
      const outcome = apiClient
        ? await apiClient.trades.recordOutcome(input)
        : await requireLocalSdk(sdk).trades.recordOutcome(input);
      return jsonResult({ outcome });
    }
  );

  server.tool(
    "0gmem_reflect_failure",
    "Create a failure lesson for a plan using stored outcome and context memory.",
    {
      agentId: z.string().min(1),
      planId: z.string().min(1)
    },
    async (input) => {
      const lesson = apiClient
        ? await apiClient.learning.reflect(input)
        : await requireLocalSdk(sdk).learning.reflect(input);
      return jsonResult({ lesson });
    }
  );

  return server;
}

function requireLocalSdk(sdk: ZeroGMem | undefined) {
  if (!sdk) {
    throw new Error(
      "0G-Mem MCP requires an API key. Set OGMEM_API_KEY or pass a Bearer token."
    );
  }
  return sdk;
}

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}
