/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, ProposedSolution } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useState } from 'react';
import ProposedSolutionView from '../ChangeRequestDetailPage/ProposedSolutionView';
import { Button, Typography } from '@mui/material';
import { useCurrentUser } from '../../hooks/users.hooks';
import { Box } from '@mui/system';

interface CreateProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
}

const CreateProposedSolutionsList: React.FC<CreateProposedSolutionsListProps> = ({
  proposedSolutions,
  setProposedSolutions
}) => {
  const user = useCurrentUser();
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);

  const addProposedSolution = async (data: ProposedSolution) => {
    setProposedSolutions([...proposedSolutions, data]);
    setShowEditableForm(false);
  };

  const removeProposedSolution = (data: ProposedSolution) => {
    setProposedSolutions(proposedSolutions.filter((proposedSolution) => proposedSolution !== data));
  };

  const editProposedSolution = (editedData: ProposedSolution, originalData: ProposedSolution) => {
    const updatedSolutions = proposedSolutions.map((proposedSolution) =>
      proposedSolution === originalData ? editedData : proposedSolution
    );
    setProposedSolutions(updatedSolutions);
  };

  return (
    <>
      {!isGuest(user.role) && (
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h5" sx={{ mt: 2 }}>
            Proposed Solutions
          </Typography>
          <Button onClick={() => setShowEditableForm(true)} variant="contained" color="success" sx={{ mt: 2 }}>
            + Add Solution
          </Button>
        </Box>
      )}
      <div style={{ marginTop: '30px' }}>
        {proposedSolutions.map((proposedSolution, i) => (
          <ProposedSolutionView
            key={i}
            proposedSolution={proposedSolution}
            onDelete={removeProposedSolution}
            onEdit={editProposedSolution}
            showDeleteButton
          />
        ))}
      </div>

      <ProposedSolutionForm onAdd={addProposedSolution} open={showEditableForm} onClose={() => setShowEditableForm(false)} />
    </>
  );
};

export default CreateProposedSolutionsList;
