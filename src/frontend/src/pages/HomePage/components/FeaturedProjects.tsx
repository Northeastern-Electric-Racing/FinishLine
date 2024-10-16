/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../../../layouts/PageBlock';
import FeaturedProjectsCard from './FeaturedProjectsCard';
import { useFeaturedProjects } from '../../../hooks/organizations.hooks';
import { Typography, useTheme } from '@mui/material';
import ErrorPage from '../../ErrorPage';
import Box from '@mui/material/Box';
import { wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';

const FeaturedProjects: React.FC = () => {
  const featuredProjects = useFeaturedProjects();
  const theme = useTheme();

  if (featuredProjects.isError) {
    return <ErrorPage message={featuredProjects.error.message} error={featuredProjects.error} />;
  }

  const fullDisplay = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {featuredProjects.data?.length === 0 ? (
        <Typography>No Featured Projects</Typography>
      ) : (
        featuredProjects.data?.map((p) => <FeaturedProjectsCard key={wbsPipe(p.wbsNum)} p={p} />)
      )}
    </Box>
  );

  return (
    <PageBlock title={`Featured Projects (${featuredProjects.data?.length})`}>
      {featuredProjects.isLoading ? <LoadingIndicator /> : fullDisplay}
    </PageBlock>
  );
};

export default FeaturedProjects;
