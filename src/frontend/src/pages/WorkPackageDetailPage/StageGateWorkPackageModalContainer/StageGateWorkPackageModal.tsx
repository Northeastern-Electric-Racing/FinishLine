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
import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import NERFormModal from '../../../components/NERFormModal';

interface StageGateWorkPackageModalProps {
  wbsNum: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  confirmDone: yup.boolean().required()
});

const StageGateWorkPackageModal: React.FC<StageGateWorkPackageModalProps> = ({ wbsNum, modalShow, onHide, onSubmit }) => {
  const { reset, handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema)
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
      <div className={'px-4'}>
        <Controller
          name="confirmDone"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <>
              {/* TODO: slide deck changed to confluence in frontend - needs to be updated in the backend */}
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
      </div>
    </NERFormModal>
  );
};

export default StageGateWorkPackageModal;
