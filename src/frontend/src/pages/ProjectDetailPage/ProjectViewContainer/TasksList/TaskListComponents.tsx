import { Autocomplete, TextField } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { User, UserPreview } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { fullNamePipe } from '../../../../utils/pipes';

export const TitleEdit = (params: GridRenderEditCellParams) => {
  const { id, value, field, setTitle } = params;
  const apiRef = useGridApiContext();

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // The new value entered by the user
    apiRef.current.setEditCellValue({ id, field, value: newValue });
    setTitle(newValue);
  };

  const handleRef = (element: HTMLDivElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
      input?.focus();
    }
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Enter a title"
      value={value}
      onChange={handleValueChange}
      ref={handleRef}
    />
  );
};

export const AssigneeEdit = (params: GridRenderEditCellParams) => {
  const { value, team, assignees, setAssignees } = params;

  if (!team) return <LoadingIndicator />;

  const userToAutocompleteOption = (user: User): { label: string; id: number } => {
    return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
  };

  const options = team.members
    .concat(team.leader)
    .sort((a: any, b: any) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const handleValueChange = (
    _: any,
    newValue: {
      label: string;
      id: number;
    }[]
  ) => {
    const teamMembers = team.members.concat(team.leader);
    const users = newValue.map((user) => teamMembers.find((o: any) => o.userId === user.id)!);
    setAssignees(users);
  };

  const handleRef = (element: HTMLDivElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
      input?.focus();
    }
  };

  return (
    <Autocomplete
      fullWidth
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterSelectedOptions
      multiple
      id="tags-standard"
      options={options}
      getOptionLabel={(option) => option.label}
      onChange={handleValueChange}
      value={assignees.map((u: UserPreview) => options.find((o: any) => o.id === u.userId)!)}
      // TODO: make assignees an array with a custom method
      renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select A User" />}
      ref={handleRef}
    />
  );
};
