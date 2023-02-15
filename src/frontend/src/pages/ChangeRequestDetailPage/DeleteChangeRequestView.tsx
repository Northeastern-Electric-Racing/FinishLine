/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import NERSuccessButton from '../../components/NERSuccessButton';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import NERFailButton from '../../components/NERFailButton';
import { DeleteChangeRequestInputs } from './DeleteChangeRequest';

interface DeleteChangeRequestViewProps {
  changeRequest: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteChangeRequestInputs) => Promise<void>;
}

const DeleteChangeRequestView: React.FC<DeleteChangeRequestViewProps> = ({ changeRequest, modalShow, onHide, onSubmit }) => {
  const changeRequestIdTester = (crId: string | undefined) => crId !== undefined && crId === changeRequest.crId.toString();

  const schema = yup.object().shape({
    crId: yup.string().required().test('cr-id-test', 'Change Request ID does not match', changeRequestIdTester)
  });

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      crId: ''
    }
  });

  const onSubmitWrapper = async (data: DeleteChangeRequestInputs) => {
    await onSubmit(data);
  };

  return (
    <Dialog fullWidth maxWidth="md" open={modalShow} onClose={onHide}>
      <DialogTitle className={'font-weight-bold'}>{`Delete Change Request #${changeRequest.crId}`}</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete Change Request #{changeRequest.crId}?</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
        <form
          id="delete-cr-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmitWrapper)(e);
          }}
        >
          <Controller
            name="crId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <Typography
                  sx={{
                    paddingTop: 1,
                    paddingBottom: 1
                  }}
                >
                  To confirm deletion, please type in the ID number of this Change Request.
                </Typography>
                <TextField
                  required
                  variant="outlined"
                  id="crId-input"
                  type="number"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  fullWidth
                  sx={{ width: 1 }}
                  error={!!errors.crId}
                  placeholder="Enter Change Request ID here"
                  helperText={errors.crId?.message}
                />
              </>
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <NERSuccessButton variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERSuccessButton>
        <NERFailButton variant="contained" type="submit" form="delete-cr-form" sx={{ mx: 1 }}>
          Delete
        </NERFailButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteChangeRequestView;
