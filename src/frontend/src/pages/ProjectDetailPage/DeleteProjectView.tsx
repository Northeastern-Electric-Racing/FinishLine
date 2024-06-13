/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, wbsPipe } from 'shared';
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
import ReactHookTextField from '../../components/ReactHookTextField';
import CloseIcon from '@mui/icons-material/Close';
import { DeleteProjectInputs } from './DeleteProject';

interface DeleteProjectViewProps {
  project: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteProjectInputs) => Promise<void>;
}

const DeleteProjectView: React.FC<DeleteProjectViewProps> = ({ project, modalShow, onHide, onSubmit }) => {
  const projectWbsNumTester = (wbsNum: string | undefined) => wbsNum !== undefined && wbsNum === wbsPipe(project);

  const schema = yup.object().shape({
    wbsNum: yup
      .string()
      .required('Project WBS is required')
      .test('project-wbs-test', 'Project WBS does not match', projectWbsNumTester)
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: ''
    },
    mode: 'onChange'
  });

  const onSubmitWrapper = async (data: DeleteProjectInputs) => {
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
      >{`Delete Project #${wbsPipe(project)}`}</DialogTitle>
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
        <Typography sx={{ marginBottom: '1rem' }}>Are you sure you want to delete Project #{wbsPipe(project)}?</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
        <form
          id="delete-project-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmitWrapper)(e);
          }}
        >
          <FormControl>
            <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
              To confirm deletion, please type in the WBS number of this Project.
            </FormLabel>
            <ReactHookTextField
              control={control}
              name="wbsNum"
              errorMessage={errors.wbsNum}
              placeholder="Enter Project WBS here"
              sx={{ width: 1 }}
              type="string"
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <NERSuccessButton variant="contained" sx={{ mx: 1 }} onClick={onHide}>
          Cancel
        </NERSuccessButton>
        <NERFailButton variant="contained" type="submit" form="delete-project-form" sx={{ mx: 1 }} disabled={!isValid}>
          Delete
        </NERFailButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectView;
