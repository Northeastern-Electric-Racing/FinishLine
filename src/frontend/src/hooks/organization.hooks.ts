import { useContext, useState } from 'react';
import { OrganizationContext } from '../app/AppOrganizationContext';

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

// Hook for child components to get the auth object
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) throw Error('Organization must be used inside of an organizational context.');
  return context;
};
