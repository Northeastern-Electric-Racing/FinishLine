import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { MutationFunction, useMutation, useQuery, useQueryClient } from 'react-query';
import { setOrganizationImages } from '../apis/organization.api';

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

export const useSetOrganizationImages = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, Express.Multer.File[]>(
    async (images: Express.Multer.File[]) => {
      const { data } = await setOrganizationImages(images); 
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organization images']);
      },
    }
  );
};

// Hook for child components to get the auth object
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) throw Error('Organization must be used inside of an organizational context.');
  return context;
};
