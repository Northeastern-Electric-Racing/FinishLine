import React from 'react';
import { useCurrentOrganization, useSetOrganizationLogo } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import EditLogoForm from './EditLogoForm';
import { useToast } from '../../../hooks/toasts.hooks';

const EditLogo = () => {
  const { data: organization, isLoading: organizationIsLoading } = useCurrentOrganization();
  const { mutateAsync } = useSetOrganizationLogo();
  const toast = useToast();

  if (organizationIsLoading || !organization) return <LoadingIndicator />;

  const onSubmitWrapper = async (logoImage: File) => {
    try {
      await mutateAsync(logoImage);
      toast.success('Logo updated successfully!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    await mutateAsync(logoImage);
  };

  return <EditLogoForm onSubmit={onSubmitWrapper} />;
};

export default EditLogo;
