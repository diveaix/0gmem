#!/usr/bin/env node
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { create0GMemMcpServer } from "./create-server.js";

type McpHttpRequest = IncomingMessage & { body?: unknown };
type McpHttpResponse = ServerResponse;

const port = Number(process.env.PORT ?? process.env.OG_MEM_MCP_HTTP_PORT ?? "8788");
const apiBaseUrl =
  process.env.OGMEM_API_URL ??
  process.env.OG_MEM_API_URL ??
  "http://127.0.0.1:8787";

const app = createMcpExpressApp();

app.options("/mcp", (_req: McpHttpRequest, res: McpHttpResponse) => {
  setCorsHeaders(res);
  res.writeHead(204).end();
});

app.post("/mcp", async (req: McpHttpRequest, res: McpHttpResponse) => {
  setCorsHeaders(res);
  const apiKey = readBearerToken(req) ?? process.env.OGMEM_API_KEY ?? process.env.OG_MEM_API_KEY;

  if (!apiKey) {
    sendJsonRpcError(res, 401, -32001, "Missing bearer token. Use an 0G-Mem API key.");
    return;
  }

  const server = create0GMemMcpServer({
    apiBaseUrl,
    apiKey,
    allowLocalFallback: false
  });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error("Error handling 0G-Mem MCP request:", error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, -32603, "Internal server error");
    }
  }
});

app.get("/mcp", (_req: McpHttpRequest, res: McpHttpResponse) => {
  setCorsHeaders(res);
  sendJsonRpcError(res, 405, -32000, "Method not allowed.");
});

app.delete("/mcp", (_req: McpHttpRequest, res: McpHttpResponse) => {
  setCorsHeaders(res);
  sendJsonRpcError(res, 405, -32000, "Method not allowed.");
});

app.get("/health", (_req: McpHttpRequest, res: McpHttpResponse) => {
  setCorsHeaders(res);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "0g-mem-mcp-http", transport: "streamable-http" }));
});

app.listen(port, (error?: Error) => {
  if (error) {
    console.error("Failed to start 0G-Mem MCP HTTP server:", error);
    process.exit(1);
  }
  console.log(`0G-Mem Streamable HTTP MCP listening on http://127.0.0.1:${port}/mcp`);
});

function readBearerToken(req: IncomingMessage) {
  const value = req.headers.authorization;
  if (!value?.startsWith("Bearer ")) return undefined;
  return value.slice("Bearer ".length).trim();
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

function sendJsonRpcError(
  res: ServerResponse,
  httpStatus: number,
  code: number,
  message: string
) {
  res.writeHead(httpStatus, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code, message },
    id: null
  }));
}
