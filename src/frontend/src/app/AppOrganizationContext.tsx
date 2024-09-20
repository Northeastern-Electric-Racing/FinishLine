import { createContext } from 'react';
import { useProvideOrganization } from '../hooks/organizations.hooks';

export interface Organization {
  organizationId: string;
  selectOrganization: (organizationId: string) => void;
}

export const OrganizationContext = createContext<Organization | undefined>(undefined);

const AppContextOrganization: React.FC = (props) => {
  const organization = useProvideOrganization();
  return <OrganizationContext.Provider value={organization}>{props.children}</OrganizationContext.Provider>;
};

export default AppContextOrganization;
