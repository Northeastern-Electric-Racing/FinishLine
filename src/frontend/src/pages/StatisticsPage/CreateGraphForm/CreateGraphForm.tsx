import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FlattenedRelations,
  GraphFormInput,
  GraphType,
  Measure,
  SimpleForeignRelation,
  TrackedFlattenedRelations,
  ValidatedGraphFormInput
} from 'shared';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useHistory } from 'react-router-dom';
import { useCreateGraph, useGraphConfig } from '../../../hooks/statistics.hooks';
import { routes } from '../../../utils/routes';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorPage from '../../ErrorPage';
import PageLayout from '../../../components/PageLayout';
import { GraphFormView } from './GraphFormView';
import { getRelationKey, transformGraphFormInputToCreateGraphArgs } from '../../../utils/statistics.utils';
import { deeplyCopy } from 'shared/src/utils';

const defaultValues: GraphFormInput = {
  yData: {
    column: '',
    table: ''
  },
  xData: {
    column: '',
    table: '',
    path: []
  },
  measure: Measure.SUM,
  startTime: null,
  endTime: null,
  title: '',
  graphType: GraphType.BAR
};

const schema = yup.object().shape({
  endTime: yup.date().required(),
  startTime: yup.date().required(),
  title: yup.string().required(),
  graphType: yup.string().required(),
  measure: yup.string().required()
});

const CreateGraphForm: React.FC = () => {
  const [yTables, setYTables] = useState(new Map<string, FlattenedRelations>());
  const [xTables, setXTables] = useState(new Map<string, TrackedFlattenedRelations>());
  const [yTable, setYTable] = useState<string | null>(null);
  const history = useHistory();
  const toast = useToast();
  const { mutateAsync: createGraph, isLoading: createIsLoading } = useCreateGraph();
  const { data: relations, isLoading, isError, error } = useGraphConfig(); // get all graph collections to populate autocomplete

  useEffect(() => {
    if (relations) {
      const tempTables = new Map<string, FlattenedRelations>();
      relations.forEach((data) => {
        tempTables.set(data.table, data);
      });
      setYTables(tempTables);
    }
  }, [relations]);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<GraphFormInput>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const tempTables = new Map<string, TrackedFlattenedRelations>();

    if (yTable) {
      const yTableConfig = yTables.get(yTable);
      if (yTableConfig) {
        const relationsToProcess: { relation: SimpleForeignRelation; path: SimpleForeignRelation[] }[] =
          yTableConfig.relationships.map((relation) => {
            const clonedRelation = deeplyCopy(relation) as SimpleForeignRelation;
            return {
              path: [
                clonedRelation,
                {
                  table: yTableConfig.table,
                  primaryKey: yTableConfig.primaryKey ?? '',
                  foreignKey: relation.foreignKey
                }
              ],
              relation: clonedRelation
            };
          });

        while (relationsToProcess.length > 0) {
          const next = relationsToProcess.shift()!;
          const key = getRelationKey(next.relation);
          const tableConfig = yTables.get(next.relation.table);

          if (!tempTables.has(key) && tableConfig) {
            tempTables.set(key, {
              ...tableConfig,
              path: next.path
            });
          }

          tableConfig?.relationships.forEach((relation) => {
            if (
              !tempTables.has(getRelationKey(relation)) &&
              !next.path.some((pathValue) => pathValue.table === relation.table)
            ) {
              if (next.path[0].table.startsWith('_')) {
                // indicates many to many table
                if (relation.foreignKey === 'A') {
                  next.path[0].primaryKey = 'B';
                  next.path[0].foreignKey = 'A';
                } else {
                  next.path[0].primaryKey = 'A';
                  next.path[0].foreignKey = 'B';
                }
              } else {
                next.path[0].foreignKey = relation.foreignKey;
              }
              const clonedRelation = deeplyCopy(relation) as SimpleForeignRelation;
              relationsToProcess.push({ relation: clonedRelation, path: [clonedRelation].concat(next.path) });
            }
          });
        }
      }
    }

    setXTables(tempTables);
  }, [yTable, yTables]);

  const onSubmit = async (formInput: GraphFormInput) => {
    try {
      if (!formInput.endTime) throw new Error('Please enter end time');
      if (!formInput.startTime) throw new Error('Please enter start time');
      await createGraph(transformGraphFormInputToCreateGraphArgs(formInput as ValidatedGraphFormInput));

      toast.success('Successfully created graph');
      history.push(routes.STATISTICS);
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

  if (!relations || isLoading || createIsLoading) {
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
          xTables={xTables}
          yTables={yTables}
          setYTable={setYTable}
          graphCollections={[]} // TODO replace with graph collections
        />
      </PageLayout>
    </form>
  );
};

export default CreateGraphForm;
