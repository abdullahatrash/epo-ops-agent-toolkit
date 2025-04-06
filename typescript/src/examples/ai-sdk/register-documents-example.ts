import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { EPOAgentToolkit } from '../../ai-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting register documents and procedural history example...");
  
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
          content: 'You are ProcedureGPT, an AI assistant specialized in analyzing patent prosecution history and procedural events. Provide insights into the examination process and timeline of patents.'
        },
        { 
          role: 'user', 
          content: `I need to understand the prosecution history of EP2695321, which is an important 5G wireless patent.
          
          1. What was the timeline of this patent's examination?
          2. Were there any objections raised during examination and how were they addressed?
          3. What documents were filed during prosecution?
          4. Check if there were any opposition proceedings.
          5. Has this patent been granted, and if so, when?` 
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
