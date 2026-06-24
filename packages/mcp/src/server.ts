#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { create0GMemMcpServer } from "./create-server.js";

const server = create0GMemMcpServer({
  allowLocalFallback: true,
  apiBaseUrl:
    process.env.OGMEM_API_URL ??
    process.env.OG_MEM_API_URL ??
    "http://127.0.0.1:8787",
  apiKey: process.env.OGMEM_API_KEY ?? process.env.OG_MEM_API_KEY,
  memoryPath: process.env.OG_MEM_MCP_MEMORY_PATH ?? ".0g-mem/mcp-memory.json"
});

const transport = new StdioServerTransport();
await server.connect(transport);
