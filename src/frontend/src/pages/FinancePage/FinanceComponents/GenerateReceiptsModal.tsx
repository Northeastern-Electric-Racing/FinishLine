import { FormControl, FormLabel, MenuItem, Select, TextField } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDownloadPDFOfImages } from '../../../hooks/finance.hooks';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { ReimbursementRequest } from 'shared';

const schema = yup.object().shape({
  startDate: yup.date().required('Start Date is required'),
  endDate: yup.date().min(yup.ref('startDate'), `end date can't be before start date`).required('End Date is required')
});

interface GenerateReceiptsFormInput {
  startDate: Date;
  endDate: Date;
}

interface GenerateReceiptsModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  allReimbursementRequests?: ReimbursementRequest[];
}

const GenerateReceiptsModal = ({ open, setOpen, allReimbursementRequests }: GenerateReceiptsModalProps) => {
  const toast = useToast();
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const { mutateAsync, isLoading } = useDownloadPDFOfImages();

  const onGenerateReceiptsSubmit = async (data: GenerateReceiptsFormInput) => {
    if (!allReimbursementRequests) return;
    const filteredRequests = allReimbursementRequests
      .filter(
        (val: ReimbursementRequest) => new Date(val.dateCreated.toDateString()) >= new Date(data.startDate.toDateString())
      )
      .filter(
        (val: ReimbursementRequest) => new Date(val.dateCreated.toDateString()) <= new Date(data.endDate.toDateString())
      )
      .filter((val: ReimbursementRequest) => !val.dateDeleted);
    const receipts = filteredRequests?.flatMap((request: ReimbursementRequest) => request.receiptPictures);
    try {
      await mutateAsync({
        fileIds: receipts.map((receipt) => receipt.googleFileId)
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setOpen(false);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema)
  });

  return (
    <NERFormModal
      open={open}
      onHide={() => setOpen(false)}
      title={`Generate All Receipts`}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onGenerateReceiptsSubmit}
      formId="generate-receipts-form"
      disabled={!isValid || isLoading}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <FormControl fullWidth>
            <FormLabel>Start Date</FormLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  value={value}
                  open={startDatePickerOpen}
                  onClose={() => setStartDatePickerOpen(false)}
                  onOpen={() => setStartDatePickerOpen(true)}
                  onChange={(newValue) => {
                    onChange(newValue ?? new Date());
                  }}
                  PopperProps={{
                    placement: 'right'
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{ ...params.inputProps, readOnly: true }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                      onClick={(e) => setStartDatePickerOpen(true)}
                    />
                  )}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>End Date</FormLabel>
            <Controller
              name="endDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  value={value}
                  open={endDatePickerOpen}
                  onClose={() => setEndDatePickerOpen(false)}
                  onOpen={() => setEndDatePickerOpen(true)}
                  onChange={(newValue) => {
                    onChange(newValue ?? new Date());
                  }}
                  PopperProps={{
                    placement: 'right'
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{ ...params.inputProps, readOnly: true }}
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                      onClick={(e) => setEndDatePickerOpen(true)}
                    />
                  )}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>Refund Source</FormLabel>
            <Controller
              name="account"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  onChange={(newValue) => onChange(newValue.target.value as ClubAccount)}
                  value={value}
                  disabled={!selectedExpenseType}
                  error={!!errors.account}
                >
                  {refundSources.map((refundSource) => (
                    <MenuItem key={refundSource} value={refundSource}>
                      {codeAndRefundSourceName(refundSource)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText error>{errors.account?.message}</FormHelperText>
          </FormControl>
        </>
      )}
    </NERFormModal>
  );
};

export default GenerateReceiptsModal;
