/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Project } from 'shared';
import { useAllTeams } from '../../../hooks/teams.hooks';

interface AssignToTeamsProps {
  modalShow: boolean;
  handleClose: () => void;
  onSubmit?: (checkedIds: string[]) => Promise<void>;
  project: Project;
}

const AssignToTeams: React.FC<AssignToTeamsProps> = ({ modalShow, handleClose, onSubmit, project }) => {
  const { data: allTeams, isLoading: allTeamsIsLoading } = useAllTeams();
  const [checked, setChecked] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (modalShow) {
      setChecked(project.teams.map((team) => team.teamId));
    }
  }, [modalShow, project.teams]);

  const handleToggle = (id: string) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSubmit?.(checked);
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={modalShow} onClose={isSaving ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign to Teams</DialogTitle>
      <DialogContent dividers>
        {allTeamsIsLoading || !allTeams ? (
          <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
        ) : (
          <List disablePadding>
            {allTeams.map((team) => {
              const labelId = `assign-team-label-${team.teamId}`;

              return (
                <ListItem key={team.teamId} disablePadding>
                  <ListItemButton onClick={() => handleToggle(team.teamId)} disabled={isSaving} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked.includes(team.teamId)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={team.teamName} secondary={team.teamType?.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving || allTeamsIsLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignToTeams;
