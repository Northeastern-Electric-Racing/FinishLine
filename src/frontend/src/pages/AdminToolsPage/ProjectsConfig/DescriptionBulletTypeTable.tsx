import { useCurrentUser } from '../../../hooks/users.hooks';
import { useGetAllDescriptionBulletTypes } from '../../../hooks/description-bullets.hooks';
import { useState } from 'react';
import { DescriptionBulletType, isAdmin } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { TableCell, TableRow, Typography } from '@mui/material';
import CreateDescriptionBulletTypeModal from './CreateDescriptionBulletTypeModal';
import EditDescriptionBulletTypeModal from './EditDescriptionBulletTypeModel';
import { Box } from '@mui/system';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';

const DescriptionBulletTypeTable = () => {
  const currentUser = useCurrentUser();
  const {
    data: descriptionBulletTypes,
    isLoading: descriptionBulletTypeIsLoading,
    isError: descriptionBulletTypeIsError,
    error: descriptionBulletTypeError
  } = useGetAllDescriptionBulletTypes();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickeddescriptionBulletType, setClickeddescriptionBulletType] = useState<DescriptionBulletType>();

  if (!descriptionBulletTypes || descriptionBulletTypeIsLoading) return <LoadingIndicator />;
  if (descriptionBulletTypeIsError) return <ErrorPage message={descriptionBulletTypeError.message} />;

  const descriptionBulletTypeTableRows = descriptionBulletTypes.map((descriptionBulletType) => (
    <TableRow
      onClick={() => {
        setClickeddescriptionBulletType(descriptionBulletType);
        setShowEditModal(true);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {descriptionBulletType.name}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        {descriptionBulletType.workPackageRequired ? 'Yes' : 'No'}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        {descriptionBulletType.projectRequired ? 'Yes' : 'No'}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateDescriptionBulletTypeModal
        open={createModalShow}
        handleClose={() => setCreateModalShow(false)}
        descriptionBulletTypes={descriptionBulletTypes}
      />
      {clickeddescriptionBulletType && (
        <EditDescriptionBulletTypeModal
          open={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setClickeddescriptionBulletType(undefined);
          }}
          descriptionBulletType={clickeddescriptionBulletType}
          descriptionBulletTypes={descriptionBulletTypes}
        />
      )}
      <Typography variant="subtitle1">Registered Description Bullet Types</Typography>
      <AdminToolTable
        columns={[{ name: 'Name' }, { name: 'Work Package Required' }, { name: 'Project Required' }]}
        rows={descriptionBulletTypeTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && (
          <NERButton
            variant="contained"
            onClick={() => {
              setCreateModalShow(true);
            }}
          >
            New Description Bullet Type
          </NERButton>
        )}
      </Box>
    </Box>
  );
};

export default DescriptionBulletTypeTable;
