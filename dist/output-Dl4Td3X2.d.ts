type OutputLevel = "status" | "info" | "warn" | "error" | "debug";
type OutputSink = (level: OutputLevel, message: string) => void;
/** Attach the host's sink; buffered boot lines are replayed into it. */
declare function setOutputSink(next: OutputSink | null): void;
/** Lift debug-level output into the sink (the `--debug` flag / dev builds). */
declare function setDebugEnabled(enabled: boolean): void;
/** The buffered tail of everything emitted so far, oldest first. */
declare function recentLogs(): readonly {
  level: OutputLevel;
  message: string;
}[];
/** A normal progress/state line ("Stage generated", "Service worker ready"). */
declare function status(message: string): void;
/** Supplementary detail a user only reads when digging. */
declare function info(message: string): void;
/** Something odd but recoverable — the game continues. */
declare function warn(message: string): void;
/** A failure the player or developer should know about. */
declare function error(message: string): void;
/** A section marker used to group related lines in the log stream. */
declare function header(message: string): void;
/** Development-only detail; dropped unless `setDebugEnabled(true)` ran. */
declare function debug(message: string): void;

type output_OutputLevel = OutputLevel;
type output_OutputSink = OutputSink;
declare const output_debug: typeof debug;
declare const output_error: typeof error;
declare const output_header: typeof header;
declare const output_info: typeof info;
declare const output_recentLogs: typeof recentLogs;
declare const output_setDebugEnabled: typeof setDebugEnabled;
declare const output_setOutputSink: typeof setOutputSink;
declare const output_status: typeof status;
declare const output_warn: typeof warn;
declare namespace output {
  export {
    type output_OutputLevel as OutputLevel,
    type output_OutputSink as OutputSink,
    output_debug as debug,
    output_error as error,
    output_header as header,
    output_info as info,
    output_recentLogs as recentLogs,
    output_setDebugEnabled as setDebugEnabled,
    output_setOutputSink as setOutputSink,
    output_status as status,
    output_warn as warn,
  };
}

export {
  type OutputLevel as O,
  type OutputSink as a,
  setOutputSink as b,
  status as c,
  debug as d,
  error as e,
  header as h,
  info as i,
  output as o,
  recentLogs as r,
  setDebugEnabled as s,
  warn as w,
};
