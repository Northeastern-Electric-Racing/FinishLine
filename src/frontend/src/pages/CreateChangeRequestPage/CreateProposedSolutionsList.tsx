/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution, validateWBS, WbsNumber } from 'shared';
import ProposedSolutionForm from '../ChangeRequestDetailPage/ProposedSolutionForm';
import { useState } from 'react';
import ProposedSolutionView from '../ChangeRequestDetailPage/ProposedSolutionView';
import styles from '../../stylesheets/pages/change-request-detail-page/proposed-solutions-list.module.css';
import { useAuth } from '../../hooks/auth.hooks';
import { Button } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ChangeRequestBlockerWarning from '../../components/ChangeRequestBlockerWarning';
import { useGetBlockingWorkPackages } from '../../hooks/work-packages.hooks';

interface CreateProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
  wbsNum: string;
}

const CreateProposedSolutionsList: React.FC<CreateProposedSolutionsListProps> = ({
  proposedSolutions,
  setProposedSolutions,
  wbsNum
}) => {
  const auth = useAuth();
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [selectedPs, setSelectedPs] = useState<ProposedSolution>();
  let wbs = {} as WbsNumber;

  try {
    wbs = validateWBS(wbsNum);
  } catch (e) {
    console.log(e);
  }

  const { data } = useGetBlockingWorkPackages(wbs);

  if (!auth.user) return <LoadingIndicator />;

  const addProposedSolution = async (data: ProposedSolution) => {
    setShowWarning(false);
    setProposedSolutions([...proposedSolutions, data]);
    setShowEditableForm(false);
  };

  const showWarningWrapper = (data: ProposedSolution) => {
    if (data.timelineImpact > 0) {
      setSelectedPs(data);
      setShowWarning(true);
    } else {
      addProposedSolution(data);
    }
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
          onAdd={showWarningWrapper}
          open={showEditableForm}
          onClose={() => setShowEditableForm(false)}
        />
      ) : null}
      {showWarning ? (
        <ChangeRequestBlockerWarning
          workPackages={data ?? []}
          modalShow={showWarning}
          onHide={() => setShowWarning(false)}
          data={selectedPs}
          handleContinue={addProposedSolution}
        />
      ) : null}
    </>
  );
};

export default CreateProposedSolutionsList;
