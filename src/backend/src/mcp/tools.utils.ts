import { Organization } from '@prisma/client';
import { CallToolResult, McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { User } from 'shared';

/** The authenticated caller a server instance is built for. */
export interface AgentContext {
  user: User;
  organization: Organization;
}

/**
 * Registers every tool for one domain. Each *.tools.ts file exports one of these, and buildMcpServer
 * calls them all.
 */
export type ToolRegistrar = (server: McpServer, context: AgentContext) => void;

interface ToolConfig<Shape extends z.ZodRawShape> {
  title: string;
  description: string;
  inputSchema: z.ZodObject<Shape>;
}

type ToolHandler<Shape extends z.ZodRawShape> = (args: z.infer<z.ZodObject<Shape>>) => Promise<CallToolResult>;

/**
 * Registers a read only tool.
 *
 * Every tool that only reads goes through here, and readOnlyHint is set in one place rather than per
 * tool. Tools that change data go through registerWriteTool instead.
 *
 * @param server the server to register on
 * @param name the tool name the model calls
 * @param config the tool's title, description, and input schema
 * @param handler the tool implementation
 */
export const registerReadOnlyTool = <Shape extends z.ZodRawShape>(
  server: McpServer,
  name: string,
  config: ToolConfig<Shape>,
  handler: ToolHandler<Shape>
): void => {
  server.registerTool(name, { ...config, annotations: { readOnlyHint: true } }, handler);
};

/**
 * Registers a tool that changes data.
 *
 * Writes go through their own function rather than an option on registerReadOnlyTool, so that a tool
 * which writes is visible as one at the call site. The handler should call the same service the HTTP
 * route uses, passing the caller from the API token, so the service's permission checks apply
 * exactly as they do in the app. Only the input validation is separate: it is written in zod here
 * because the model needs a JSON schema with field descriptions, which express-validator cannot give.
 *
 * @param server the server to register on
 * @param name the tool name the model calls
 * @param config the tool's title, description, and input schema
 * @param effect destructive is true when the tool deletes or overwrites data rather than only adding it
 * @param handler the tool implementation
 */
export const registerWriteTool = <Shape extends z.ZodRawShape>(
  server: McpServer,
  name: string,
  config: ToolConfig<Shape>,
  effect: { destructive: boolean },
  handler: ToolHandler<Shape>
): void => {
  server.registerTool(
    name,
    { ...config, annotations: { readOnlyHint: false, destructiveHint: effect.destructive } },
    handler
  );
};

/**
 * Shared explanation of WBS numbering. The model has no prior knowledge of this scheme, and the
 * tool description is the only place it can learn it.
 */
const WBS_NUM_DESCRIPTION =
  'A project WBS number, formatted "car.project.work_package" — for example "1.2.0". The third component is ' +
  'always 0 for a project; something like "1.2.3" is a work package inside that project, not a ' +
  'project, and will be rejected. Get valid numbers from finishline_list_projects.';

/** The recovery hint for any tool that takes a project WBS number. */
export const LIST_PROJECTS_HINT = 'Call finishline_list_projects to see the valid WBS numbers.';

/**
 * The shape a WBS number has to have. The caller here is a model turning free text into arguments,
 * so it will happily send "1.2" or the project's name. Enforcing the shape in the schema means the
 * framework rejects those with a validation error naming the field, which the model can act on,
 * rather than the string reaching the service. validateWBS parses each section with parseInt, so
 * without this something like "1abc.2.0" would be quietly read as 1.2.0 instead of refused.
 */
export const wbsNumSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'WBS number must be three numbers separated by dots, like "1.2.0"')
  .describe(WBS_NUM_DESCRIPTION);

/**
 * A date string, accepted the same way the HTTP routes' isDate validator accepts one. Same reasoning
 * as the WBS number: a model will send "next Monday" if the schema lets it, and an unparseable date
 * is far cheaper to reject here than downstream.
 * @param description what the date means, for the model
 */
export const dateSchema = (description: string) =>
  z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), 'Must be an ISO date or date-time, such as "2026-09-01T00:00:00Z".')
    .describe(description);

/**
 * The offset into a paged list. Only the tools whose lists can outgrow a page take one; the response
 * carries a nextOffset to feed back in, so the model never has to work the arithmetic out.
 * @param items what is being paged, for the model
 */
export const offsetSchema = (items: string) =>
  z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      `How many ${items} to skip. Omit this for the first page, then pass the nextOffset from the ` +
        'previous response to get the next one. A response with no nextOffset is the last page.'
    );
