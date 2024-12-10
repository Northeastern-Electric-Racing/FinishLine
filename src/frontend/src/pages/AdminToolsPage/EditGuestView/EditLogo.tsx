import React from 'react';
import { useCurrentOrganization, useOrganizationLogo, useSetOrganizationLogo } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditLogoForm from './EditLogoForm';

const EditLogo = () => {
  const { data: organization, isLoading: organizationIsLoading } = useCurrentOrganization();
  const { mutateAsync } = useSetOrganizationLogo();
  const { data: imageUrl } = useOrganizationLogo();

  if (organizationIsLoading || !organization) return <LoadingIndicator />;

  const onSubmitWrapper = async (logoImage: File) => {
    console.log('RECEIVED FILE');
    await mutateAsync(logoImage);
  };

  return <EditLogoForm logoImageUrl={imageUrl} onSubmit={onSubmitWrapper} />;
};

export default EditLogo;
