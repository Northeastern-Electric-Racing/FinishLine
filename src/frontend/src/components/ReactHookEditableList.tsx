import { Grid, Button, IconButton, TextField, InputLabel } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';
import { Box } from '@mui/system';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  bulletName?: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, bulletName, register, append, remove }) => {
  return (
    <>
      <Grid container columnSpacing={{ xs: 4, sm: 2, md: 3 }}>
        {ls.map((_element, i) => {
          const formattedName = name
            .split(/(?=[A-Z])/)
            .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
            .join(' ');

          return (
            <Grid item xs={12} md={6} lg={4}>
              <InputLabel sx={{ marginBottom: '5px' }}>
                {bulletName ? `${bulletName}` : formattedName} {i + 1}
              </InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'start', marginBottom: '20px' }}>
                <TextField
                  required
                  autoComplete="off"
                  placeholder={'Enter ' + formattedName + ' . . .'}
                  sx={{ width: 12 / 12 }}
                  multiline
                  maxRows={3}
                  {...register(`${name}.${i}.detail`)}
                />
                <IconButton
                  type="button"
                  onClick={() => remove(i)}
                  sx={{ mx: 1, color: 'red', marginLeft: '15px', borderRadius: '4px', outline: 'solid' }}
                >
                  <DeleteForeverOutlinedIcon />
                </IconButton>
              </Box>
            </Grid>
          );
        })}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={() => append({ bulletId: -1, detail: '' })}
        sx={{ width: 'max-content', marginBottom: '40px' }}
      >
        {bulletName ? `+ Add ${bulletName}` : '+ Add new bullet'}
      </Button>
    </>
  );
};

export default ReactHookEditableList;
