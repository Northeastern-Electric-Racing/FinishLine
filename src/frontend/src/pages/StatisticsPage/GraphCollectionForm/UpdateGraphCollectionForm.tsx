import { GraphCollection, GraphCollectionFormInput } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import GraphCollectionForm from './GraphCollectionForm';
import { useUpdateGraphCollection } from '../../../hooks/statistics.hooks';

interface UpdateGraphCollectionFormProps {
  open: boolean;
  onHide: () => void;
  graphCollection: GraphCollection;
}

const UpdateGraphCollectionForm = ({ open, onHide, graphCollection }: UpdateGraphCollectionFormProps) => {
  const { mutateAsync: updateGraphCollection, isLoading } = useUpdateGraphCollection(graphCollection.id);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const defaultValues: GraphCollectionFormInput = {
    title: graphCollection.title,
    specialPermissions: graphCollection.permissions
  };

  return (
    <GraphCollectionForm
      open={open}
      onHide={onHide}
      onSubmit={updateGraphCollection}
      title="Update Graph Collection"
      successText="Successfully updated graph collection"
      defaultValues={defaultValues}
    />
  );
};

export default UpdateGraphCollectionForm;
