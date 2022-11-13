import { Grid, Button, TextField } from '@mui/material';
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
          <Grid item>
            <TextField required sx={{ width: 9 / 10 }} {...register(`${name}.${i}.detail`)} />
            <Button type="button" onClick={() => remove(i)}>
              X
            </Button>
          </Grid>
        );
      })}
      <Button variant="contained" color="success" onClick={() => append({ bulletId: -1, detail: '' })}>
        New Goal
      </Button>
    </>
  );
};

export default ReactHookEditableList;
