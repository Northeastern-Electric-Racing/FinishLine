import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { CreateGraphArgs, Graph, GraphDisplayType, GraphFormInput, GraphType, Measure } from 'shared';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useHistory, useParams } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorPage from '../../ErrorPage';
import PageLayout from '../../../components/PageLayout';
import { GraphFormView } from './GraphFormView';
import { useGetAllCars } from '../../../hooks/cars.hooks';
import { SubmitText } from '../../../utils/teams.utils';

const schema = yup.object().shape({
  endTime: yup.date().optional(),
  startTime: yup.date().optional(),
  title: yup.string().optional(),
  graphType: yup.mixed<GraphType>().oneOf(Object.values(GraphType)),
  graphDisplayType: yup.mixed<GraphDisplayType>().oneOf(Object.values(GraphDisplayType)).required(),
  carIds: yup.array().required(),
  measure: yup.mixed<Measure>().oneOf(Object.values(Measure)).required(),
  specialPermissions: yup.array().required()
});

interface GraphFormProps {
  action: (data: CreateGraphArgs) => Promise<Graph>;
  defaultValues: Omit<GraphFormInput, 'graphCollectionId'>;
  submitText: SubmitText;
  successText: string;
  title: string;
}

const GraphForm = ({ title, action, defaultValues, submitText, successText }: GraphFormProps) => {
  const { graphCollectionId } = useParams<{ graphCollectionId: string }>();

  const history = useHistory();
  const toast = useToast();
  const { data: cars, isLoading, isError, error } = useGetAllCars();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<GraphFormInput>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  const onSubmit = async (formInput: GraphFormInput) => {
    try {
      if (!formInput.graphType) throw new Error('Please enter graph type');
      await action({
        ...formInput,
        startDate: formInput.startTime,
        endDate: formInput.endTime,
        graphType: formInput.graphType,
        graphCollectionId,
        title: formInput.title ?? ''
      });

      toast.success(successText);
      history.push(routes.STATISTICS + '/graph-collections/' + graphCollectionId);
      reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const exitEditMode = () => {
    history.push(routes.STATISTICS + '/graph-collections/' + graphCollectionId);
  };

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (!cars || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      noValidate
    >
      <PageLayout
        stickyHeader
        title={title}
        previousPages={[
          { name: 'Statistics', route: routes.STATISTICS },
          { name: 'Collection', route: `${routes.STATISTICS}/graph-collections/${graphCollectionId}` }
        ]}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
              {submitText}
            </NERSuccessButton>
          </Box>
        }
      >
        <GraphFormView control={control} errors={errors} cars={cars} />
      </PageLayout>
    </form>
  );
};

export default GraphForm;
