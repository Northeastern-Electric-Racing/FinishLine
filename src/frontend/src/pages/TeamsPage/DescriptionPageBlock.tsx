/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, IconButton, TextField, useTheme } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useEditTeamDescription } from '../../hooks/teams.hooks';
import { Team, isUnderWordCount, countWords, isAdmin } from 'shared';
import { Edit } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import ReactMarkdown from 'react-markdown';
import styles from '../../stylesheets/pages/teams.module.css';
import { useToast } from '../../hooks/toasts.hooks';

interface DescriptionPageBlockProps {
  team: Team;
}

const DescriptionPageBlock: React.FC<DescriptionPageBlockProps> = ({ team }) => {
  const auth = useAuth();
  const theme = useTheme();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(team.description);
  const [isPreview, setIsPreview] = useState(false);
  const { isLoading, isError, error, mutateAsync } = useEditTeamDescription(team.teamId);
  const toast = useToast();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const handleSubmit = async () => {
    if (!isUnderWordCount(description, 300)) {
      return alert('Description must be less than 300 words');
    }
    try {
      await mutateAsync(description);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }

    resetDefaults();
  };

  const resetDefaults = () => {
    setIsEditingDescription(false);
    setIsPreview(false);
  };
  const hasPerms = auth.user && (isAdmin(auth.user.role) || auth.user.userId === team.head.userId);

  const editButtons = (
    <div style={{ display: 'flex' }}>
      <Button
        onClick={() => {
          resetDefaults();
          setDescription(team.description);
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => setIsPreview(!isPreview)}
        sx={{
          ml: 2,
          backgroundColor: theme.palette.grey[600],
          color: theme.palette.getContrastText(theme.palette.grey[600]),
          '&:hover': {
            backgroundColor: theme.palette.grey[700]
          }
        }}
      >
        {isPreview ? 'Edit' : 'Preview'}
      </Button>
      <Button
        sx={{
          ml: 2,
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.success.dark
          }
        }}
        onClick={handleSubmit}
      >
        Save
      </Button>
    </div>
  );

  const editingView = (
    <PageBlock title={'Description'} headerRight={editButtons}>
      {isPreview ? (
        <ReactMarkdown className={styles.markdown}>{description}</ReactMarkdown>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          inputProps={{
            maxLength: isUnderWordCount(description, 300) ? null : 0
          }}
          helperText={`${countWords(description)}/300 words`}
          error={!isUnderWordCount(description, 300)}
        />
      )}
    </PageBlock>
  );

  const nonEditingView = (
    <PageBlock
      title={'Description'}
      headerRight={hasPerms ? <IconButton onClick={() => setIsEditingDescription(true)} children={<Edit />} /> : null}
    >
      <ReactMarkdown className={styles.markdown}>{description}</ReactMarkdown>
    </PageBlock>
  );

  return isEditingDescription ? editingView : nonEditingView;
};

export default DescriptionPageBlock;
