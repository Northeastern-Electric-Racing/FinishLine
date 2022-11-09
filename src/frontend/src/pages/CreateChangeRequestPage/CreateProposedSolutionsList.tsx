/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import ProposedSolutionView from '../ChangeRequestDetailPage/ProposedSolutionView';
import styles from '../../stylesheets/pages/change-request-detail-page/proposed-solutions-list.module.css';
import { useAuth } from '../../hooks/auth.hooks';
import { Dialog } from '@mui/material';

interface CreateProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
}

const CreateProposedSolutionsList: React.FC<CreateProposedSolutionsListProps> = ({
  proposedSolutions,
  setProposedSolutions
}) => {
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);

  const addProposedSolution = async (data: ProposedSolution) => {
    setProposedSolutions([...proposedSolutions, data]);
    setShowEditableForm(false);
  };

  const removeProposedSolution = (data: ProposedSolution) => {
    setProposedSolutions(proposedSolutions.filter((proposedSolution) => proposedSolution !== data));
  };

  return (
    <>
      {useAuth().user?.role !== 'GUEST' ? (
        <Button onClick={() => setShowEditableForm(true)} variant="success" className="mb-3">
          + Add Proposed Solution
        </Button>
      ) : (
        ''
      )}
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
      {showEditableForm ? (
        <Dialog open={showEditableForm} onClose={() => setShowEditableForm(false)} style={{ color: 'black' }}>
          <ProposedSolutionForm onAdd={addProposedSolution} />
        </Dialog>
      ) : null}
    </>
  );
};

export default CreateProposedSolutionsList;
