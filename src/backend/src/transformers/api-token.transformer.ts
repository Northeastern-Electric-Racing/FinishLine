import { User_API_Token } from '@prisma/client';
import { ApiTokenMetadata } from 'shared';

// fields are listed explicitly rather than spread so that tokenHash can never leak into a response
export const apiTokenTransformer = (apiToken: User_API_Token): ApiTokenMetadata => {
  return {
    apiTokenId: apiToken.apiTokenId,
    name: apiToken.name,
    preview: apiToken.preview,
    dateCreated: apiToken.dateCreated,
    lastUsedAt: apiToken.lastUsedAt ?? undefined
  };
};
