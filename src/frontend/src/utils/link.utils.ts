import { Link, LinkType } from 'shared';

export const getRequiredLinkTypeNames = (linkTypes: LinkType[]): string[] => {
  return linkTypes.filter((linkType) => linkType.required).map((linkType) => linkType.name);
};

export const linkToLinkCreateArgs = (links: Link[]) => {
  return links.map((link) => {
    return {
      linkId: link.linkId,
      linkTypeName: link.linkType.name,
      url: link.url,
      isOnGuestHomePage: link.isOnGuestHomePage,
      isOnNewMemberDashboard: link.isOnNewMemberDashboard,
      isOnOnboardingDashboard: link.isOnOnboardingDashboard
    };
  });
};
