/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from './ReviewChangeRequest';
import { ChangeRequest, WorkPackage } from 'shared';
import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Breakpoint,
  IconButton
} from '@mui/material';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import CloseIcon from '@mui/icons-material/Close';
import ChangeRequestBlockerWarning from '../../components/ChangeRequestBlockerWarning';

interface ReviewChangeRequestViewProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
  blockingWorkPackages: WorkPackage[];
}

const schema = yup.object().shape({
  reviewNotes: yup.string().optional(),
  accepted: yup.boolean().required()
});

const ReviewChangeRequestsView: React.FC<ReviewChangeRequestViewProps> = ({
  cr,
  modalShow,
  onHide,
  onSubmit,
  blockingWorkPackages
}: ReviewChangeRequestViewProps) => {
  const [selectedTimelineImpact] = useState(-1);
  const [showWarning, setShowWarning] = useState(false);
  const { register, setValue, getFieldState, reset, handleSubmit, control, getValues } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  const handleAcceptDeny = (value: boolean) => {
    getFieldState('accepted') ? setValue('accepted', value) : register('accepted', { value });
  };

  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ reviewNotes: '' });
  };

  const dialogWidth: Breakpoint = 'md';

  const renderModal: () => JSX.Element = () => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.identifier}`}</DialogTitle>
        <DialogContent>
          <form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
            <Controller
              name="reviewNotes"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>{'Additional Comments (optional)'}</Typography>
                  <TextField
                    multiline
                    rows={4}
                    id="reviewNotes-input"
                    autoComplete="off"
                    onChange={onChange}
                    value={value}
                    fullWidth
                  />
                </>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <NERFailButton
            type="submit"
            form="review-notes-form"
            variant="contained"
            sx={{ mx: 1 }}
            onClick={() => handleAcceptDeny(false)}
          >
            Deny
          </NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            form="review-notes-form"
            sx={{ mx: 1 }}
            onClick={() => handleAcceptDeny(true)}
          >
            Accept
          </NERSuccessButton>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      {renderModal()}
      {
        <ChangeRequestBlockerWarning
          duration={selectedTimelineImpact}
          onHide={() => setShowWarning(false)}
          open={showWarning}
          onSubmit={() => onSubmitWrapper(getValues())}
          blockingWorkPackages={blockingWorkPackages}
        />
      }
    </>
  );
};

export default ReviewChangeRequestsView;
