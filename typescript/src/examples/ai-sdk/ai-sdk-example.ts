import dotenv from 'dotenv';
import {streamText, Message} from 'ai';
import {openai} from '@ai-sdk/openai';
import EPOAPI from '../../shared/api';
import tools from '../../shared/tools';
import EPOTool from '../../ai-sdk/tool';
import 'web-streams-polyfill/polyfill';

// Load environment variables
dotenv.config();
console.log('Starting AI SDK example...');

// Check for required API keys
const EPO_CLIENT_ID = process.env.EPO_CLIENT_ID;
const EPO_CLIENT_SECRET = process.env.EPO_CLIENT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('Environment variables loaded');

if (!EPO_CLIENT_ID || !EPO_CLIENT_SECRET) {
  console.error(
    'Error: EPO API credentials not found in environment variables.'
  );
  console.error(
    'Please create a .env file with EPO_CLIENT_ID and EPO_CLIENT_SECRET.'
  );
  throw new Error('Missing EPO API credentials');
}

if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key not found in environment variables.');
  console.error('Please add OPENAI_API_KEY to your .env file.');
  throw new Error('Missing OpenAI API key');
}

async function runExample() {
  try {
    console.log('Initializing EPO API client...');
    // Initialize the EPO API client
    const epoAPI = new EPOAPI(
      EPO_CLIENT_ID as string,
      EPO_CLIENT_SECRET as string,
      {
        // Optional context configuration
        outputDir: './output',
      }
    );

    console.log('Getting tool definitions...');
    // Get the tool definitions
    const toolDefinitions = tools();
    console.log(`Found ${toolDefinitions.length} tool definitions`);

    console.log('Creating AI SDK-compatible tools...');
    // Create AI SDK-compatible tools from the definitions
    const aiTools = toolDefinitions.reduce(
      (acc, tool) => {
        acc[tool.name] = EPOTool(
          epoAPI,
          tool.method,
          tool.description,
          tool.parameters
        );
        return acc;
      },
      {} as Record<string, any>
    );
    console.log('Tools created successfully');
    
    console.log('Tool names available:', Object.keys(aiTools));

    // Define a simple prompt with direct tool call instructions
    const messages: Omit<Message, 'id'>[] = [
      {
        role: 'system',
        content:
          'You are a helpful patent assistant that helps researchers find patent information. Use the provided tools to search for patent information and provide detailed responses.',
      },
      {
        role: 'user',
        content:
          'Search for patents related to artificial intelligence from IBM using the "Search Published Patent Documents" tool.',
      },
    ];

    console.log('Making API call to OpenAI...');
    console.log(`Node.js version: ${process.version}`);
    
    // Modify the prompt to increase chances of tool usage
    console.log('Using streamText with simplest options and direct tool instructions...');
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages,
      tools: aiTools,
      temperature: 0.7,
    });
    
    console.log('API call completed');
    console.log('Result properties:', Object.keys(result));

    // Process the stream
    console.log('\nAI Response streaming:');
    let fullText = '';
    
    try {
      // Access the text stream directly
      if (result.textStream) {
        const textStream = result.textStream;
        for await (const chunk of textStream) {
          process.stdout.write(chunk);
          fullText += chunk;
        }
        console.log('\n');
        console.log('Full text length:', fullText.length);
      } else {
        console.error('No textStream available in result');
      }
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
    }

    console.log('\nExample completed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
runExample();
