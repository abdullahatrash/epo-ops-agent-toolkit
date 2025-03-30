# EPO OPS Agent Toolkit

A toolkit for interacting with the European Patent Office (EPO) Open Patent Services (OPS) API, using the Vercel AI SDK for LLM integration.

## Setup

1. Install dependencies:
   ```
   npm install
   # or
   pnpm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your EPO OPS API credentials (from [https://developers.epo.org/](https://developers.epo.org/))
   - Add your OpenAI API key

3. Build the toolkit:
   ```
   npm run build
   # or
   pnpm run build
   ```

## Usage

### Direct API Usage

See the example in `usage/index.ts` for direct API usage without AI integration.

### Vercel AI SDK Integration

Check out `usage/ai-sdk-example.ts` for an example of using the toolkit with the Vercel AI SDK.

To run the AI SDK example:

```
npx ts-node usage/ai-sdk-example.ts
```

This example:
1. Creates tools from the EPO OPS API client
2. Uses the Vercel AI SDK to make LLM calls with tool calling capabilities
3. Demonstrates how to access and process tool call results

## Available Tools

The toolkit provides the following tools:

1. **Search Published Patent Documents** - Search for patents using Common Query Language
2. **Retrieve Patent Document Data** - Get bibliographic data, claims, description, or images
3. **Retrieve Patent Family Information** - Find related patents in the same family
4. **Download Patent Document Image** - Download patent images in various formats
5. **Convert Patent Number Format** - Convert between different patent number formats

## License

MIT 
