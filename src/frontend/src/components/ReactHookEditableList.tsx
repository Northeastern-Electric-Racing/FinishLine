import { Grid, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, register, append, remove }) => {
  return (
    <>
      <Grid item sx={{ my: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {ls.map((_element, i) => {
          const formattedName = name
            .split(/(?=[A-Z])/)
            .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
            .join(' ');

          const placeholderText = `Enter ${formattedName} ...`;

          return (
            <>
              <Grid item sx={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
                <Typography variant="body1" sx={{ color: 'lightGrey', marginLeft: '7px' }}>
                  {formattedName} {i + 1}
                </Typography>
                <Grid item sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <TextField
                    required
                    autoComplete="off"
                    placeholder={placeholderText}
                    sx={{ width: '340px' }}
                    multiline
                    {...register(`${name}.${i}.detail`)}
                  />
                  <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </>
          );
        })}
      </Grid>
      <Button
        variant="contained"
        color="success"
        onClick={() => append({ bulletId: -1, detail: '' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + Add New Bullet
      </Button>
    </>
  );
};

export default ReactHookEditableList;
