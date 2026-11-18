/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { BayDashboardCountdown } from 'shared';
import { useEditBayDashboardCountdown } from '../../../hooks/bay-dashboard.hooks';
import CountdownFormModal from './CountdownFormModal';

interface EditCountdownModalProps {
  showModal: boolean;
  handleClose: () => void;
  countdown: BayDashboardCountdown;
  slug: string;
}

/**
 * Edits a bay dashboard countdown by opening the shared countdown form prefilled with its current values
 */
const EditCountdownModal: React.FC<EditCountdownModalProps> = ({ showModal, handleClose, countdown, slug }) => {
  const { mutateAsync } = useEditBayDashboardCountdown(slug);

  return (
    <CountdownFormModal
      open={showModal}
      handleClose={handleClose}
      defaultValues={countdown}
      onSubmit={(updated) => mutateAsync({ countdownId: countdown.bayDashboardCountdownId, countdown: updated })}
    />
  );
};

export default EditCountdownModal;
