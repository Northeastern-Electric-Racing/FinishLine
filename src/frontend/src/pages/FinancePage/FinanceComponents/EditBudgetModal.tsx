import { FormControl, FormLabel, FormHelperText, MenuItem, Select, OutlinedInput } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const schema = yup.object().shape({
  project: yup.string().required('Project is required'),
  account: yup.string().required('Account is required'),
  amount: yup.number().typeError('Amount must be a number').required('Amount is required')
});

interface EditBudgetModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: any) => void;
  defaultValues: any;
}

const EditBudgetModal = ({ open, handleClose, defaultValues, onSubmit }: EditBudgetModalProps) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      project: defaultValues?.project || '',
      account: defaultValues?.account || '',
      amount: defaultValues?.amount ?? ''
    }
  });

  const {
    isLoading: projectsIsLoading,
    data: allProjects,
    isError: projectsIsError,
    error: projectsError
  } = useAllProjects();

  const {
    isLoading: indexCodesIsLoading,
    isError: indexCodesIsError,
    error: indexCodesError,
    data: indexCodes
  } = useGetAllIndexCodes();

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  if (projectsIsLoading || indexCodesIsLoading) return <LoadingIndicator />;
  if (projectsIsError) return <ErrorPage message={projectsError?.message} />;
  if (indexCodesIsError) return <ErrorPage message={indexCodesError?.message} />;

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title="Edit Budget"
      reset={() => reset({ project: '', account: '', amount: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleFormSubmit}
      formId="edit-budget-form"
      showCloseButton
    >
      <FormControl sx={{ width: 1 }}>
        <FormLabel>Project</FormLabel>
        <Controller
          name="project"
          control={control}
          render={({ field }) => (
            <Select {...field} displayEmpty input={<OutlinedInput />} sx={{ backgroundColor: '#444', color: '#fff' }}>
              <MenuItem value="" disabled>
                Select a project to allocate to.{' '}
              </MenuItem>
              {allProjects?.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors.project?.message}</FormHelperText>
      </FormControl>

      <FormControl sx={{ width: 1 }}>
        <FormLabel>Account</FormLabel>
        <Controller
          name="account"
          control={control}
          render={({ field }) => (
            <Select {...field} displayEmpty input={<OutlinedInput />} sx={{ backgroundColor: '#444', color: '#fff' }}>
              <MenuItem value="" disabled>
                Select an index code.
              </MenuItem>
              {indexCodes?.map((indexCode) => (
                <MenuItem key={indexCode.indexCodeId} value={indexCode.indexCodeId}>
                  {codeAndRefundSourceName(indexCode)}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors.account?.message}</FormHelperText>
      </FormControl>

      {/* Amount Field */}
      <FormControl sx={{ width: 1 }}>
        <FormLabel>Amount</FormLabel>
        <ReactHookTextField name="amount" placeholder="Enter new amount." control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.amount?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default EditBudgetModal;
