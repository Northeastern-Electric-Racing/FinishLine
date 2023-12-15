/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, ProposedSolution } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useState } from 'react';
import ProposedSolutionView from '../ChangeRequestDetailPage/ProposedSolutionView';
import { useAuth } from '../../hooks/auth.hooks';
import { Button, Grid, Typography } from '@mui/material';
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
      {!isGuest(auth.user.role) ? (
        <Grid container columnSpacing={5}>
          <Grid item>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Proposed Solutions
            </Typography>
          </Grid>
          <Grid item>
            <Button
              onClick={() => setShowEditableForm(true)}
              variant="contained"
              color="success"
              sx={{ mt: 2, maxHeight: '35px' }}
            >
              + Add Proposed Solution
            </Button>
          </Grid>
        </Grid>
      ) : (
        ''
      )}
      <div style={{ marginTop: '30px' }}>
        {proposedSolutions.map((proposedSolution, i) => (
          <ProposedSolutionView
            key={i}
            proposedSolution={proposedSolution}
            onDelete={removeProposedSolution}
            showDeleteButton
          />
        ))}
      </div>

      <ProposedSolutionForm onAdd={addProposedSolution} open={showEditableForm} onClose={() => setShowEditableForm(false)} />
    </>
  );
};

export default CreateProposedSolutionsList;
