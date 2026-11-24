import React from 'react';
import DateMarkerModal, { DateMarkerFormValues } from './DateMarkerModal';
import { useCreateDateMarker } from '../../../../hooks/date-markers.hooks';

interface CreateDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateDateMarkerModal: React.FC<CreateDateMarkerModalProps> = ({ open, onClose }) => {
  const { mutateAsync: createDateMarker } = useCreateDateMarker();

  const onSubmit = async (data: DateMarkerFormValues) => {
    // date is never null here: the form schema requires it before submit runs
    await createDateMarker({ name: data.name, date: data.date! });
  };

  return <DateMarkerModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateDateMarkerModal;
