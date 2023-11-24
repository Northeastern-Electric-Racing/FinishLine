/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, ProposedSolution } from 'shared';
import ProposedSolutionForm from './ProposedSolutionForm';
import { useState } from 'react';
import ProposedSolutionView from './ProposedSolutionView';
import styles from '../../stylesheets/pages/change-request-detail-page/proposed-solutions-list.module.css';
import { useCreateProposeSolution } from '../../hooks/change-requests.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAuth } from '../../hooks/auth.hooks';
import { Button } from '@mui/material';
import { useToast } from '../../hooks/toasts.hooks';

interface ProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  crReviewed?: boolean;
  crId: number;
}

const ProposedSolutionsList: React.FC<ProposedSolutionsListProps> = ({ proposedSolutions, crReviewed, crId }) => {
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);
  const auth = useAuth();
  const { isLoading, isError, error, mutateAsync } = useCreateProposeSolution();
  const toast = useToast();

  if (isLoading || !auth.user) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const { userId } = auth.user;

  const addProposedSolution = async (data: ProposedSolution) => {
    setShowEditableForm(false);
    const { description, timelineImpact, scopeImpact, budgetImpact } = data;
    try {
      // send the details of new proposed solution to the backend database
      await mutateAsync({
        submitterId: userId,
        crId,
        description,
        scopeImpact,
        timelineImpact,
        budgetImpact
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <>
      <div className={styles.proposedSolutionsList}>
        {proposedSolutions.map((proposedSolution, i) => (
          <ProposedSolutionView key={i} proposedSolution={proposedSolution} crReviewed={crReviewed} />
        ))}
      </div>
      {crReviewed === undefined && !isGuest(auth.user?.role) ? (
        <Button onClick={() => setShowEditableForm(true)} variant="contained" color="success" sx={{ marginTop: 2 }}>
          + Add Proposed Solution
        </Button>
      ) : (
        ''
      )}
      {showEditableForm ? (
        <ProposedSolutionForm
          onAdd={addProposedSolution}
          open={showEditableForm}
          onClose={() => setShowEditableForm(false)}
        />
      ) : null}
    </>
  );
};

export default ProposedSolutionsList;
