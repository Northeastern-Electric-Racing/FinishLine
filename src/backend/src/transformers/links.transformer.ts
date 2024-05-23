import { Prisma } from '@prisma/client';
import { Link, LinkType } from 'shared';
import { LinkQueryArgs } from '../prisma-query-args/links.query-args';
import { LinkTypeQueryArgs } from '../prisma-query-args/link-types.query-args';
import { userTransformer } from './user.transformer';

export const linkTransformer = (link: Prisma.LinkGetPayload<LinkQueryArgs>): Link => {
  return {
    linkId: link.linkId,
    linkType: linkTypeTransformer(link.linkType),
    dateCreated: link.dateCreated,
    url: link.url,
    creator: userTransformer(link.creator)
  };
};

export const linkTypeTransformer = (linkType: Prisma.Link_TypeGetPayload<LinkTypeQueryArgs>): LinkType => {
  return {
    name: linkType.name,
    creator: userTransformer(linkType.creator),
    dateCreated: linkType.dateCreated,
    required: linkType.required,
    iconName: linkType.iconName
  };
};
