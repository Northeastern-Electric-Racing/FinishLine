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
  const { data: featuredProjects, isLoading, isError, error } = useFeaturedProjects();
  const theme = useTheme();

  if (isLoading || !featuredProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  console.log(featuredProjects[0]);
  const fullDisplay = (
    <PageBlock title={`Featured Projects (${featuredProjects.length})`}>
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
        {featuredProjects.length === 0 ? (
          <Typography>No Featured Projects</Typography>
        ) : (
          <></>
          //featuredProjects.map((p) => <FeaturedProjectsCard key={wbsPipe(p.wbsNum)} project={p} />)
        )}
      </Box>
    </PageBlock>
  );

  return fullDisplay;
};

export default FeaturedProjects;
