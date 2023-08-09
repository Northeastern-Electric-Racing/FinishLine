import { LinkType } from 'shared';

export const getRequiredLinkTypeNames = (linkTypes: LinkType[]): string[] => {
  return linkTypes.filter((linkType) => linkType.required).map((linkType) => linkType.name);
};
