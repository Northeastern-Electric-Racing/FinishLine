import React from 'react';
import DateMarkerModal from './DateMarkerModal';

interface CreateDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateDateMarkerModal: React.FC<CreateDateMarkerModalProps> = ({ open, onClose }) => {
  // TODO: wire up to the create date marker endpoint once it is available
  const onSubmit = async () => {};

  return <DateMarkerModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateDateMarkerModal;
