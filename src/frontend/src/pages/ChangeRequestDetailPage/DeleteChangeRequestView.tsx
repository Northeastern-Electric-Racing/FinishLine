/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest } from 'shared';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import NERSuccessButton from '../../components/NERSuccessButton';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import NERFailButton from '../../components/NERFailButton';
import { DeleteChangeRequestInputs } from './DeleteChangeRequest';
import ReactHookTextField from '../../components/ReactHookTextField';
import CloseIcon from '@mui/icons-material/Close';

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
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      crId: ''
    },
    mode: 'onChange'
  });

  const onSubmitWrapper = async (data: DeleteChangeRequestInputs) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={modalShow} onClose={onHide}>
      <DialogTitle
        className="font-weight-bold"
        sx={{
          '&.MuiDialogTitle-root': {
            padding: '1rem 1.5rem 0'
          }
        }}
      >{`Delete Change Request #${changeRequest.crId}`}</DialogTitle>
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
      <DialogContent
        sx={{
          '&.MuiDialogContent-root': {
            padding: '1rem 1.5rem'
          }
        }}
      >
        <Typography sx={{ marginBottom: '1rem' }}>
          Are you sure you want to delete Change Request #{changeRequest.crId}?
        </Typography>
        <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
        <form
          id="delete-cr-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmitWrapper)(e);
          }}
        >
          <FormControl>
            <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
              To confirm deletion, please type in the ID number of this Change Request.
            </FormLabel>
            <ReactHookTextField
              control={control}
              name="crId"
              errorMessage={errors.crId}
              placeholder="Enter Change Request ID here"
              sx={{ width: 1 }}
              type="number"
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <NERSuccessButton variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERSuccessButton>
        <NERFailButton variant="contained" type="submit" form="delete-cr-form" sx={{ mx: 1 }} disabled={!isValid}>
          Delete
        </NERFailButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteChangeRequestView;
