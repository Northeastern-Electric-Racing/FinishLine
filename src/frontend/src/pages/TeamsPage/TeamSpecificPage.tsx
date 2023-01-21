import { Grid } from '@mui/material';
import { useSingleTeam } from '../../hooks/teams.hooks';
import { useParams } from 'react-router-dom';
import { fullNamePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import ActiveProjectCardView from './ProjectCardsView';
import DetailDisplay from '../../components/DetailDisplay';
import DescriptionPageBlock from './DescriptionPageBlock';

interface ParamTypes {
  teamId: string;
}

const TeamSpecificPage: React.FC = () => {
  const { teamId } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleTeam(teamId);
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  return (
    <>
      <PageTitle title={`Team ${data.teamName}`} previousPages={[]} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <PageBlock title={'People'}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={12}>
                <DetailDisplay label="Lead" content={fullNamePipe(data.leader)} />
              </Grid>
              <Grid item xs={12} md={12}>
                <DetailDisplay
                  label="Members"
                  content={data.members
                    .map((member) => {
                      return fullNamePipe(member);
                    })
                    .join(', ')}
                />
              </Grid>
            </Grid>
          </PageBlock>
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
    </>
  );
};

export default TeamSpecificPage;
