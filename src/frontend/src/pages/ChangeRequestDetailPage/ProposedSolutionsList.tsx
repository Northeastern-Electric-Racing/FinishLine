/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import ProposedSolutionForm from './ProposedSolutionForm';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ProposedSolutionView from './ProposedSolutionView';

interface ProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  crReviewed: boolean;
}

const ProposedSolutionsList: React.FC<ProposedSolutionsListProps> = ({
  proposedSolutions,
  crReviewed
}) => {
  const [proposedSolutionsList] = useState<ProposedSolution[]>(proposedSolutions);
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);

  const addProposedSolution = (data: ProposedSolution) => {
    proposedSolutionsList.push(data);
    setShowEditableForm(false);
  };

  return (
    <>
      {!crReviewed ? (
        <Button onClick={() => setShowEditableForm(true)} variant="success" className="mb-3">
          + Add Proposed Solution
        </Button>
      ) : (
        ''
      )}
      <div
        style={{
          maxHeight: '35em',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
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
