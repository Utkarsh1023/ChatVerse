/**
 * Standard success envelope used by every controller.
 *
 * The `data` payload is spread at the top level so responses are
 * frontend-friendly — e.g. `new ApiResponse(200, "Profile fetched", { user })`
 * serialises to:
 *
 *   { success: true, statusCode: 200, message: "Profile fetched", user }
 *
 * This lets the React app read `res.data.user`, `res.data.stats`, etc.
 * directly, without an extra `data` nesting level.
 */
export default class ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly success = true;

  constructor(
    readonly statusCode: number,
    readonly message: string,
    readonly data: T | null = null
  ) {}

  toJSON(): { success: true; statusCode: number; message: string } & T {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.data ?? ({} as T)),
    };
  }
}

