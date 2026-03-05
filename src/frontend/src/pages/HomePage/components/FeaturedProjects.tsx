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
import { Box, Stack, useMediaQuery } from '@mui/material';
import { Error } from '@mui/icons-material';

const NoFeaturedProjectsDisplay: React.FC = () => {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: featuredProjects, isLoading, isError, error } = useFeaturedProjects();
  const isMobilePortrait = useMediaQuery('(max-width:480px)');

  if (isLoading || !featuredProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const fullDisplay = (
    <ScrollablePageBlock title={`What We're Working On`} horizontal={!isMobilePortrait}>
      <Stack
        direction={isMobilePortrait ? 'column' : 'row'}
        spacing={isMobilePortrait ? 2 : 3}
        sx={{ width: '100%', px: isMobilePortrait ? 1 : 0 }}
      >
        {featuredProjects.length === 0 ? (
          <NoFeaturedProjectsDisplay />
        ) : (
          featuredProjects.map((p) => <FeaturedProjectsCard key={wbsPipe(p.wbsNum)} project={p} />)
        )}
      </Stack>
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default FeaturedProjects;
