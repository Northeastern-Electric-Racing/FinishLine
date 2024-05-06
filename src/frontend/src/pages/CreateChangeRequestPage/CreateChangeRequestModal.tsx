import { Dialog, DialogContent } from '@mui/material';
import { Box } from '@mui/system';
import { FormInput } from './CreateChangeRequest';
import CreateChangeRequestsView from './CreateChangeRequestView';

interface CreateChangeRequestModalProps {
  handleConfirm: (data: FormInput) => Promise<void>;
  handleCancel: () => void;
  wbsNum: string;
  setIsModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
}

const CreateChangeRequestModal: React.FC<CreateChangeRequestModalProps> = ({
  handleConfirm,
  handleCancel,
  wbsNum,
  setIsModalOpen,
  isModalOpen
}) => {
  return (
    <div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Change Request">
        <DialogContent>
          <Box>
            <CreateChangeRequestsView
              wbsNum={wbsNum}
              setWbsNum={() => {}}
              crDesc={''}
              onSubmit={handleConfirm}
              proposedSolutions={[]}
              setProposedSolutions={() => {}}
              hideProposedSolutions={true}
              handleCancel={handleCancel}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChangeRequestModal;
