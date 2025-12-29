import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Claude Desktop expects clean JSON-RPC on stdout.
 * Never console.log to stdout. Use console.error only if needed.
 */

process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err);
  process.exit(1);
});

const server = new McpServer({
  name: "mcp-ts-demo",
  version: "1.0.0",
});

server.tool(
  "say_hello",
  "Say hello to a person",
  { name: z.string().min(1) },
  async ({ name }) => {
    return {
      content: [{ type: "text", text: `Hello ${name}.` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
