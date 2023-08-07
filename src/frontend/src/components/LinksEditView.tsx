import { useAllLinkTypes } from '../hooks/projects.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { Button, Grid, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister, UseFormWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRequiredLinkTypeNames } from '../utils/project.utils';
import { ProjectEditFormInput } from '../pages/ProjectDetailPage/ProjectEdit/ProjectEditContainer';

const LinksEditView: React.FC<{
  ls: FieldArrayWithId[];
  register: UseFormRegister<ProjectEditFormInput>;
  watch: UseFormWatch<ProjectEditFormInput>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
}> = ({ ls, register, append, remove, watch }) => {
  const { isLoading, isError, error, data: linkTypes } = useAllLinkTypes();
  if (isLoading || !linkTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(linkTypes);

  const links = watch('links');

  const currentLinkTypeNames = links.map((link) => link.linkTypeName);

  const isRequired = (index: number) => {
    const link = watch(`links.${index}`);
    const { linkTypeName } = link;
    return (
      requiredLinkTypeNames.includes(linkTypeName) &&
      !currentLinkTypeNames.includes(linkTypeName, currentLinkTypeNames.indexOf(linkTypeName) + 1)
    );
  };

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center', mb: '5px' }}>
            <Select
              {...register(`links.${i}.linkTypeName`, { required: true })}
              sx={{ minWidth: '200px', mr: '5px' }}
              defaultValue={links[i].linkTypeName}
              disabled={isRequired(i)}
            >
              {linkTypes.map((linkType) => (
                <MenuItem key={linkType.name} value={linkType.name}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <TextField required fullWidth autoComplete="off" {...register(`links.${i}.url`, { required: true })} />
            {!isRequired(i) && (
              <IconButton
                type="button"
                onClick={() => {
                  console.log(i);
                  remove(i);
                }}
                sx={{ mx: 1, my: 0 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
        );
      })}
      <Button
        variant="contained"
        color="success"
        onClick={() => append({ linkId: '-1', url: '', linkTypeName: '-1' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + Add New Bullet
      </Button>
    </>
  );
};

export default LinksEditView;
