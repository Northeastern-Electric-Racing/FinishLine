import { Prisma } from '@prisma/client';
import { Link, LinkType } from 'shared';
import linkQueryArgs from '../prisma-query-args/links.query-args';
import linkTypeQueryArgs from '../prisma-query-args/link-types.query-args';

export const linkTransformer = (link: Prisma.LinkGetPayload<typeof linkQueryArgs>): Link => {
  return {
    linkId: link.linkId,
    linkType: linkTypeTransformer(link.linkType),
    dateCreated: link.dateCreated,
    url: link.url,
    creator: link.creator
  };
};

export const linkTypeTransformer = (linkType: Prisma.LinkTypeGetPayload<typeof linkTypeQueryArgs>): LinkType => {
  return {
    name: linkType.name,
    creator: linkType.creator,
    dateCreated: linkType.dateCreated,
    required: linkType.required,
    iconName: linkType.iconName
  };
};
