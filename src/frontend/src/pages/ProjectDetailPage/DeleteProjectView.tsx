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
import NERFormModal from '../../components/NERFormModal';

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
    reset,
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
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={`Delete Project #${wbsPipe(project)}`}
      reset={() => reset({ wbsNum: '' })}
      submitText="Delete"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmitWrapper}
      formId="delete-wp-form"
      disabled={!isValid}
      showCloseButton
    >
      <Typography sx={{ marginBottom: '1rem' }}>Are you sure you want to delete Project #{wbsPipe(project)}?</Typography>
      <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
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
    </NERFormModal>
  );
};

export default DeleteProjectView;
