import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Organization, ProjectPreview, User } from 'shared';
import {
  getFeaturedProjects,
  getCurrentOrganization,
  setOrganizationDescription,
  setOrganizationFeaturedProjects,
  setOrganizationWorkspaceId,
  setOrganizationLogo,
  getOrganizationLogo,
  updateApplicationLink,
  setOnboardingText,
  updateOrganizationContacts,
  getPartReviewGuideLink,
  setPartReviewGuideLink,
  setSlackSponsorshipNotificationSlackChannelId,
  getFinanceDelegates,
  setFinanceDelegates,
  setOrganizationNewMemberImage,
  getOrganizationNewMemberImage,
  setOrganizationPlatformLogoImage,
  getOrganizationPlatformLogoImage
} from '../apis/organizations.api';
import { downloadGoogleImage } from '../apis/organizations.api';

interface OrganizationProvider {
  organizationId: string;
  selectOrganization: (organizationId: string) => void;
}

export interface UpdateContactsPayload {
  contacts: { userId: string; title: string }[];
}

export interface OnboardingTextPayload {
  onboardingText: string;
}

export interface ApplicationLinkPayload {
  applicationLink: string;
}

export interface ChannelIdPayload {
  channelId: string;
}

export const useCurrentOrganization = () => {
  return useQuery<Organization, Error>(['organizations'], async () => {
    const { data } = await getCurrentOrganization();
    return data;
  });
};

export const useProvideOrganization = (): OrganizationProvider => {
  const [organizationId, setOrganizationId] = useState<string>('');

  const selectOrganization = (organizationId: string) => {
    setOrganizationId(organizationId);
    localStorage.setItem('organizationId', organizationId);
  };

  return {
    organizationId,
    selectOrganization
  };
};

export const useFeaturedProjects = () => {
  return useQuery<ProjectPreview[], Error>(['organizations', 'featured-projects'], async () => {
    const { data } = await getFeaturedProjects();
    return data;
  });
};

// Hook for child components to get the auth object
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) throw Error('Organization must be used inside of an organizational context.');
  return context;
};

export const useUpdateOrganizationContacts = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, UpdateContactsPayload>(
    ['organizations'],
    async (payload: UpdateContactsPayload) => {
      const { data } = await updateOrganizationContacts(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useSetOnboardingText = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, OnboardingTextPayload>(
    ['organizations', 'edit'],
    async (payload) => {
      const { data } = await setOnboardingText(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useUpdateApplicationLink = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, ApplicationLinkPayload>(
    ['organizations', 'edit'],
    async (payload) => {
      const { data } = await updateApplicationLink(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

/**
 * Custom React Hook to set the description of an organization
 * @returns the updated organization
 */
export const useSetOrganizationDescription = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, string>(
    ['organizations', 'description'],
    async (description: string) => {
      const { data } = await setOrganizationDescription(description);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useSetFeaturedProjects = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, ProjectPreview[]>(
    ['organizations', 'featured-projects'],
    async (featuredProjects: ProjectPreview[]) => {
      const { data } = await setOrganizationFeaturedProjects(featuredProjects.map((project) => project.id));
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useSetWorkspaceId = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, string>(
    ['organizations', 'workspace-id'],
    async (workspaceId: string) => {
      const { data } = await setOrganizationWorkspaceId(workspaceId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useSetOrganizationLogo = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, File>(['reimbursement-requsts', 'edit'], async (file: File) => {
    const { data } = await setOrganizationLogo(file);
    queryClient.invalidateQueries(['organizations']);
    return data;
  });
};

export const useOrganizationLogo = () => {
  return useQuery<Blob | undefined, Error>(['organizations', 'logo'], async () => {
    const { data: fileId } = await getOrganizationLogo();
    if (!fileId) {
      return;
    }
    return await downloadGoogleImage(fileId);
  });
};

export const useOrganizationNewMemberImage = () => {
  return useQuery<Blob | undefined, Error>(['organizations', 'new-member-image'], async () => {
    const { data: fileId } = await getOrganizationNewMemberImage();
    if (!fileId) {
      return;
    }
    return await downloadGoogleImage(fileId);
  });
};

export const useSetOrganizationNewMemberImage = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, File>(['organizations', 'new-member-image'], async (file: File) => {
    const { data } = await setOrganizationNewMemberImage(file);
    queryClient.invalidateQueries(['organizations']);
    queryClient.invalidateQueries(['organizations', 'new-member-image']);
    return data;
  });
};

export const useSetOrganizationPlatformLogoImage = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, File>(['organizations', 'platform-logo'], async (file: File) => {
    const { data } = await setOrganizationPlatformLogoImage(file);
    queryClient.invalidateQueries(['organizations']);
    return data;
  });
};

export const useOrganizationPlatformLogoImage = () => {
  return useQuery<Blob | undefined, Error>(['organizations', 'platform-logo'], async () => {
    const { data: fileId } = await getOrganizationPlatformLogoImage();
    if (!fileId) {
      return;
    }
    return await downloadGoogleImage(fileId);
  });
};

/*
 * Custom React Hook to fetch confluence guide for current
 * organization in backend
 *
 */

export const useGetPartReviewGuideLink = () => {
  return useQuery<string, Error>(['organizations', 'part-review-guide-link'], async () => {
    const { data } = await getPartReviewGuideLink();
    return data;
  });
};
/*
 * Custom React Hook to set part review guide confluence
 * guide link
 *
 */
export const useSetPartReviewGuideLink = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, string>(
    ['organizations', 'part-review-guide-link'],
    async (guideLink: string) => {
      const { data } = await setPartReviewGuideLink(guideLink);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations', 'part-review-guide-link']);
      }
    }
  );
};

export const useSetSlackSponsorshipNotificationChannelId = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, string>(
    ['organizations', 'sponsorship-channel'],
    async (channelId: string) => {
      const { data } = await setSlackSponsorshipNotificationSlackChannelId({ channelId });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useGetFinanceDelegates = () => {
  return useQuery<User[], Error>(['organizations', 'finance-delegates'], async () => {
    const { data } = await getFinanceDelegates();
    return data;
  });
};

export const useSetFinanceDelegates = () => {
  const queryClient = useQueryClient();
  return useMutation<User[], Error, string[]>(
    ['organizations', 'finance-delegates'],
    async (userIds: string[]) => {
      const { data } = await setFinanceDelegates(userIds);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations', 'finance-delegates']);
      }
    }
  );
};
