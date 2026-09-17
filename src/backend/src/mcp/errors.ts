import { CallToolResult } from '@modelcontextprotocol/server';
import { HttpException } from '../utils/errors.utils.js';

/**
 * Serializes a tool result.
 * @param value the value to return to the model
 */
export const toolJson = (value: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value) }]
});

/**
 * Runs a tool handler, turning failures into tool errors the model can read and recover from
 * rather than protocol errors it never sees.
 *
 * Expected failures (a bad WBS number, a missing project) carry their message plus a hint telling
 * the model how to get valid input. Anything unexpected is logged and reported generically, so
 * database internals never reach the model or the user.
 *
 * @param recoveryHint what the model should try next when the call fails for an expected reason
 * @param run the handler to execute
 */
export const withToolErrors = async (recoveryHint: string, run: () => Promise<unknown>): Promise<CallToolResult> => {
  try {
    return toolJson(await run());
  } catch (error: unknown) {
    if (error instanceof HttpException) {
      // punctuate before the hint so the two sentences do not run together for the model
      const message = /[.!?]$/.test(error.message) ? error.message : `${error.message}.`;

      return {
        content: [{ type: 'text', text: `${message} ${recoveryHint}`.trim() }],
        isError: true
      };
    }

    console.error('[mcp] unexpected tool failure:', error);

    return {
      content: [{ type: 'text', text: 'FinishLine failed to handle this request. Report this to the software team.' }],
      isError: true
    };
  }
};
