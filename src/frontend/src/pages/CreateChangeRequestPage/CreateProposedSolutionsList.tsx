/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, ProposedSolution } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useEffect, useState } from 'react';
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
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingProposedSolution, setEditingProposedSolution] = useState<ProposedSolution>();

  useEffect(() => {
    setShowEditForm(!!editingProposedSolution);
  }, [editingProposedSolution]);

  const addProposedSolution = async (data: ProposedSolution) => {
    setProposedSolutions([...proposedSolutions, data]);
    setShowCreateForm(false);
  };

  const editProposedSolution = async (data: ProposedSolution) => {
    setProposedSolutions([...proposedSolutions.filter((proposedSolution) => proposedSolution.id !== data.id), data]);
    setShowEditForm(false);
  };

  const removeProposedSolution = (data: ProposedSolution) => {
    setProposedSolutions(proposedSolutions.filter((proposedSolution) => proposedSolution !== data));
  };

  return (
    <>
      {!isGuest(user.role) && (
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h5" sx={{ mt: 2 }}>
            Proposed Solutions
          </Typography>
          <Button onClick={() => setShowCreateForm(true)} variant="contained" color="success" sx={{ mt: 2 }}>
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
            showDeleteButton
            onEdit={(proposedSolution) => {
              setEditingProposedSolution(proposedSolution);
            }}
          />
        ))}
      </div>
      {showCreateForm && (
        <ProposedSolutionForm
          onSubmit={addProposedSolution}
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />
      )}
      {showEditForm && (
        <ProposedSolutionForm
          editing
          onSubmit={editProposedSolution}
          open={showEditForm}
          onClose={() => setEditingProposedSolution(undefined)}
          description={editingProposedSolution?.description}
          budgetImpact={editingProposedSolution?.budgetImpact}
          timelineImpact={editingProposedSolution?.timelineImpact}
          scopeImpact={editingProposedSolution?.scopeImpact}
          id={editingProposedSolution?.id}
        />
      )}
    </>
  );
};

export default CreateProposedSolutionsList;
