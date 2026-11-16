import React from 'react';
import DateMarkerModal, { DateMarker, DateMarkerFormValues } from './DateMarkerModal';

export interface EditDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
  dateMarker: DateMarker;
}

const EditDateMarkerModal: React.FC<EditDateMarkerModalProps> = ({ open, onClose, dateMarker }) => {
  const initialValues: DateMarkerFormValues = {
    name: dateMarker.name,
    date: new Date(dateMarker.date)
  };

  // TODO: wire up to the edit date marker endpoint once it is available
  const onSubmit = async () => {};

  return <DateMarkerModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditDateMarkerModal;
