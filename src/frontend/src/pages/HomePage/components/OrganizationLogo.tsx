import React from 'react';
import LogoDisplay from './LogoDisplay';
import { useOrganizationLogo } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const OrganizationLogo = () => {
  const { data: imageData, isLoading, isError, error } = useOrganizationLogo();
  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <LogoDisplay imageUrl={imageData && URL.createObjectURL(imageData)} />
    </div>
  );
};

export default OrganizationLogo;
