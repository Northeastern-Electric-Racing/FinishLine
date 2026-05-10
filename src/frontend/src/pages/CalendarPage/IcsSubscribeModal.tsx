import { useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import NERModal from '../../components/NERModal';
import { NERButton } from '../../components/NERButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useGetIcsToken, useAllCalendars } from '../../hooks/calendar.hooks';
import { apiUrls } from '../../utils/urls';
import { Calendar } from 'shared';

interface IcsSubscribeModalProps {
  open: boolean;
  onClose: () => void;
}

const IcsSubscribeModal: React.FC<IcsSubscribeModalProps> = ({ open, onClose }) => {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const { data: tokenData, isLoading: tokenLoading, isError: tokenError, error: tokenErr } = useGetIcsToken();
  const {
    data: allCalendars,
    isLoading: calendarsLoading,
    isError: calendarsError,
    error: calendarsErr
  } = useAllCalendars();

  if (tokenError) return <ErrorPage message={tokenErr?.message} />;
  if (calendarsError) return <ErrorPage message={calendarsErr?.message} />;

  const isLoading = tokenLoading || calendarsLoading;
  const allSelected = !!allCalendars && selectedCalendarIds.length === allCalendars.length;
  const someSelected = selectedCalendarIds.length > 0 && !allSelected;

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId]
    );
  };

  const toggleAll = () => {
    setSelectedCalendarIds(allSelected ? [] : (allCalendars ?? []).map((c) => c.calendarId));
  };

  const handleCopy = async () => {
    if (!tokenData) return;
    const feedUrl = apiUrls.icsFeed(tokenData.icsToken, tokenData.organizationId, selectedCalendarIds, []);
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NERModal open={open} onHide={onClose} title="Connect With Your Calendar" hideFormButtons showCloseButton>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2">
            Your feed includes events you're invited to and events for your teams. Optionally include additional calendars
            below.
          </Typography>

          {allCalendars && allCalendars.length > 0 && (
            <FormGroup>
              <FormControlLabel
                control={<Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />}
                label="Select All"
              />
              {allCalendars.map((cal: Calendar) => (
                <FormControlLabel
                  key={cal.calendarId}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedCalendarIds.includes(cal.calendarId)}
                      onChange={() => toggleCalendar(cal.calendarId)}
                    />
                  }
                  label={cal.name}
                  sx={{ pl: 2 }}
                />
              ))}
            </FormGroup>
          )}

          <NERButton
            variant="contained"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            disabled={!tokenData}
          >
            {copied ? 'Copied!' : 'Copy Feed URL'}
          </NERButton>

          <Typography variant="caption" color="text.secondary">
            In Google Calendar: click <strong>+ Other calendars</strong> → <strong>From URL</strong> → paste this link.
          </Typography>
        </Stack>
      )}
    </NERModal>
  );
};

export default IcsSubscribeModal;
