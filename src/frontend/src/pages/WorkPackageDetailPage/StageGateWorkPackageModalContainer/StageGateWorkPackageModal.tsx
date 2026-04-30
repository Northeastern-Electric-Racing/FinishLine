/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { WbsNumber } from 'shared';
import { FormInput } from './StageGateWorkPackageModalContainer';
import { wbsPipe } from '../../../utils/pipes';
import { FormControlLabel, FormHelperText, Radio, RadioGroup, Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';
import { DatePicker } from '@mui/x-date-pickers';

interface StageGateWorkPackageModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  confirmDone: yup.boolean().required(),
  dateCompleted: yup
    .date()
    .required('Date completed is required')
    .max(new Date(new Date().setHours(23, 59, 59, 999)), 'Date completed cannot be in the future')
});

const StageGateWorkPackageModal: React.FC<StageGateWorkPackageModalProps> = ({ wbsNum, modalShow, onHide, onSubmit }) => {
  const {
    reset,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      dateCompleted: new Date()
    }
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Stage Gate #${wbsPipe(wbsNum)}`}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="stage-gate-work-package-form"
    >
      <Controller
        name="confirmDone"
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Typography sx={{ paddingTop: 1 }}>Is everything done?</Typography>
            <ul style={{ marginTop: 0, marginBottom: 2 }}>
              <li>Updated confluence & documentation</li>
              <li>Creating any outstanding change requests</li>
              <li>Submitted all receipts to the procurement form</li>
              <li>Completed all Work Package expected activities</li>
              <li>Completed all Work Package deliverables</li>
              <li>Ensure rules compliance</li>
            </ul>
            <RadioGroup value={value} row onChange={onChange}>
              <FormControlLabel
                value={1}
                control={<Radio />}
                label="Yes"
                id={`stageGateWPForm-ConfirmDone-checkbox-yes`}
                aria-labelledby={`stageGateWPForm-ConfirmDone`}
              />
              <FormControlLabel
                value={0}
                control={<Radio />}
                label="No"
                id={`stageGateWPForm-ConfirmDone-checkbox-no`}
                aria-labelledby={`stageGateWPForm-ConfirmDone`}
              />
            </RadioGroup>
          </>
        )}
      />
      <Typography sx={{ mt: 2, mb: 0.5 }}>Date completed</Typography>
      <Controller
        name="dateCompleted"
        control={control}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            value={value}
            onChange={(newValue) => onChange(newValue ?? new Date())}
            disableFuture
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
                fullWidth: true,
                error: !!errors.dateCompleted
              }
            }}
          />
        )}
      />
      {errors.dateCompleted && <FormHelperText error>{errors.dateCompleted.message}</FormHelperText>}
    </NERFormModal>
  );
};

export default StageGateWorkPackageModal;
