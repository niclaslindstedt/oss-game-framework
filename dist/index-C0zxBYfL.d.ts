import {
  AxisKind,
  ControlTape,
  Fingerprint,
  LEVER_STEPS,
  SIGNED_STEPS,
  TapeReader,
  TapeRecorder,
  TapeSchema,
  axisToByte,
  byteToAxis,
  createFingerprint,
  createTapeRecorder,
  decodeStream,
  encodeStream,
  isControlTape,
  readTape,
  snapAxis,
  snapToGrid,
} from "./racing/tape.js";
import {
  Better,
  Book,
  RecordRow,
  beats,
  bestIn,
  isFigure,
  noteRecord,
  readBook,
  splitGap,
} from "./racing/records.js";
import { Standing, fieldOrder, isAhead, legProgress, placeAmong } from "./racing/standings.js";

declare const index_AxisKind: typeof AxisKind;
declare const index_Better: typeof Better;
declare const index_Book: typeof Book;
declare const index_ControlTape: typeof ControlTape;
declare const index_Fingerprint: typeof Fingerprint;
declare const index_LEVER_STEPS: typeof LEVER_STEPS;
declare const index_RecordRow: typeof RecordRow;
declare const index_SIGNED_STEPS: typeof SIGNED_STEPS;
declare const index_Standing: typeof Standing;
declare const index_TapeReader: typeof TapeReader;
declare const index_TapeRecorder: typeof TapeRecorder;
declare const index_TapeSchema: typeof TapeSchema;
declare const index_axisToByte: typeof axisToByte;
declare const index_beats: typeof beats;
declare const index_bestIn: typeof bestIn;
declare const index_byteToAxis: typeof byteToAxis;
declare const index_createFingerprint: typeof createFingerprint;
declare const index_createTapeRecorder: typeof createTapeRecorder;
declare const index_decodeStream: typeof decodeStream;
declare const index_encodeStream: typeof encodeStream;
declare const index_fieldOrder: typeof fieldOrder;
declare const index_isAhead: typeof isAhead;
declare const index_isControlTape: typeof isControlTape;
declare const index_isFigure: typeof isFigure;
declare const index_legProgress: typeof legProgress;
declare const index_noteRecord: typeof noteRecord;
declare const index_placeAmong: typeof placeAmong;
declare const index_readBook: typeof readBook;
declare const index_readTape: typeof readTape;
declare const index_snapAxis: typeof snapAxis;
declare const index_snapToGrid: typeof snapToGrid;
declare const index_splitGap: typeof splitGap;
declare namespace index {
  export {
    index_AxisKind as AxisKind,
    index_Better as Better,
    index_Book as Book,
    index_ControlTape as ControlTape,
    index_Fingerprint as Fingerprint,
    index_LEVER_STEPS as LEVER_STEPS,
    index_RecordRow as RecordRow,
    index_SIGNED_STEPS as SIGNED_STEPS,
    index_Standing as Standing,
    index_TapeReader as TapeReader,
    index_TapeRecorder as TapeRecorder,
    index_TapeSchema as TapeSchema,
    index_axisToByte as axisToByte,
    index_beats as beats,
    index_bestIn as bestIn,
    index_byteToAxis as byteToAxis,
    index_createFingerprint as createFingerprint,
    index_createTapeRecorder as createTapeRecorder,
    index_decodeStream as decodeStream,
    index_encodeStream as encodeStream,
    index_fieldOrder as fieldOrder,
    index_isAhead as isAhead,
    index_isControlTape as isControlTape,
    index_isFigure as isFigure,
    index_legProgress as legProgress,
    index_noteRecord as noteRecord,
    index_placeAmong as placeAmong,
    index_readBook as readBook,
    index_readTape as readTape,
    index_snapAxis as snapAxis,
    index_snapToGrid as snapToGrid,
    index_splitGap as splitGap,
  };
}

export { index as i };
