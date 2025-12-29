import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "mcp-ts-demo",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const SayHelloSchema = z.object({
  name: z.string().min(1, "name is required"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "say_hello",
        description: "Say hello to a person",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments ?? {};

  if (toolName === "say_hello") {
    const parsed = SayHelloSchema.safeParse(args);

    if (!parsed.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Invalid arguments: ${parsed.error.issues
              .map((i) => i.message)
              .join(", ")}`,
          },
        ],
      };
    }

    const { name } = parsed.data;

    return {
      content: [
        {
          type: "text",
          text: `Hello ${name}.`,
        },
      ],
    };
  }

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `Unknown tool: ${toolName}`,
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
