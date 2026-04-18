import { Box, Grid } from '@mui/system';
import { useAllGuestDefinitions } from '../../hooks/recruitment.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { GuestDefinitionType } from 'shared';
import PageLayout from '../../components/PageLayout';
import PageBlock from '../../layouts/PageBlock';
import { Typography } from '@mui/material';

const GuestInfoPage: React.FC = () => {
  const { data: definitions, isLoading, isError, error } = useAllGuestDefinitions();

  if (isError) {
    return <ErrorPage message={error.message} />;
  }
  if (isLoading || !definitions) return <LoadingIndicator />;

  const filteredDefinitions = definitions
    .filter((definition) => definition.type === GuestDefinitionType.INFO_PAGE)
    .sort((a, b) => a.order - b.order);
  return (
    <PageLayout title="Information">
      {filteredDefinitions.map((def) => {
        return (
          <PageBlock title={def.term}>
            <Typography>{def.description}</Typography>
          </PageBlock>
        );
      })}
    </PageLayout>
  );
};

export default GuestInfoPage;
