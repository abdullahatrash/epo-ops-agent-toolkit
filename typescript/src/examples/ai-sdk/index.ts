import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
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
		const result = streamText({
			model: openai('gpt-4-turbo'),
			messages,
			stream: true,
			tools: epoToolkit.getTools(),
		})

		return result.toDataStreamResponse()
	} catch (error: any) {
		console.error('Error processing request:', error)
		return new Response(
			JSON.stringify({ error: error.message || 'An error occurred' }),
			{ status: 500 }
		)
	}
}
