import { Grid, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  title: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, title, register, append, remove }) => {
  return (
    <>
      <Typography variant="h5">{title}</Typography>
      <Grid item sx={{ my: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {ls.map((_element, i) => {
          return (
            <>
              <Grid item sx={{ display: 'flex', flexDirection: 'column', marginRight: '20px' }}>
                <Typography variant="body1" sx={{ color: 'Grey', marginBottom: '5px' }}>
                  {title} {i + 1}
                </Typography>
                <Grid item sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <TextField
                    required
                    autoComplete="off"
                    placeholder={'Enter ' + title}
                    sx={{ width: '340px' }}
                    multiline
                    maxRows={4}
                    {...register(`${name}.${i}.detail`)}
                  />
                  <IconButton
                    type="button"
                    onClick={() => remove(i)}
                    sx={{ mx: 1, my: 0, color: 'red', marginLeft: '15px', borderRadius: '4px', outline: 'solid' }}
                  >
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
        color="primary"
        onClick={() => append({ bulletId: -1, detail: '' })}
        sx={{ width: 'max-content', marginBottom: '20px' }}
      >
        + Add {title}
      </Button>
    </>
  );
};

export default ReactHookEditableList;
