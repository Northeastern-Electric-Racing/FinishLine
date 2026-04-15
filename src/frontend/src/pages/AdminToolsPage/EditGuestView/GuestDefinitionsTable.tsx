import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GuestDefinition, GuestDefinitionType } from 'shared';
import { NERButton } from '../../../components/NERButton';
import { useAllGuestDefinitions, useDeleteGuestDefinition } from '../../../hooks/recruitment.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useHistoryState } from '../../../hooks/misc.hooks';
import ErrorPage from '../../ErrorPage';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';
import CreateGuestDefinitionFormModal from './CreateGuestDefinitionFormModal';
import EditGuestDefinitionFormModal from './EditGuestDefinitionFormModal';

interface GuestDefinitionsTableProps {
  type: GuestDefinitionType;
}

const GuestDefinitionsTable = ({ type }: GuestDefinitionsTableProps) => {
  const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  const [definitionEditing, setDefinitionEditing] = useHistoryState<GuestDefinition | undefined>('', undefined);
  const [definitionToDelete, setDefinitionToDelete] = useState<GuestDefinition | undefined>(undefined);
  const { mutateAsync: deleteGuestDefinition } = useDeleteGuestDefinition();
  const toast = useToast();

  const { isLoading, isError, error, data: allDefinitions } = useAllGuestDefinitions();

  const handleDelete = async (id: string) => {
    setDefinitionToDelete(undefined);
    try {
      await deleteGuestDefinition(id);
      toast.success('Guest definition deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  if (isError) return <ErrorPage message={error.message} />;
  if (!allDefinitions || isLoading) return <LoadingIndicator />;

  const definitions = allDefinitions.filter((d) => d.type === type);

  const rows = definitions.map((definition: GuestDefinition, index: number) => (
    <TableRow key={definition.definitionId}>
      <TableCell
        align="left"
        sx={{ borderBottom: index === definitions.length - 1 ? 'none' : 'default', alignItems: 'center' }}
      >
        <Typography>{definition.term}</Typography>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: index === definitions.length - 1 ? 'none' : 'default',
          minHeight: '50px'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{definition.description}</Typography>
        <Box sx={{ display: 'flex' }}>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setDefinitionEditing(definition)}>
            <EditIcon />
          </Button>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setDefinitionToDelete(definition)}>
            <DeleteIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      {createModalShow && (
        <CreateGuestDefinitionFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} type={type} />
      )}
      {definitionEditing && (
        <EditGuestDefinitionFormModal
          open={!!definitionEditing}
          handleClose={() => setDefinitionEditing(undefined)}
          definition={definitionEditing}
        />
      )}
      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px'
              }}
            >
              Term
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Description
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </MuiTable>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
        <NERButton variant="contained" onClick={() => setCreateModalShow(true)}>
          Add Guest Definition
        </NERButton>
      </Box>
      {definitionToDelete && (
        <NERDeleteModal
          open={!!definitionToDelete}
          onHide={() => setDefinitionToDelete(undefined)}
          formId="delete-guest-definition-form"
          dataType="Guest Definition"
          onFormSubmit={() => {
            handleDelete(definitionToDelete.definitionId);
          }}
        />
      )}
    </Box>
  );
};

export default GuestDefinitionsTable;
