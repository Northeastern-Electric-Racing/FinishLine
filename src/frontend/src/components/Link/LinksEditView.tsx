import { useAllLinkTypes } from '../../hooks/projects.hooks';
import LoadingIndicator from '../LoadingIndicator';
import ErrorPage from '../../pages/ErrorPage';
import { IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister, UseFormWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRequiredLinkTypeNames } from '../../utils/link.utils';
import { ProjectFormInput } from '../../pages/ProjectDetailPage/ProjectForm/ProjectForm';
import { Box } from '@mui/system';
import { NERButton } from '../NERButton';

const LinksEditView: React.FC<{
  ls: FieldArrayWithId[];
  register: UseFormRegister<ProjectFormInput>;
  watch: UseFormWatch<ProjectFormInput>;
  append: UseFieldArrayAppend<ProjectFormInput, 'links'>;
  remove: UseFieldArrayRemove;
}> = ({ ls, register, append, remove, watch }) => {
  const { isLoading, isError, error, data: linkTypes } = useAllLinkTypes();
  if (isLoading || !linkTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(linkTypes);

  const links = watch('links');

  const currentLinkTypeNames = links.map((link) => link.linkTypeName);

  /* Checks whether the link at the given index is of a required type and does not already exist  */
  const isRequired = (index: number) => {
    const link = watch(`links.${index}`);
    const { linkTypeName } = link;
    return (
      requiredLinkTypeNames.includes(linkTypeName) &&
      !currentLinkTypeNames.includes(linkTypeName, currentLinkTypeNames.indexOf(linkTypeName) + 1)
    );
  };

  const availableOptions = linkTypes.filter((linkType) => !currentLinkTypeNames.includes(linkType.name));

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '5px' }}>
            <Select
              {...register(`links.${i}.linkTypeName`, { required: true })}
              sx={{ minWidth: '200px', mr: '5px' }}
              disabled={isRequired(i)}
              value={watch(`links.${i}.linkTypeName`)}
            >
              {linkTypes.map((linkType) => (
                <MenuItem key={linkType.name} value={linkType.name} disabled={!availableOptions.includes(linkType)}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <TextField required fullWidth autoComplete="off" {...register(`links.${i}.url`, { required: true })} />
            <Box sx={{ minWidth: '56px', height: '40px' }}>
              {!isRequired(i) && (
                <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}
      {availableOptions.length > 0 && (
        <NERButton
          variant="contained"
          color="primary"
          onClick={() => append({ linkId: '-1', url: '', linkTypeName: '-1' })}
          sx={{ my: 2, width: 'max-content' }}
        >
          + Add New Link
        </NERButton>
      )}
    </>
  );
};

export default LinksEditView;
