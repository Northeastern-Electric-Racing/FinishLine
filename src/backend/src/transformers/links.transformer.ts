import { Prisma } from '@prisma/client';
import { Link, LinkType } from 'shared';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import linkTypeQueryArgs from '../prisma-query-args/link-types.query-args';

const linkTransformer = (link: Prisma.LinkGetPayload<typeof linkQueryArgs>): Link => {
  return {
    linkId: link.linkId,
    linkType: linkTypeTransformer(link.linkType),
    dateCreated: link.dateCreated,
    url: link.url,
    creator: link.creator
  };
};

const linkTypeTransformer = (linkType: Prisma.LinkTypeGetPayload<typeof linkTypeQueryArgs>): LinkType => {
  return {
    linkTypeId: linkType.linkTypeId,
    name: linkType.name,
    creator: linkType.creator,
    dateCreated: linkType.dateCreated
  };
};

export default linkTransformer;
