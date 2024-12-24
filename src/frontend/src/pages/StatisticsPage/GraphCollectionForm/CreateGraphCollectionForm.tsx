import { GraphCollectionFormInput } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateGraphCollection } from '../../../hooks/statistics.hooks';
import GraphCollectionForm from './GraphCollectionForm';

const defaultValues: GraphCollectionFormInput = {
  title: '',
  permissions: []
};

interface CreateGraphCollectionFormProps {
  open: boolean;
  onHide: () => void;
}

const CreateGraphCollectionForm = ({ open, onHide }: CreateGraphCollectionFormProps) => {
  const { mutateAsync: createGraphCollection, isLoading } = useCreateGraphCollection();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <GraphCollectionForm
      open={open}
      onHide={onHide}
      action={createGraphCollection}
      title="Create Graph Collection"
      successText="Successfully created graph collection"
      defaultValues={defaultValues}
    />
  );
};

export default CreateGraphCollectionForm;
