/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Container } from 'react-bootstrap';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeams } from '../../hooks/teams.hooks';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import ErrorPage from '../ErrorPage';
import TeamSummary from './TeamSummary';

const TeamsPage: React.FC = () => {
  const { isLoading, isError, data: teams, error } = useAllTeams();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  console.log(JSON.stringify(teams));

  return (
    <Container fluid className="mb-5">
      <PageTitle title={'Teams'} previousPages={[]} />
      {teams?.map((team) => (
        <div key={team.teamId} className="mt-3">
          <TeamSummary team={team} />
        </div>
      ))}
    </Container>
  );
};

export default TeamsPage;
