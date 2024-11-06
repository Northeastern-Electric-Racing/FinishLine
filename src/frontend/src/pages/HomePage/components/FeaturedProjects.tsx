/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import FeaturedProjectsCard from './FeaturedProjectsCard';
import { useFeaturedProjects } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';
import { wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import { Box } from '@mui/material';
import { Error } from '@mui/icons-material';

const NoTasksDisplay: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<Error sx={{ fontSize: 70 }} />}
        heading={'No Featured Projects'}
        message={'There are no Featured Projects to Display'}
      />
    </Box>
  );
};

const FeaturedProjects: React.FC = () => {
  const { data: featuredProjects, isLoading, isError, error } = useFeaturedProjects();

  if (isLoading || !featuredProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const fullDisplay = (
    <ScrollablePageBlock title={`Featured Projects`} horizontal>
      {featuredProjects.length === 0 ? (
        <NoTasksDisplay />
      ) : (
        featuredProjects.map((p) => <FeaturedProjectsCard key={wbsPipe(p.wbsNum)} project={p} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default FeaturedProjects;
