import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { IconButton, TextField, Typography } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister, UseFormWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProjectFormInput } from '../pages/ProjectDetailPage/ProjectForm/ProjectForm';
import { Box } from '@mui/system';
import { NERButton } from './NERButton';
import { useGetAllDescriptionBulletTypes } from '../hooks/description-bullets.hooks';
import { DescriptionBulletRequiredType, getRequiredDescriptionBulletTypeNames } from '../utils/description-bullet.utils';
import { WorkPackageFormViewPayload } from '../pages/WorkPackageForm/WorkPackageFormView';

interface DescriptionBulletWithIndex {
  detail: string;
  type: string;
  index: number;
  id: number;
}

const DescriptionBulletsEditView: React.FC<{
  ls: FieldArrayWithId[];
  register: UseFormRegister<ProjectFormInput> | UseFormRegister<WorkPackageFormViewPayload>;
  watch: UseFormWatch<ProjectFormInput> | UseFormWatch<WorkPackageFormViewPayload>;
  append:
    | UseFieldArrayAppend<ProjectFormInput, 'descriptionBullets'>
    | UseFieldArrayAppend<WorkPackageFormViewPayload, 'descriptionBullets'>;
  remove: UseFieldArrayRemove;
  type: DescriptionBulletRequiredType;
}> = ({ ls, register, append, remove, watch, type }) => {
  watch = watch as UseFormWatch<WorkPackageFormViewPayload>;
  register = register as UseFormRegister<WorkPackageFormViewPayload>;
  append = append as UseFieldArrayAppend<WorkPackageFormViewPayload, 'descriptionBullets'>;

  const { isLoading, isError, error, data: descriptionBulletTypes } = useGetAllDescriptionBulletTypes();
  if (isLoading || !descriptionBulletTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const requiredDescriptionBulletNames = getRequiredDescriptionBulletTypeNames(descriptionBulletTypes, type);

  //   const descriptionBullets = watch('descriptionBullets');

  //   const currentDescriptionBulletNames = descriptionBullets.map((descriptionBullet) => descriptionBullet.type);

  /* Checks whether the link at the given index is of a required type and does not already exist  */
  //   const isRequired = (index: number) => {
  //     const descriptionBullet = watch(`descriptionBullets.${index}`);
  //     const { type } = descriptionBullet;
  //     return (
  //       requiredDescriptionBulletNames.includes(type) &&
  //       !currentDescriptionBulletNames.includes(type, currentDescriptionBulletNames.indexOf(type) + 1)
  //     );
  //   };

  const getSeparatedDescriptionBullets = () => {
    const descriptionBulletsSeparatedByType = new Map<string, DescriptionBulletWithIndex[]>();
    requiredDescriptionBulletNames.forEach((name) => {
      descriptionBulletsSeparatedByType.set(name, []);
    });

    ls.forEach((element, index) => {
      const descriptionBullet = watch(`descriptionBullets.${index}`);
      const { type } = descriptionBullet;
      if (!descriptionBulletsSeparatedByType.has(type)) {
        descriptionBulletsSeparatedByType.set(type, [{ ...descriptionBullet, index }]);
      }
      descriptionBulletsSeparatedByType.get(type)!.push({ ...descriptionBullet, index });
    });

    return Array.from(descriptionBulletsSeparatedByType);
  };

  return (
    <>
      {getSeparatedDescriptionBullets().map((descriptionBullets) => {
        return (
          <>
            <Typography variant="h6" key={descriptionBullets[0]}>
              {descriptionBullets[0]}
            </Typography>
            {descriptionBullets[1].map((descriptionBullet) => {
              return (
                <Box display={'flex'} alignItems={'center'} mt={'5px'}>
                  <TextField
                    required
                    fullWidth
                    autoComplete="off"
                    {...register(`descriptionBullets.${descriptionBullet.index}.detail`, { required: true })}
                  />
                  <Box sx={{ minWidth: '56px', height: '40px' }}>
                    <IconButton type="button" onClick={() => remove(descriptionBullet.index)} sx={{ mx: 1, my: 0 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
            <NERButton
              variant="contained"
              color="primary"
              onClick={() => append({ id: -1, detail: '', type: descriptionBullets[0] })}
              sx={{ my: 2, width: 'max-content' }}
            >
              + Add New Description Bullet
            </NERButton>
          </>
        );
      })}
    </>
  );
};

export default DescriptionBulletsEditView;
