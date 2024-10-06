import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Organization } from 'shared';
import { getCurrentOrganization, setOrganizationDescription } from '../apis/organizations.api';

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

// Hook for child components to get the auth object
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) throw Error('Organization must be used inside of an organizational context.');
  return context;
};

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
