import { GraphFormInput } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import GraphForm from './GraphForm';
import { useParams } from 'react-router-dom';
import ErrorPage from '../../ErrorPage';
import { useGetSingleGraph, useUpdateGraph } from '../../../hooks/statistics.hooks';

const UpdateGraphForm: React.FC = () => {
  const { graphId } = useParams<{ graphId: string }>();
  const { data: graph, isLoading, isError, error } = useGetSingleGraph(graphId);
  const { mutateAsync: updateGraph, isLoading: updateIsLoading } = useUpdateGraph(graphId);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (updateIsLoading || isLoading || !graph) {
    return <LoadingIndicator />;
  }

  const defaultValues: GraphFormInput = {
    measure: graph.measure,
    startTime: graph.startDate,
    endTime: graph.endDate,
    title: graph.title,
    graphType: graph.graphType,
    graphDisplayType: graph.graphDisplayType,
    carIds: graph.carIds,
    specialPermissions: graph.specialPermissions
  };

  return (
    <GraphForm
      action={updateGraph}
      submitText="Update"
      defaultValues={defaultValues}
      successText={'Successfully Updated Graph'}
      title="Update Graph"
    />
  );
};

export default UpdateGraphForm;
