import { useForm } from "react-hook-form";
import { CreateStandardChangeRequestPayload } from "../../hooks/change-requests.hooks";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ReactHookTextField from "../../components/ReactHookTextField";
import NERSuccessButton from "../../components/NERSuccessButton";
import NERFailButton from "../../components/NERFailButton";


interface CreateStandardChangeRequestFromEditViewProps {
    modalShow: boolean;
    onHide: () => void;
    onSubmit: (data: CreateStandardChangeRequestPayload) => Promise<void>;
}

const CreateStandardChangeRequestFromEditView: React.FC<CreateStandardChangeRequestFromEditViewProps> = ({ modalShow, onHide, onSubmit }) => {  
    const schema = yup.object().shape({
      //wbsNum: yup.string().required().test('wp-wbs-test', 'Work Package WBS Number does not match', workPackageWbsTester)
    });
  
    const {
      handleSubmit,
      control,
      formState: { errors }
    } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
        wbsNum: ''
      },
      mode: 'onChange'
    });
  
    const onSubmitWrapper = async (data: CreateStandardChangeRequestPayload) => {
      await onSubmit(data);
    };
  
    return (
      <Dialog open={modalShow} onClose={onHide}>
        <DialogTitle
          className="font-weight-bold"
          sx={{
            '&.MuiDialogTitle-root': {
              padding: '1rem 1.5rem 0'
            }
          }}
        >{`Delete Work Package `}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            '&.MuiDialogContent-root': {
              padding: '1rem 1.5rem'
            }
          }}
        >
          <Typography sx={{ marginBottom: '1rem' }}>
            Are you sure you want to delete Work Package?
          </Typography>
          <Typography sx={{ fontWeight: 'bold' }}>This action cannot be undone!</Typography>
          <form
            id="create-cr-from-edit"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              //handleSubmit(onSubmitWrapper)(e);
            }}
          >
            <FormControl>
              <FormLabel sx={{ marginTop: '1rem', marginBottom: '1rem' }}>
                To confirm deletion, please type in the WBS number of this Work Package.
              </FormLabel>
              <ReactHookTextField
                control={control}
                name="wbsNum"
                errorMessage={errors.wbsNum}
                placeholder="Enter Work Package WBS # here"
                sx={{ width: 1 }}
                type="string"
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <NERSuccessButton variant="contained" sx={{ mx: 1 }} onClick={onHide}>
            Cancel
          </NERSuccessButton>
          <NERFailButton variant="contained" type="submit" form="create-cr-from-edit" sx={{ mx: 1 }}>
            Submit
          </NERFailButton>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default CreateStandardChangeRequestFromEditView;
  