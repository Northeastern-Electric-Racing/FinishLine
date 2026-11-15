/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import {
  Alert,
  Checkbox,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { ProjectDetail } from 'shared';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { useEditProjectTeams } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import NERModal from '../../../components/NERModal';

interface AssignToTeamsProps {
  modalShow: boolean;
  handleClose: () => void;
  project: ProjectDetail;
}

const AssignToTeams: React.FC<AssignToTeamsProps> = ({ modalShow, handleClose, project }) => {
  const { mutateAsync: mutateAsyncEditProjectTeams } = useEditProjectTeams(project.wbsNum);
  const { data: allTeams, isLoading: allTeamsIsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();
  const [checked, setChecked] = useState<string[]>(() => project.teams.map((team) => team.teamId));
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await mutateAsyncEditProjectTeams(checked);
      toast.success(res.message);
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleHide = () => {
    if (!isSaving) handleClose();
  };

  const handleToggle = (id: string) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <NERModal
      open={modalShow}
      title="Assign to Teams"
      onHide={handleHide}
      onSubmit={handleSave}
      submitText="Save"
      disabled={isSaving || allTeamsIsLoading || teamsIsError}
      paperProps={{ width: '33vw', maxWidth: 'none' }}
    >
      {teamsIsError ? (
        <Alert severity="error">{teamsError?.message ?? 'Failed to load teams.'}</Alert>
      ) : allTeamsIsLoading || !allTeams ? (
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
    </NERModal>
  );
};

export default AssignToTeams;
