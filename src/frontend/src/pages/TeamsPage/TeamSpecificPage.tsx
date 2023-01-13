import { Grid } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSingleTeam } from '../../hooks/teams.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from '../../stylesheets/pages/teams.module.css';
import TeamMembersPageBlock from './TeamMembersPageBlock';

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
          <TeamMembersPageBlock team={data} />
          <PageBlock title={'Active Projects'}></PageBlock>
          <PageBlock title={'Description'}>
            <ReactMarkdown className={styles.markdown}>{data.description}</ReactMarkdown>
          </PageBlock>
        </Grid>
      </Grid>
    </>
  );
};

export default TeamSpecificPage;
