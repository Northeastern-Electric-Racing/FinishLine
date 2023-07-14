import { Grid } from '@mui/material';
import { useSingleTeam } from '../../hooks/teams.hooks';
import { useParams } from 'react-router-dom';
import TeamMembersPageBlock from './TeamMembersPageBlock';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import ActiveProjectCardView from './ProjectCardsView';
import DescriptionPageBlock from './DescriptionPageBlock';
import { routes } from '../../utils/routes';
import PageLayout from '../../components/PageLayout';

interface ParamTypes {
  teamId: string;
}

const TeamSpecificPage: React.FC = () => {
  const { teamId } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleTeam(teamId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  return (
    <PageLayout title={`Team ${data.teamName}`} previousPages={[{ name: 'Teams', route: routes.TEAMS }]}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TeamMembersPageBlock team={data} />
          <PageBlock title={'Active Projects'}>
            <Grid container spacing={2}>
              {data.projects
                .filter((project) => project.status === 'ACTIVE')
                .map((project) => (
                  <Grid item key={project.id}>
                    <ActiveProjectCardView project={project} />
                  </Grid>
                ))}
            </Grid>
          </PageBlock>
          <DescriptionPageBlock team={data} />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default TeamSpecificPage;
