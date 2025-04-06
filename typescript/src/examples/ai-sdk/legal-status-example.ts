import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { EPOAgentToolkit } from '../../ai-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting legal status and citations example...");
  
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
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: 'You are PatentAnalyst, an AI assistant specialized in providing detailed patent information including legal status, citations, and classification analysis.'
        },
        { 
          role: 'user', 
          content: `I'm interested in Tesla's US10222397 patent on battery management systems.
          1. What is the current legal status of this patent?
          2. Are there any related patents in the same family?
          3. What other patents cite this patent?
          4. What classification does this patent fall under and what does that classification represent?` 
        }
      ],
      tools,
      maxSteps: 7 // Increase steps to allow for multiple tool calls
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
