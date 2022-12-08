import { Grid } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSingleTeam } from '../../hooks/teams.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import { useParams } from 'react-router-dom';
import { fullNamePipe } from '../../utils/Pipes';
import ReactMarkdown from 'react-markdown';

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
                <b style={{ display: 'inline' }}>Lead: </b>
                <p style={{ display: 'inline' }}>{fullNamePipe(data.leader)}</p>
              </Grid>
              <Grid item xs={12} md={12}>
                <b style={{ display: 'inline' }}>Members: </b>
                <p style={{ display: 'inline' }}>
                  {data.members.map((member) => {
                    return fullNamePipe(member)
                  }).join(', ')}
                </p>
              </Grid>
            </Grid>
          </PageBlock>
          <PageBlock title={'Active Projects'}></PageBlock>
          <PageBlock title={'Description'}>
            <ReactMarkdown>{data.description}</ReactMarkdown>
          </PageBlock>
        </Grid>
      </Grid>
    </>
  );
};

export default TeamSpecificPage;
