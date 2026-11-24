import React from 'react';
import { BaseDateMarker } from 'shared';
import DateMarkerModal, { DateMarkerFormValues } from './DateMarkerModal';
import { useEditDateMarker } from '../../../../hooks/date-markers.hooks';

export interface EditDateMarkerModalProps {
  open: boolean;
  onClose: () => void;
  dateMarker: BaseDateMarker;
}

const EditDateMarkerModal: React.FC<EditDateMarkerModalProps> = ({ open, onClose, dateMarker }) => {
  const { mutateAsync: editDateMarker } = useEditDateMarker(dateMarker.dateMarkerId);

  const initialValues: DateMarkerFormValues = {
    name: dateMarker.name,
    date: new Date(dateMarker.date)
  };

  const onSubmit = async (data: DateMarkerFormValues) => {
    // date is never null here: the form schema requires it before submit runs
    await editDateMarker({ name: data.name, date: data.date! });
  };

  return <DateMarkerModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditDateMarkerModal;
