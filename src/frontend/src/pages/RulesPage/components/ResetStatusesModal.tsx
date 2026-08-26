/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface ResetStatusesModalProps {
  // e.g. "the Mock FSAE ruleset" or "the Bodywork project's Mock FSAE rules"
  scopeDescription: string;
  onReset: () => void;
  onHide: () => void;
  disabled?: boolean;
}

const ResetStatusesModal: React.FC<ResetStatusesModalProps> = ({ scopeDescription, onReset, onHide, disabled }) => {
  return (
    <NERModal
      open={true}
      onHide={onHide}
      title="Warning!"
      cancelText="Cancel"
      onSubmit={onReset}
      formId="reset-statuses"
      disabled={disabled}
    >
      <Typography>Are you sure you want to reset all rule statuses</Typography>
      <Typography>to PENDING for {scopeDescription}?</Typography>
    </NERModal>
  );
};

export default ResetStatusesModal;
