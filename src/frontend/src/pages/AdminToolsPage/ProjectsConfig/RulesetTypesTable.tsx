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

const handleDeleteRulesetType = async (
  rulesetTypeId: string,
  name: string,
  hasRevisionFiles: boolean,
  deleteRulesetTypeMutation: (rulesetTypeId: string) => Promise<void>,
  toast: ReturnType<typeof useToast>,
  onSuccess: () => void
) => {
  if (hasRevisionFiles) {
    toast.error('Cannot delete ruleset type with existing revisions');
    return;
  }

  try {
    await deleteRulesetTypeMutation(rulesetTypeId);
    toast.success(`Ruleset Type: ${name} deleted successfully!`);
    onSuccess();
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
  }
};

interface RulesetTypeDeleteButtonProps {
  rulesetTypeId: string;
  name: string;
  hasRevisionFiles: boolean;
  deleteRulesetTypeMutation: (rulesetTypeId: string) => Promise<void>;
  toast: ReturnType<typeof useToast>;
}

const RulesetTypeDeleteButton: React.FC<RulesetTypeDeleteButtonProps> = ({
  rulesetTypeId,
  name,
  hasRevisionFiles,
  deleteRulesetTypeMutation,
  toast
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteSubmit = () =>
    handleDeleteRulesetType(rulesetTypeId, name, hasRevisionFiles, deleteRulesetTypeMutation, toast, () =>
      setShowDeleteModal(false)
    );

  return (
    <>
      <IconButton type="button" sx={{ mx: 1 }} onClick={() => setShowDeleteModal(true)}>
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

const RulesetTypesTable: React.FC = () => {
  const toast = useToast();
  const { data: rulesetTypes, isLoading, isError, error } = useAllRulesetTypes();
  const { mutateAsync: createRulesetType } = useCreateRulesetType();
  const { mutateAsync: deleteRulesetType } = useDeleteRulesetType();
  const [addRulesetTypeModalShow, setAddRulesetTypeModalShow] = useState(false);

  if (isError) return <ErrorPage message={error?.message} />;
  if (!rulesetTypes || isLoading) return <LoadingIndicator />;

  const handleAddRulesetTypeConfirm = async (data: { name: string }) => {
    await createRulesetType({ name: data.name });
  };

  const handleAddRulesetTypeCancel = () => {
    setAddRulesetTypeModalShow(false);
  };

  const rulesetTypeTableRows = rulesetTypes.map((rulesetType, index) => (
    <TableRow key={rulesetType.rulesetTypeId}>
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
          hasRevisionFiles={rulesetType.revisionFiles.length > 0}
          deleteRulesetTypeMutation={deleteRulesetType}
          toast={toast}
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
        columns={[
          { name: 'Ruleset Type', width: '35%' },
          { name: 'Last Updated', width: '30%' },
          { name: 'Revisions', width: '25%' },
          { name: ' ', width: '10%' }
        ]}
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
