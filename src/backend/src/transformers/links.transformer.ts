import { Prisma } from '@prisma/client';
import { Link } from 'shared';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import linkTypeTransformer from './link-types.transformer';

const linkTransformer = (link: Prisma.LinkGetPayload<typeof linkQueryArgs>): Link => {
  return {
    linkId: link.linkId,
    linkType: linkTypeTransformer(link.linkType),
    dateCreated: link.dateCreated,
    url: link.url,
    creator: link.creator
  };
};

export default linkTransformer;
