/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export interface ApiTokenMetadata {
  apiTokenId: string;
  name: string;
  preview: string;
  dateCreated: Date;
  lastUsedAt?: Date;
}

/** Only ever returned by the generate endpoint - this is the one time the raw token is visible. */
export interface GeneratedApiToken extends ApiTokenMetadata {
  token: string;
}
