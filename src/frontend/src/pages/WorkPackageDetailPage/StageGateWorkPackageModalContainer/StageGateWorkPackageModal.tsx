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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';

interface StageGateWorkPackageModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  leftoverBudget: yup.number().required().min(0),
  confirmDone: yup.boolean().required()
});

const StageGateWorkPackageModal: React.FC<StageGateWorkPackageModalProps> = ({ wbsNum, modalShow, onHide, onSubmit }) => {
  const { reset, handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ leftoverBudget: 0, confirmDone: false });
  };

  return (
    <Dialog open={modalShow} onClose={onHide}>
      <DialogTitle>{`Stage Gate #${wbsPipe(wbsNum)}`}</DialogTitle>
      <DialogContent>
        <form id={'stage-gate-work-package-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
          <div className={'px-4'}>
            <Controller
              name="leftoverBudget"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography sx={{ paddingTop: 1, paddingBottom: 1 }}>{'Leftover Budget'}</Typography>
                  <TextField
                    required
                    variant="outlined"
                    autoComplete="off"
                    onChange={onChange}
                    value={value}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ paddingRight: 1 }}>$</Typography>
                    }}
                  />
                </>
              )}
            />

            <Controller
              name="confirmDone"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography sx={{ paddingTop: 1 }}>Is everything done?</Typography>
                  <ul style={{ marginTop: 0, marginBottom: 2 }}>
                    <li>Updated slide deck & documentation</li>
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
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <NERFailButton form="stage-gate-work-package-form" onClick={onHide}>
          Cancel
        </NERFailButton>
        <NERSuccessButton type="submit" form="stage-gate-work-package-form">
          Submit
        </NERSuccessButton>
      </DialogActions>
    </Dialog>
  );
};

export default StageGateWorkPackageModal;
