import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid, IconButton } from '@mui/material';

const FavoriteProjectButton = () => {
  const onClick = async () => {
    try {
      //pops up a warning box
    } catch (e) {
      //error
    }
  };

  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: 'Red',
        width: 'auto', // Set width to auto to fit the content
        height: 'auto', // Set height to auto to fit the content
        padding: 0.1,
        borderRadius: '5px' // to make it circular
      }}
    >
      <Box
        sx={{
          border: '2px solid red',
          borderRadius: '5px', // to make it circular
          width: '24px',
          height: '24px',
          display: 'flex', // Set display to flex
          justifyContent: 'center', // Align content horizontally center
          alignItems: 'center' // Align content vertically center
        }}
      >
        <DeleteIcon sx={{ fontSize: 'small' }} />
      </Box>
    </IconButton>
  );
};

export default FavoriteProjectButton;
