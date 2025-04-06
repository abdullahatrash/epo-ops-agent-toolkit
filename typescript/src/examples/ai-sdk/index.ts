import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { EPOAgentToolkit } from '../../ai-sdk'

// Initialize the EPO toolkit with your credentials
const epoToolkit = new EPOAgentToolkit({
	key: process.env.EPO_CLIENT_ID!,
	secret: process.env.EPO_CLIENT_SECRET!,
	configuration: {
		// Optional filtering of available tools
		allowedTools: ['publishedDataSearch', 'publishedData', 'family'],
	},
})

export async function POST(req: Request) {
	const { messages } = await req.json()

	// Log the request
	console.log(
		'Processing request with messages:',
		messages.map((m: any) => ({
			role: m.role,
			content: m.content.substring(0, 100) + '...',
		}))
	)

	try {
		const result = await generateText({
			model: openai('gpt-4-turbo'),
			messages,
			tools: epoToolkit.getTools(),
			maxSteps: 5
		})

		return new Response(JSON.stringify({ 
			text: result.text,
			steps: result.steps
		}), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error: any) {
		console.error('Error processing request:', error)
		return new Response(
			JSON.stringify({ error: error.message || 'An error occurred' }),
			{ status: 500 }
		)
	}
}
