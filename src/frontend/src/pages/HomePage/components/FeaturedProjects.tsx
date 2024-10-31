/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import FeaturedProjectsCard from './FeaturedProjectsCard';
import { useFeaturedProjects } from '../../../hooks/organizations.hooks';
import { Typography } from '@mui/material';
import ErrorPage from '../../ErrorPage';
import { wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';

const FeaturedProjects: React.FC = () => {
  const { data: featuredProjects, isLoading, isError, error } = useFeaturedProjects();

  if (isLoading || !featuredProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const fullDisplay = (
    <ScrollablePageBlock title={`Featured Projects`} horizontal>
      {featuredProjects.length === 0 ? (
        <Typography>No Featured Projects</Typography>
      ) : (
        featuredProjects.map((p) => <FeaturedProjectsCard key={wbsPipe(p.wbsNum)} project={p} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default FeaturedProjects;
