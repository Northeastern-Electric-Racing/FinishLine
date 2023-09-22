import { Grid, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';
import { Box } from '@mui/system';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  addMessage: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({
  name,
  ls,
  register,
  append,
  remove,
  addMessage = '+ ADD NEW BULLET'
}) => {
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => append({ bulletId: -1, detail: '' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        {addMessage}
      </Button>
      {ls.map((_element, i) => {
        return (
          //<Grid item sx={{ display: 'grid', alignItems: 'center' }}>
          <Box sx={{ width: 10 / 10 }}>
            <TextField required autoComplete="off" sx={{ width: 2 / 10 }} {...register(`${name}.${i}.detail`)} />
            <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      })}
    </>
  );
};

export default ReactHookEditableList;
