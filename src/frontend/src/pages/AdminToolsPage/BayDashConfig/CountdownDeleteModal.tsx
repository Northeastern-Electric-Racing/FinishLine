/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface CountdownDeleteModalProps {
  name: string;
  onDelete: () => void;
  onHide: () => void;
}

/**
 * Warns before a countdown is removed from the bay dashboard
 */
const CountdownDeleteModal: React.FC<CountdownDeleteModalProps> = ({ name, onDelete, onHide }) => {
  return (
    <NERModal open={true} onHide={onHide} title="Warning!" cancelText="Cancel" submitText="Delete" onSubmit={onDelete}>
      <Typography>Are you sure you want to delete this countdown: {name}?</Typography>
    </NERModal>
  );
};

export default CountdownDeleteModal;
