import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Organization, Project } from 'shared';
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
  setOrganizationImages
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

export const useSetOrganizationImages = () => {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, File[]>(
    async (images: File[]) => {
      const { data } = await setOrganizationImages(images);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useFeaturedProjects = () => {
  return useQuery<Project[], Error>(['organizations', 'featured-projects'], async () => {
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
  return useMutation<Organization, Error, Project[]>(
    ['organizations', 'featured-projects'],
    async (featuredProjects: Project[]) => {
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
    ['organizations', 'featured-projects'],
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
