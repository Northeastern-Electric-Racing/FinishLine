import { Grid, Button, IconButton, TextField, Typography } from '@mui/material';
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
            <Typography>
              <TextField required autoComplete="off" sx={{ width: 9 / 10 }} {...register(`${name}.${i}.detail`)} />
              <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
                <DeleteIcon />
              </IconButton>
            </Typography>
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
