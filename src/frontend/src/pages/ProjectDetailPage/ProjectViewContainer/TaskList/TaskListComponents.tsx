/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { User, UserPreview } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { fullNamePipe } from '../../../../utils/pipes';
import { makeTeamList } from '../../../../utils/teams.utils';

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

export const PriorityEdit = (params: GridRenderEditCellParams) => {
  const { id, value, field, setPriority } = params;
  const apiRef = useGridApiContext();

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // The new value entered by the user
    apiRef.current.setEditCellValue({ id, field, value: newValue });
    setPriority(newValue);
  };

  const handleRef = (element: HTMLDivElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
      input?.focus();
    }
  };

  return (
    <TextField fullWidth variant="outlined" select value={value} onChange={handleValueChange} ref={handleRef}>
      <MenuItem value={'LOW'}>Low</MenuItem>
      <MenuItem value={'MEDIUM'}>Medium</MenuItem>
      <MenuItem value={'HIGH'}>High</MenuItem>
    </TextField>
  );
};

export const DeadlineEdit = (params: GridRenderEditCellParams) => {
  const { id, value, field, setDeadline } = params;
  const apiRef = useGridApiContext();

  const handleValueChange = (value: unknown, keyboardInputValue?: string | undefined) => {
    const newValue = value; // The new value entered by the user
    apiRef.current.setEditCellValue({ id, field, value: newValue });
    setDeadline(newValue);
  };

  const handleRef = (element: HTMLDivElement) => {
    if (element) {
      const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
      input?.focus();
    }
  };

  return (
    <DatePicker
      value={value}
      onChange={handleValueChange}
      ref={handleRef}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
    />
  );
};

export const AssigneeEdit = (params: GridRenderEditCellParams) => {
  const { value, team, assignees, setAssignees } = params;

  if (!team) return <LoadingIndicator />;

  const userToAutocompleteOption = (user: User): { label: string; id: number } => {
    return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
  };

  const options = makeTeamList(team)
    .sort((a: any, b: any) => (a.firstName > b.firstName ? 1 : -1))
    .map(userToAutocompleteOption);

  const handleValueChange = (
    _: any,
    newValue: {
      label: string;
      id: number;
    }[]
  ) => {
    const teamMembers = makeTeamList(team);
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
