import { Prisma } from '@prisma/client';
import linkTypeQueryArgs from '../prisma-query-args/link-types.query-args';
import { LinkType } from 'shared';

const linkTypeTransformer = (linkType: Prisma.LinkTypeGetPayload<typeof linkTypeQueryArgs>): LinkType => {
  return {
    name: linkType.name,
    creator: linkType.creator,
    dateCreated: linkType.dateCreated,
    iconName: linkType.iconName
  };
};

export default linkTypeTransformer;
