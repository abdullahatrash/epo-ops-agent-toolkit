import {tool} from 'ai';
import {z} from 'zod';
import EPOAPI, {EPOError} from '../shared/api';

/**
 * Creates a tool compatible with the Vercel AI SDK to interact with the EPO OPS API
 * @param epoAPI The EPO API client instance
 * @param method The method name to run
 * @param description A description of what the tool does
 * @param schema The zod schema defining the parameters
 * @returns A tool compatible with Vercel AI SDK
 */
export default function EPOTool(
  epoAPI: EPOAPI,
  method: string,
  description: string,
  schema: z.ZodObject<any, any, any, any, {[x: string]: any}>
) {
  return tool({
    description,
    parameters: schema,
    execute: async (params, {toolCallId}) => {
      try {
        const result = await epoAPI.run(method, params);

        // For most API responses, return the data property
        if (result && result.data) {
          // Formatting the response to be more agent-friendly
          const formattedData =
            typeof result.data === 'object'
              ? JSON.stringify(result.data, null, 2)
              : result.data;

          return {
            data: formattedData,
            headers: {
              throttlingStatus: result.headers?.['x-throttling-control'],
              quotaUsage: {
                individual: result.headers?.['x-individualquotaperhour-used'],
                registered: result.headers?.['x-registeredquotaperweek-used'],
              },
            },
          };
        }

        // For downloadImage which returns a custom object
        return result;
      } catch (error: any) {
        if (error instanceof EPOError) {
          return {
            error: error.message,
            statusCode: error.statusCode,
            details: error.responseData,
          };
        }
        return {error: `Error: ${error.message || 'Unknown error'}`};
      }
    },
  });
}
