import { TableRow, TableCell, Box, IconButton } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import NERTable from '../../../components/NERTable';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { useAllRulesetTypes, useCreateRulesetType, useDeleteRulesetType } from '../../../hooks/rules.hooks';
import { Delete } from '@mui/icons-material';
import RulesetTypeDeleteModal from './RulesetTypeDeleteModal';
import AddRulesetTypeModal from './AddRulesetTypeModal';

interface RulesetTypeDeleteButtonProps {
  rulesetTypeId: string;
  name: string;
  onDelete: (rulesetTypeId: string, name: string) => void;
}

const RulesetTypesTable: React.FC = () => {
  const toast = useToast();
  const { data: rulesetTypes = [], isLoading, error } = useAllRulesetTypes();
  const { mutateAsync: createRulesetType } = useCreateRulesetType();
  const { mutateAsync: deleteRulesetType } = useDeleteRulesetType();
  const [addRulesetTypeModalShow, setAddRulesetTypeModalShow] = useState(false);

  if (error) return <ErrorPage message={error.message} />;
  if (isLoading) return <LoadingIndicator />;

  const handleAddRulesetTypeConfirm = async (data: { name: string }) => {
    await createRulesetType({ name: data.name });
  };

  const handleAddRulesetTypeCancel = () => {
    setAddRulesetTypeModalShow(false);
  };

  const handleDeleteRulesetType = async (rulesetTypeId: string, name: string) => {
    const rulesetType = rulesetTypes.find((rt) => rt.rulesetTypeId === rulesetTypeId);
    if (rulesetType && rulesetType.revisionFiles.length > 0) {
      toast.error('Cannot delete ruleset type with existing revisions');
      return;
    }

    try {
      await deleteRulesetType(rulesetTypeId);
      toast.success(`Ruleset Type: ${name} deleted successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const RulesetTypeDeleteButton: React.FC<RulesetTypeDeleteButtonProps> = ({ rulesetTypeId, name, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = () => {
      onDelete(rulesetTypeId, name);
      setShowDeleteModal(false);
    };

    return (
      <>
        <IconButton type="button" onClick={() => setShowDeleteModal(true)}>
          <Delete />
        </IconButton>
        {showDeleteModal && (
          <RulesetTypeDeleteModal
            rulesetTypeName={name}
            onDelete={handleDeleteSubmit}
            onHide={() => setShowDeleteModal(false)}
          />
        )}
      </>
    );
  };

  const rulesetTypeTableRows = rulesetTypes.map((rulesetType, index) => (
    <TableRow>
      <TableCell sx={{ borderBottom: index === rulesetTypes.length - 1 ? 'none' : 'default' }}>{rulesetType.name}</TableCell>
      <TableCell sx={{ borderBottom: index === rulesetTypes.length - 1 ? 'none' : 'default' }}>
        {datePipe(rulesetType.lastUpdated)}
      </TableCell>
      <TableCell sx={{ borderBottom: index === rulesetTypes.length - 1 ? 'none' : 'default' }}>
        {rulesetType.revisionFiles.length}
      </TableCell>
      <TableCell sx={{ borderBottom: index === rulesetTypes.length - 1 ? 'none' : 'default' }}>
        <RulesetTypeDeleteButton
          rulesetTypeId={rulesetType.rulesetTypeId}
          name={rulesetType.name}
          onDelete={handleDeleteRulesetType}
        />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <AddRulesetTypeModal
        open={addRulesetTypeModalShow}
        onHide={handleAddRulesetTypeCancel}
        onFormSubmit={handleAddRulesetTypeConfirm}
      />
      <NERTable
        columns={[{ name: 'Ruleset Type' }, { name: 'Last Updated' }, { name: 'Revisions' }, { name: '' }]}
        rows={rulesetTypeTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setAddRulesetTypeModalShow(!addRulesetTypeModalShow)}>
          Add Ruleset Type
        </NERButton>
      </Box>
    </Box>
  );
};

export default RulesetTypesTable;
