import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { EPOAgentToolkit } from '../../ai-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting classification analysis example...");
  
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
          role: 'system',
          content: 'You are ClassificationGPT, an AI assistant specialized in analyzing patent classifications and helping researchers understand technology domains.'
        },
        { 
          role: 'user', 
          content: `I need to understand artificial intelligence patent classifications.
          
          1. What are the main IPC classifications for AI and machine learning patents?
          2. Can you convert IPC classification G06N 20/00 to its CPC equivalent and explain what it represents?
          3. Find some recent patents in the G06N 20/00 classification from Google.
          4. How has patenting activity in AI classifications changed in the last 5 years?` 
        }
      ],
      tools,
      maxSteps: 6 // Allow multiple tool calls
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
