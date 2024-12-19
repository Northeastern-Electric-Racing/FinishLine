import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Organization } from 'shared';
import {
  getCurrentOrganization,
  updateOrganizationContacts,
  setOnboardingText,
  setApplicationLink
} from '../apis/organizations.api';

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

export const useSetApplicationLink = () => {
  const queryClient = useQueryClient();
  return useMutation<Organization, Error, ApplicationLinkPayload>(
    ['organizations', 'edit'],
    async (payload) => {
      const { data } = await setApplicationLink(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['organizations']);
      }
    }
  );
};
