import { TableRow, TableCell, Box, Typography, Icon, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import CreateTeamTypeFormModal from './CreateTeamTypeFormModal';
import { TeamType } from 'shared';
import EditTeamTypeFormModal from './EditTeamTypeFormModal';
import { useAllTeamTypes, useSetTeamTypeImage } from '../../../hooks/team-types.hooks';
import { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useToast } from '../../../hooks/toasts.hooks';

const TeamTypeTable: React.FC = () => {
  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();

  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [editingTeamType, setEditingTeamType] = useState<TeamType | undefined>(undefined);
  const [addedImages, setAddedImages] = useState<Record<string, File | undefined>>({});
  const toast = useToast();

  const { mutateAsync: setTeamTypeImage } = useSetTeamTypeImage();

  if (!teamTypes || teamTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (teamTypesIsError) {
    return <ErrorPage message={teamTypesError?.message} />;
  }

  const onSubmitTeamTypeImage = async (teamTypeId: string) => {
    const image = addedImages[teamTypeId];
    if (image) {
      await setTeamTypeImage({ file: image, id: teamTypeId });
      toast.success('Image uploaded successfully!', 5000);
      setAddedImages((prev) => ({ ...prev, [teamTypeId]: undefined }));
    } else {
      toast.error('No image selected for upload.', 5000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, teamTypeId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size < 1000000) {
        setAddedImages((prev) => ({ ...prev, [teamTypeId]: file }));
      } else {
        toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
      }
    }
  };

  const teamTypesTableRows = teamTypes.map((teamType) => (
    <TableRow>
      <TableCell onClick={() => setEditingTeamType(teamType)} sx={{ cursor: 'pointer', border: '2px solid black' }}>
        {teamType.name}
      </TableCell>
      <TableCell
        onClick={() => setEditingTeamType(teamType)}
        sx={{ cursor: 'pointer', border: '2px solid black', verticalAlign: 'middle' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon>{teamType.iconName}</Icon>
          <Typography variant="body1" sx={{ marginLeft: 1 }}>
            {teamType.iconName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell
        onClick={() => setEditingTeamType(teamType)}
        sx={{ cursor: 'pointer', border: '2px solid black', verticalAlign: 'middle' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ marginLeft: 1 }}>
            {teamType.description}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>
        {teamType.imageFileId && (
          <Box
            component="img"
            src={teamType.imageFileId}
            alt="Image Preview"
            sx={{ maxWidth: '100%', maxHeight: '200px', mb: 2 }}
          />
        )}
        <Button
          variant="contained"
          color="success"
          component="label"
          startIcon={<FileUploadIcon />}
          sx={{
            width: 'fit-content',
            textTransform: 'none',
            mt: '9.75px'
          }}
        >
          Upload
          <input
            onChange={(e) => {
              console.log(e);
              handleFileChange(e, teamType.teamTypeId);
            }}
            type="file"
            id="team-type-image"
            accept="image/*"
            name="addedImage"
            hidden
          />
        </Button>
        {addedImages[teamType.teamTypeId] && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">{addedImages[teamType.teamTypeId]?.name}</Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setAddedImages((prev) => ({ ...prev, [teamType.teamTypeId]: undefined }))}
              sx={{ textTransform: 'none', mt: 1, mr: 1 }}
            >
              Remove
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => onSubmitTeamTypeImage(teamType.teamTypeId)}
              sx={{
                width: 'fit-content',
                textTransform: 'none',
                mt: 1
              }}
            >
              Submit
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateTeamTypeFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {editingTeamType && (
        <EditTeamTypeFormModal
          open={!!editingTeamType}
          handleClose={() => setEditingTeamType(undefined)}
          teamType={editingTeamType}
        />
      )}
      <AdminToolTable
        columns={[{ name: 'Team Type Name' }, { name: 'Icon' }, { name: 'Description' }, { name: 'Image' }]}
        rows={teamTypesTableRows}
      />

      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Team Type
        </NERButton>
      </Box>
    </Box>
  );
};

export default TeamTypeTable;
