import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { EPOAgentToolkit } from '../../ai-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting patent family analysis example...");
  
  try {
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
          content: 'You are PatentGPT, a patent intelligence assistant. Analyze patent families and provide insights about how technologies are protected across different jurisdictions.'
        },
        { 
          role: 'user', 
          content: `I'm interested in understanding the patent family for Tesla's battery technology. 
          Can you find a significant Tesla battery patent and analyze its family members across different countries? 
          I'd like to know where they've sought protection and any notable differences in claims.`
        }
      ],
      tools,
      maxSteps: 5 // Allow multiple steps for a complete analysis
    });
    
    console.log("\n--- FINAL RESULT ---");
    console.log(result.text);
    
    // Log the tool calls for debugging
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
