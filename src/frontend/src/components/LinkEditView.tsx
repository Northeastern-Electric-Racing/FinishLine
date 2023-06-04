import { useAllLinkTypes } from '../hooks/projects.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { Button, Grid, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';

const LinkEditView: React.FC<{
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
}> = ({ name, ls, register, append, remove }) => {
  const { isLoading, isError, error, data } = useAllLinkTypes();
  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center', mb: '5px' }}>
            <Select
              {...register(`${name}.${i}.linkTypeId`)}
              sx={{ minWidth: '200px', mr: '5px' }}
            >
              {data.map((linkType) => (
                <MenuItem key={linkType.linkTypeId} value={linkType.linkTypeId}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <TextField required fullWidth autoComplete="off" {...register(`${name}.${i}.url`)} />
            <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}

      <Button
        variant="contained"
        color="success"
        onClick={() => append({ bulletId: '-1', url: '', linkTypeId: '-1' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + Add New Bullet
      </Button>
    </>
  );
};

export default LinkEditView;
