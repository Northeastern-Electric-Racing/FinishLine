/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import ProposedSolutionForm from './ProposedSolutionForm';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
}

const ProposedSolutionsList: React.FC<ProposedSolutionsListProps> = ({ proposedSolutions }) => {
  const [proposedSolutionsList] = useState<ProposedSolution[]>(proposedSolutions);
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);

  const addProposedSolution = (data: ProposedSolution) => {
    proposedSolutionsList.push(data);
    setShowEditableForm(false);
  };

  return (
    <>
      <Button onClick={() => setShowEditableForm(true)} variant="success" className="mb-3">
        + Add Proposed Solution
      </Button>
      <div
        style={{
          maxHeight: '35em',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
        {proposedSolutionsList.map((proposedSolution, i) => (
          <ProposedSolutionForm
            onAdd={() => {}}
            description={proposedSolution.description}
            scopeImpact={proposedSolution.scopeImpact}
            timelineImpact={proposedSolution.timelineImpact}
            budgetImpact={proposedSolution.budgetImpact}
            readOnly
            key={i}
          />
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
