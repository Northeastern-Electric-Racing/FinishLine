import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Organization, Project } from 'shared';
import {
  getFeaturedProjects,
  getCurrentOrganization,
  setOrganizationDescription,
  getOrganizationLogo
} from '../apis/organizations.api';
import { downloadGoogleImage } from '../apis/finance.api';

interface OrganizationProvider {
  organizationId: string;
  selectOrganization: (organizationId: string) => void;
}

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

export const useCurrentOrganization = () => {
  return useQuery<Organization, Error>(['organizations'], async () => {
    const { data } = await getCurrentOrganization();
    return data;
  });
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
      queryClient.invalidateQueries(['organizations']);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};

export const useOrganizationLogo = () => {
  return useQuery<string, Error>(['organizations', 'logo'], async () => {
    const { data: fileId } = await getOrganizationLogo();

    const imageBlob = await downloadGoogleImage(fileId);

    return URL.createObjectURL(imageBlob);
  });
};
