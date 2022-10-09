/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import ProposedSolutionForm from './ProposedSolutionForm';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ProposedSolutionView from './ProposedSolutionView';
import styles from '../../stylesheets/pages/ChangeRequestDetailPage/ProposedSolutionsList.module.css';
import { useCreateProposeSolution } from '../../hooks/change-requests.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';

interface ProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  crReviewed?: boolean;
  crId: number;
}

const ProposedSolutionsList: React.FC<ProposedSolutionsListProps> = ({
  proposedSolutions,
  crReviewed,
  crId
}) => {
  const [proposedSolutionsList] = useState<ProposedSolution[]>(proposedSolutions);
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);
  const auth = useAuth();
  const { isLoading, isError, error, mutateAsync } = useCreateProposeSolution();

  const addProposedSolution = async (data: ProposedSolution) => {
    proposedSolutionsList.push(data);
    setShowEditableForm(false);
    const { description, timelineImpact, scopeImpact, budgetImpact } = data;

    // send the details of new proposed solution to the backend database
    await mutateAsync({
      submitterId: auth.user?.userId,
      crId,
      description,
      scopeImpact,
      timelineImpact,
      budgetImpact
    });
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <>
      {crReviewed === undefined && auth.user?.role !== 'GUEST' ? (
        <Button onClick={() => setShowEditableForm(true)} variant="success" className="mb-3">
          + Add Proposed Solution
        </Button>
      ) : (
        ''
      )}
      <div className={styles.proposedSolutionsList}>
        {proposedSolutionsList.map((proposedSolution, i) => (
          <ProposedSolutionView key={i} proposedSolution={proposedSolution} />
        ))}
      </div>
      {showEditableForm ? (
        <Modal size="xl" centered show={showEditableForm} onHide={() => setShowEditableForm(false)}>
          <ProposedSolutionForm onAdd={addProposedSolution} />
        </Modal>
      ) : null}
    </>
  );
};

export default ProposedSolutionsList;
