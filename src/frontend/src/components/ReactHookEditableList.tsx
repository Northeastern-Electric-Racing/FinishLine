import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove } from 'react-hook-form';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: any;
  append: any;
  remove: UseFieldArrayRemove;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, register, append, remove }) => {
  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField required autoComplete="off" sx={{ width: 9 / 10 }} {...register(`${name}.${i}.detail`)} />
            <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}
      <Button variant="contained" color="success" onClick={() => append({ bulletId: -1, detail: '' })} sx={{ mt: 2 }}>
        + Add New Bullet
      </Button>
    </>
  );
};

export default ReactHookEditableList;
