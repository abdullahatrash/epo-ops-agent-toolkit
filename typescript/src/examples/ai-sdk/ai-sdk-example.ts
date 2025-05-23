import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { EPOAgentToolkit } from '../../ai-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting example...");
  
  try {
    console.log("EPO Credentials present:", 
      !!process.env.EPO_CLIENT_ID, 
      !!process.env.EPO_CLIENT_SECRET
    );
    
    const epoToolkit = new EPOAgentToolkit({
      key: process.env.EPO_CLIENT_ID!,
      secret: process.env.EPO_CLIENT_SECRET!,
    });
    console.log("Toolkit initialized");
    
    const tools = epoToolkit.getTools();
    console.log("Available tools:", Object.keys(tools));
    
    console.log("Calling generateText...");
    const result = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { 
          role: 'user', 
          content: 'What patents does IBM have related to quantum computing? Show me the most recent ones.' 
        }
      ],
      tools,
      maxSteps: 3
    });
    
    console.log("\n--- FINAL RESULT ---");
    console.log(result.text);
    
    // Log any tool calls that were made
    if (result.steps.length > 0) {
      console.log("\n--- TOOL CALLS ---");
      result.steps.forEach((step, i) => {
        console.log(`Step ${i+1}:`);
        step.toolCalls.forEach(call => {
          console.log(`- Tool: ${call.toolName}`);
          console.log(`  Args: ${JSON.stringify(call.args)}`);
        });
      });
    }
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

main().catch(console.error);
