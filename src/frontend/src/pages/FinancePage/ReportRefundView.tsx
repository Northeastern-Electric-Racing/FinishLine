import { FormControl, FormLabel } from '@mui/material';
import NERFormModal from '../../components/NERFormModal';
import ReactHookTextField from '../../components/ReactHookTextField';

interface ReportRefundViewProps {
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: ReportRefundInputs) => Promise<void>;
}

const ReportRefundView: React.FC<ReportRefundViewProps> = ({ modalShow, onHide, onSubmit }) => {
  //const projectWbsNumTester = (wbsNum: string | undefined) => wbsNum !== undefined && wbsNum === wbsPipe(project);

  /*const schema = yup.object().shape({
    wbsNum: yup.string().required().test('project-wbs-test', 'Project WBS does not match', projectWbsNumTester)
  });*/

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: ''
    },
    mode: 'onChange'
  });

  const onSubmitWrapper = async (data: ReportRefundInputs) => {
    await onSubmit(data);
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={'Report New Account Credit'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId=""
      disabled={!isValid}
      showCloseButton
    >
      <FormControl>
        <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
          To confirm deletion, please type in the ID number of this Change Request.
        </FormLabel>
        <ReactHookTextField control={control} errorMessage={errors.crId} sx={{ width: 1 }} type="number" name={''} />
      </FormControl>
    </NERFormModal>
  );
};
