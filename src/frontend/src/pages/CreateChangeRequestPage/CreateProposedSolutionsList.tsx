/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useState } from 'react';
import ProposedSolutionView from '../ChangeRequestDetailPage/ProposedSolutionView';
import styles from '../../stylesheets/pages/change-request-detail-page/proposed-solutions-list.module.css';
import { useAuth } from '../../hooks/auth.hooks';
import { Button } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';

interface CreateProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
}

const CreateProposedSolutionsList: React.FC<CreateProposedSolutionsListProps> = ({
  proposedSolutions,
  setProposedSolutions
}) => {
  const auth = useAuth();
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);

  if (!auth.user) return <LoadingIndicator />;

  const addProposedSolution = async (data: ProposedSolution) => {
    setProposedSolutions([...proposedSolutions, data]);
    setShowEditableForm(false);
  };

  const removeProposedSolution = (data: ProposedSolution) => {
    setProposedSolutions(proposedSolutions.filter((proposedSolution) => proposedSolution !== data));
  };

  return (
    <>
      <div className={styles.proposedSolutionsList}>
        {proposedSolutions.map((proposedSolution, i) => (
          <ProposedSolutionView
            key={i}
            proposedSolution={proposedSolution}
            onDelete={removeProposedSolution}
            showDeleteButton
          />
        ))}
      </div>
      {auth.user.role !== 'GUEST' ? (
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

export default CreateProposedSolutionsList;
