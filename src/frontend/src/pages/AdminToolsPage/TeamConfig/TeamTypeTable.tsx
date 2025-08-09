import { TableRow, TableCell, Box, Typography, Icon } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import CreateDivisionFormModal from './CreateTeamTypeFormModal';
import { TeamType as Division } from 'shared';
import EditDivisionFormModal from './EditTeamTypeFormModal';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import NERUploadButton from '../../../components/NERUploadButton';
import { useGetImageUrls } from '../../../hooks/onboarding.hook';
import { useAllTeamTypes, useSetTeamTypeImage } from '../../../hooks/team-types.hooks';

const DivisionTable: React.FC = () => {
  const {
    data: divisions,
    isLoading: divisionsIsLoading,
    isError: divisionsIsError,
    error: divisionsError
  } = useAllTeamTypes();

  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [editingDivision, setEditingDivision] = useState<Division | undefined>(undefined);
  const [addedImages, setAddedImages] = useState<{ [key: string]: File | undefined }>({});
  const toast = useToast();

  const DivisionImageList =
    divisions?.map((Division) => {
      return { objectId: Division.teamTypeId, imageFileId: Division.imageFileId };
    }) ?? [];

  const { data: imageUrlsList, isLoading, isError, error } = useGetImageUrls(DivisionImageList);
  const { mutateAsync: setDivisionImage, isLoading: setDivisionIsLoading } = useSetTeamTypeImage();

  if (divisionsIsError) {
    return <ErrorPage message={divisionsError?.message} />;
  }

  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  if (!divisions || divisionsIsLoading || setDivisionIsLoading || !imageUrlsList || isLoading) {
    return <LoadingIndicator />;
  }

  const imageUrlsMap: { [key: string]: string | undefined } = {};
  imageUrlsList.forEach((item) => {
    imageUrlsMap[item.id] = item.url;
  });

  const onSubmitDivisionImage = async (DivisionId: string) => {
    const addedImage = addedImages[DivisionId];
    if (addedImage) {
      try {
        await setDivisionImage({ file: addedImage, id: DivisionId });
        toast.success('Image uploaded successfully!', 5000);
        setAddedImages((prev) => ({ ...prev, [DivisionId]: undefined }));
      } catch (error) {
        if (error instanceof Error) {
          toast.error('Failed to set team image: ' + error.message);
        } else {
          toast.error('Failed to set team image');
        }
      }
    } else {
      toast.error('No image selected for upload.', 5000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, DivisionId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size < 1000000) {
        setAddedImages((prev) => ({ ...prev, [DivisionId]: file }));
      } else {
        toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
      }
    }
  };

  const DivisionsTableRows = divisions.map((division, index) => {
    return (
      <TableRow>
        <TableCell
          onClick={() => setEditingDivision(division)}
          sx={{
            cursor: 'pointer',
            borderBottom: index === divisions.length - 1 ? 'none' : 'default'
          }}
        >
          {division.name}
        </TableCell>
        <TableCell
          onClick={() => setEditingDivision(division)}
          sx={{
            cursor: 'pointer',
            verticalAlign: 'middle',
            borderBottom: index === divisions.length - 1 ? 'none' : 'default'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon>{division.iconName}</Icon>
            <Typography variant="body1" sx={{ marginLeft: 1 }}>
              {division.iconName}
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          onClick={() => setEditingDivision(division)}
          sx={{
            cursor: 'pointer',
            verticalAlign: 'middle',
            maxWidth: '15vw',
            borderBottom: index === divisions.length - 1 ? 'none' : 'default'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ marginLeft: 1 }}>
              {division.description}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ borderBottom: index === divisions.length - 1 ? 'none' : 'default' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
            {division.imageFileId && !addedImages[division.teamTypeId] && (
              <Box
                component="img"
                src={imageUrlsMap[division.teamTypeId]}
                alt="Image Preview"
                sx={{ maxWidth: '100px', mt: 1, mb: 1 }}
              />
            )}
            <NERUploadButton
              dataTypeId={division.teamTypeId}
              handleFileChange={(e) => handleFileChange(e, division.teamTypeId)}
              onSubmit={onSubmitDivisionImage}
              addedImage={addedImages[division.teamTypeId]}
              setAddedImage={(newImage) =>
                setAddedImages((prev) => {
                  return { ...prev, [division.teamTypeId]: newImage } as { [key: string]: File | undefined };
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
      <CreateDivisionFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {editingDivision && (
        <EditDivisionFormModal
          open={!!editingDivision}
          handleClose={() => setEditingDivision(undefined)}
          Division={editingDivision}
        />
      )}
      <AdminToolTable
        columns={[{ name: 'Team Type Name' }, { name: 'Icon' }, { name: 'Description' }, { name: 'Image' }]}
        rows={DivisionsTableRows}
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

export default DivisionTable;
