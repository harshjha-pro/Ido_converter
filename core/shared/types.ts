export interface ToolResult<T = string> {
  ok: boolean;
  output?: T;
  meta?: Record<string, unknown>;
  error?: string;
}

export type ToolRunFunction = (input: string, options?: object) => ToolResult;
