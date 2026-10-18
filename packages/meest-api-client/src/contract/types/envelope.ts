// code and comments in English

/**
 * Meest contract envelope. The Swagger examples disagree with each other: `status` is `OK`/`ok`/`Error`,
 * and the error description sits either in `info` or in flat `fieldName`/`message`/`messageDetails`.
 * The types describe both; `unwrap` in `errors.ts` accepts both.
 */
export interface MeestResponse<T> {
  status: string;
  info?: MeestInfo | string | null;
  fieldName?: string | null;
  message?: string | null;
  messageDetails?: unknown;
  result: T;
}

export interface MeestInfo {
  fieldName?: string | null;
  message?: string | null;
  messageDetails?: unknown;
}
