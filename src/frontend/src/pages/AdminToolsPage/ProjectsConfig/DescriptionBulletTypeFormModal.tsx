import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Switch, Grid } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '@mui/material/styles';
import { DescriptionBulletType, DescriptionBulletTypeCreatePayload } from 'shared';

interface DescriptionBulletTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: DescriptionBulletType;
  onSubmit: (data: DescriptionBulletTypeCreatePayload) => void;
  descriptionBulletTypes: DescriptionBulletType[];
}

const DescriptionBulletTypeFormModal = ({
  open,
  handleClose,
  defaultValues,
  onSubmit,
  descriptionBulletTypes
}: DescriptionBulletTypeFormModalProps) => {
  const toast = useToast();
  const creatingNew = defaultValues === undefined;

  const uniqueDescriptionBulletTypeTest = (name?: string) =>
    !creatingNew || (!!name && descriptionBulletTypes && !descriptionBulletTypes.map((v) => v.name).includes(name));

  const schema = yup.object().shape({
    name: yup
      .string()
      .required('DescriptionBulletType Name is Required')
      .test(
        'unique-descriptionBulletType-test',
        'DescriptionBulletType name must be unique',
        uniqueDescriptionBulletTypeTest
      ),
    workPackageRequired: yup.boolean().required('Required field must be specified'),
    projectRequired: yup.boolean().required('Required field must be specified')
  });

  const theme = useTheme();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageRequired: defaultValues?.workPackageRequired ?? false,
      projectRequired: defaultValues?.projectRequired ?? false
    }
  });

  const onFormSubmit = async (data: DescriptionBulletTypeCreatePayload) => {
    try {
      onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Description Bullet Type' : 'Create Description Bullet Type'}
      reset={() => reset({ name: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-descriptionBulletType-form' : 'create-descriptionBulletType-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Description Bullet Type Name</FormLabel>
            <ReactHookTextField name="name" control={control} disabled={!creatingNew} />
            <FormHelperText error>{errors.name?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ '&.Mui-focused': { color: theme.palette.text.secondary } }}>Work Package Required</FormLabel>
            <Controller
              name="workPackageRequired"
              control={control}
              render={({ field }) => <Switch {...field} checked={field.value} />}
            />
            <FormHelperText error>{errors.workPackageRequired?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth sx={{ display: 'flex' }}>
            <FormLabel sx={{ '&.Mui-focused': { color: theme.palette.text.secondary } }}>Project Required</FormLabel>
            <Controller
              name="projectRequired"
              control={control}
              render={({ field }) => <Switch {...field} checked={field.value} />}
            />
            <FormHelperText error>{errors.projectRequired?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default DescriptionBulletTypeFormModal;