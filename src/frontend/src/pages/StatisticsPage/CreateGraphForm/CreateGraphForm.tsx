import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { GraphDisplayType, GraphFormInput, Measure } from 'shared';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useHistory } from 'react-router-dom';
import { useCreateGraph } from '../../../hooks/statistics.hooks';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorPage from '../../ErrorPage';
import PageLayout from '../../../components/PageLayout';
import { GraphFormView } from './GraphFormView';
import { useGetAllCars } from '../../../hooks/cars.hooks';

const defaultValues: GraphFormInput = {
  measure: Measure.SUM,
  startTime: null,
  endTime: null,
  title: '',
  graphType: null,
  graphDisplayType: GraphDisplayType.BAR,
  cars: [],
  specialPermissions: []
};

const schema = yup.object().shape({
  endTime: yup.date().required(),
  startTime: yup.date().required(),
  title: yup.string().required(),
  graphType: yup.string().required(),
  graphDisplayType: yup.string().required(),
  cars: yup.array().required(),
  measure: yup.string().required()
});

const CreateGraphForm: React.FC = () => {
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync: createGraph, isLoading: createIsLoading } = useCreateGraph();
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
      if (!formInput.endTime) throw new Error('Please enter end time');
      if (!formInput.startTime) throw new Error('Please enter start time');
      if (!formInput.graphType) throw new Error('Please enter graph type');
      await createGraph({
        ...formInput,
        graphType: formInput.graphType,
        startDate: formInput.startTime,
        endDate: formInput.endTime,
        carIds: formInput.cars.map((car) => car.id)
      });

      toast.success('Successfully created graph');
      history.push(routes.STATISTICS);
      reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const exitEditMode = () => {
    history.push(routes.STATISTICS);
  };

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (createIsLoading || !cars || isLoading) {
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
        title={'New Graph'}
        previousPages={[{ name: 'statistics', route: routes.STATISTICS }]}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
              Submit
            </NERSuccessButton>
          </Box>
        }
      >
        <GraphFormView
          control={control}
          errors={errors}
          graphCollections={[]} // TODO replace with graph collections
          cars={cars}
        />
      </PageLayout>
    </form>
  );
};

export default CreateGraphForm;
