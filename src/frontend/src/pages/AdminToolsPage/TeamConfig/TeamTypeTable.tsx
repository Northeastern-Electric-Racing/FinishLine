import { TableRow, TableCell, Box, Typography, Icon } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import CreateTeamTypeFormModal from './CreateTeamTypeFormModal';
import { TeamType } from 'shared';
import EditTeamTypeFormModal from './EditTeamTypeFormModal';
import { useAllTeamTypes, useSetTeamTypeImage } from '../../../hooks/team-types.hooks';
import { useEffect, useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import NERUploadButton from '../../../components/NERUploadButton';
import { getImageUrl } from '../../../utils/image.utils';

const TeamTypeTable: React.FC = () => {
  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();

  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [editingTeamType, setEditingTeamType] = useState<TeamType | undefined>(undefined);
  const [addedImages, setAddedImages] = useState<{ [key: string]: File | undefined }>({});
  const toast = useToast();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string | undefined }>({});

  useEffect(() => {
    try {
      teamTypes?.forEach(async (teamType) => {
        const url = await getImageUrl(teamType.imageFileId ?? '');
        setImageUrls((prev) => ({ ...prev, [teamType.teamTypeId]: url }));
      });
    } catch (error) {
      console.error('Error fetching image urls', error);
    }
  }, [teamTypes]);

  const { mutateAsync: setTeamTypeImage } = useSetTeamTypeImage();

  if (!teamTypes || teamTypesIsLoading) {
    return <LoadingIndicator />;
  }
  if (teamTypesIsError) {
    return <ErrorPage message={teamTypesError?.message} />;
  }

  const onSubmitTeamTypeImage = async (teamTypeId: string) => {
    const addedImage = addedImages[teamTypeId];
    if (addedImage) {
      await setTeamTypeImage({ file: addedImage, id: teamTypeId });
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

  const teamTypesTableRows = teamTypes.map((teamType) => {
    return (
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
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
            {teamType.imageFileId && !addedImages[teamType.teamTypeId] && (
              <Box
                component="img"
                src={imageUrls[teamType.teamTypeId]}
                alt="Image Preview"
                sx={{ maxWidth: '100px', mt: 1, mb: 1 }}
              />
            )}
            <NERUploadButton
              dataTypeId={teamType.teamTypeId}
              handleFileChange={(e) => handleFileChange(e, teamType.teamTypeId)}
              onSubmit={onSubmitTeamTypeImage}
              addedImage={addedImages[teamType.teamTypeId]}
              setAddedImage={(newImage) =>
                setAddedImages((prev) => {
                  return { ...prev, [teamType.teamTypeId]: newImage } as { [key: string]: File | undefined };
                })
              }
            />
          </Box>
        </TableCell>
      </TableRow>
    );
  });

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
