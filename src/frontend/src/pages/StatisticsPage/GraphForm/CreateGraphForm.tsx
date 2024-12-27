import { GraphDisplayType, GraphFormInput, Measure } from 'shared';
import { useCreateGraph } from '../../../hooks/statistics.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import GraphForm from './GraphForm';

const defaultValues: GraphFormInput = {
  measure: Measure.SUM,
  startTime: undefined,
  endTime: undefined,
  title: '',
  graphType: null,
  graphDisplayType: GraphDisplayType.BAR,
  carIds: [],
  specialPermissions: []
};

const CreateGraphForm: React.FC = () => {
  const { mutateAsync: createGraph, isLoading: createIsLoading } = useCreateGraph();

  if (createIsLoading) {
    return <LoadingIndicator />;
  }

  return (
    <GraphForm
      action={createGraph}
      submitText="Create"
      defaultValues={defaultValues}
      successText={'Successfully Created Graph'}
      title="New Graph"
    />
  );
};

export default CreateGraphForm;
