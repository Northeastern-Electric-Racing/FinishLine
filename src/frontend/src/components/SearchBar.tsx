import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';

interface SearchBarProps {
  placeholder?: string;
  searchText: string;
  setSearchText: (searchText: string) => void;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  height: '2.5rem',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    width: '90%'
  },
  display: 'flex',
  alignItems: 'center'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '56px',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  height: '56px',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width')
  }
}));

export const SearchBar = ({ placeholder = 'Search...', searchText, setSearchText }: SearchBarProps) => {
  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder={placeholder}
        inputProps={{ 'aria-label': 'search' }}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />
      {searchText.length > 0 ? (
        <IconButton onClick={() => setSearchText('')}>
          <Close />
        </IconButton>
      ) : (
        <Box minWidth="40px" minHeight="40px" />
      )}
    </Search>
  );
};
