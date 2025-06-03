import { TableRow, TableCell, Box, Typography, Icon } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import CreateDivisionFormModal from './CreateTeamTypeFormModal';
import { TeamType as Division } from 'shared';
import EditDivisionFormModal from './EditTeamTypeFormModal';
import { useAllTeamTypes as useAllDivisions, useSetTeamTypeImage } from '../../../hooks/team-types.hooks';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import NERUploadButton from '../../../components/NERUploadButton';
import { useGetImageUrls } from '../../../hooks/onboarding.hook';

const DivisionTable: React.FC = () => {
  const {
    data: Divisions,
    isLoading: DivisionsIsLoading,
    isError: DivisionsIsError,
    error: DivisionsError
  } = useAllDivisions();

  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [editingDivision, setEditingDivision] = useState<Division | undefined>(undefined);
  const [addedImages, setAddedImages] = useState<{ [key: string]: File | undefined }>({});
  const toast = useToast();

  const DivisionImageList =
    Divisions?.map((Division) => {
      return { objectId: Division.teamTypeId, imageFileId: Division.imageFileId };
    }) ?? [];

  const { data: imageUrlsList, isLoading, isError, error } = useGetImageUrls(DivisionImageList);
  const { mutateAsync: setDivisionImage, isLoading: setDivisionIsLoading } = useSetTeamTypeImage();

  if (DivisionsIsError) {
    return <ErrorPage message={DivisionsError?.message} />;
  }

  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  if (!Divisions || DivisionsIsLoading || setDivisionIsLoading || !imageUrlsList || isLoading) {
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

  const DivisionsTableRows = Divisions?.map((Division) => {
    return (
      <TableRow>
        <TableCell onClick={() => setEditingDivision(Division)} sx={{ cursor: 'pointer', border: '2px solid black' }}>
          {Division.name}
        </TableCell>
        <TableCell
          onClick={() => setEditingDivision(Division)}
          sx={{ cursor: 'pointer', border: '2px solid black', verticalAlign: 'middle' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon>{Division.iconName}</Icon>
            <Typography variant="body1" sx={{ marginLeft: 1 }}>
              {Division.iconName}
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          onClick={() => setEditingDivision(Division)}
          sx={{
            cursor: 'pointer',
            border: '2px solid black',
            verticalAlign: 'middle',
            maxWidth: '15vw'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ marginLeft: 1 }}>
              {Division.description}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ border: '2px solid black' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
            {Division.imageFileId && !addedImages[Division.teamTypeId] && (
              <Box
                component="img"
                src={imageUrlsMap[Division.teamTypeId]}
                alt="Image Preview"
                sx={{ maxWidth: '100px', mt: 1, mb: 1 }}
              />
            )}
            <NERUploadButton
              dataTypeId={Division.teamTypeId}
              handleFileChange={(e) => handleFileChange(e, Division.teamTypeId)}
              onSubmit={onSubmitDivisionImage}
              addedImage={addedImages[Division.teamTypeId]}
              setAddedImage={(newImage) =>
                setAddedImages((prev) => {
                  return { ...prev, [Division.teamTypeId]: newImage } as { [key: string]: File | undefined };
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
