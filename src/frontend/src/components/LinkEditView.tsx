import { useAllLinkTypes } from '../hooks/projects.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { Button, Grid, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { LinkCreateArgs } from 'shared';
import { getRequiredLinkTypeNames } from '../utils/project.utils';

const LinksEditView: React.FC<{
  ls: FieldArrayWithId[];
  register: UseFormRegister<{
    name: string;
    budget: number;
    summary: string;
    crId: string;
    rules: { rule: string }[];
    links: LinkCreateArgs[];
    goals: { bulletId: number; detail: string }[];
    features: { bulletId: number; detail: string }[];
    constraints: { bulletId: number; detail: string }[];
  }>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  links: LinkCreateArgs[];
}> = ({ ls, register, append, remove, links }) => {
  const { isLoading, isError, error, data: linkTypes } = useAllLinkTypes();
  if (isLoading || !linkTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(linkTypes);

  const currentLinkTypeNames = links.map((link) => link.linkTypeName);

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center', mb: '5px' }}>
            <Select
              {...register(`links.${i}.linkTypeName`, { required: true })}
              sx={{ minWidth: '200px', mr: '5px' }}
              defaultValue={links[i].linkTypeName}
              disabled={
                requiredLinkTypeNames.includes(links[i].linkTypeName) &&
                !currentLinkTypeNames.includes(links[i].linkTypeName)
              }
            >
              {linkTypes.map((linkType) => (
                <MenuItem key={linkType.name} value={linkType.name}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <TextField required fullWidth autoComplete="off" {...register(`links.${i}.url`, { required: true })} />
            {i > 2 && (
              <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
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
