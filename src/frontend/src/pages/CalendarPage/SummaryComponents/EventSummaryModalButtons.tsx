import { Box } from '@mui/system';
import { Event, TeamType } from 'shared';
import { NERButton } from '../../../components/NERButton';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useState } from 'react';

interface EventSummaryModalButtonsProps {
  event: Event;
  handleStageGateClick: () => void;
  handleDelayClick: () => void;
  teamTypes: TeamType[];
}

const EventSummaryModalButtons: React.FC<EventSummaryModalButtonsProps> = ({
  event: _event,
  handleDelayClick,
  handleStageGateClick,
  teamTypes: _teamTypes
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column" rowGap={1}>
      {
        isCreateModalOpen && isCreateModalOpen
        /*
        <DesignReviewCreateModal
          showModal={isCreateModalOpen}
          handleClose={() => {
            setIsCreateModalOpen(false);
          }}
          teamTypes={teamTypes}
          defaultDate={new Date()}
          defaultWbsNum={designReview.wbsNum}
        />
        */
      }
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <NERFailButton
          sx={{
            marginLeft: 1,
            fontWeight: 'bold',
            fontSize: 13
          }}
          onClick={handleDelayClick}
        >
          Request Delay
        </NERFailButton>
        <NERSuccessButton
          sx={{
            marginLeft: 1,
            fontWeight: 'bold',
            fontSize: 13
          }}
          onClick={handleStageGateClick}
        >
          Stage Gate
        </NERSuccessButton>
      </Box>
      <NERButton
        sx={{
          marginLeft: 1
        }}
        whiteVariant
        onClick={() => setIsCreateModalOpen(true)}
      >
        Schedule Another Event
      </NERButton>
    </Box>
  );
};

export default EventSummaryModalButtons;
