import { TableRow, TableCell, Typography, Box, Icon } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllLinkTypes } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateLinkTypeModal from './CreateLinkTypeModal';
import EditLinkTypeModal from './EditLinkTypeModal';
import AdminToolTable from '../AdminToolTable';
import { isAdmin, LinkType } from 'shared';
import { useCurrentUser } from '../../../hooks/users.hooks';

const LinkTypeTable = () => {
  const currentUser = useCurrentUser();
  const {
    data: linkTypes,
    isLoading: linkTypeIsLoading,
    isError: linkTypeIsError,
    error: linkTypeError
  } = useAllLinkTypes();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickedLinkType, setClickedLinkType] = useState<LinkType>();

  if (!linkTypes || linkTypeIsLoading) return <LoadingIndicator />;
  if (linkTypeIsError) return <ErrorPage message={linkTypeError.message} />;

  const linkTypeTableRows = linkTypes.map((linkType) => (
    <TableRow
      onClick={() => {
        setClickedLinkType(linkType);
        setShowEditModal(true);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {linkType.name}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon>{linkType.iconName}</Icon>
          <Typography variant="body1" sx={{ marginLeft: 1 }}>
            {linkType.iconName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{linkType.required ? 'Yes' : 'No'}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateLinkTypeModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} linkTypes={linkTypes} />
      {clickedLinkType && (
        <EditLinkTypeModal
          showModal={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setClickedLinkType(undefined);
          }}
          linkType={clickedLinkType}
          linkTypes={linkTypes}
        />
      )}
      <Typography variant="subtitle1">Registered LinkTypes</Typography>
      <AdminToolTable columns={[{ name: 'Name' }, { name: 'Icon Name' }, { name: 'Required' }]} rows={linkTypeTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        {isAdmin(currentUser.role) && (
          <NERButton
            variant="contained"
            onClick={() => {
              setCreateModalShow(true);
            }}
          >
            New LinkType
          </NERButton>
        )}
      </Box>
    </Box>
  );
};

export default LinkTypeTable;
