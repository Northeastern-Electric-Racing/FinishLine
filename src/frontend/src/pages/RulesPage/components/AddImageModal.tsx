/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { FileUpload } from '@mui/icons-material';
import { MAX_FILE_SIZE, Rule } from 'shared';
import NERModal from '../../../components/NERModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useEditRule, useUploadRulesetFile } from '../../../hooks/rules.hooks';

interface AddImageModalProps {
  open: boolean;
  onClose: () => void;
  ruleId: string | null;
  allRules: Rule[];
}

const AddImageModal: React.FC<AddImageModalProps> = ({ open, onClose, ruleId, allRules }) => {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: uploadFile } = useUploadRulesetFile();
  const { mutateAsync: editRuleMutation } = useEditRule();

  const activeRule = ruleId ? allRules.find((r) => r.ruleId === ruleId) : undefined;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const [selectedFile] = e.target.files;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File exceeds the maximum size limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
      return;
    }

    setFile(selectedFile);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file || !activeRule) return;

    setIsSubmitting(true);
    try {
      const fileId = await uploadFile(file);
      await editRuleMutation({
        ruleId: activeRule.ruleId,
        ruleContent: activeRule.ruleContent,
        imageFileIds: [...activeRule.imageFileIds, fileId]
      });
      toast.success('Image added');
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NERModal
      open={open}
      onHide={handleClose}
      title="Add Image"
      onSubmit={handleSubmit}
      submitText="Submit"
      disabled={!file || isSubmitting}
      showCloseButton
    >
      <Box sx={{ minWidth: '400px', display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {file && <Typography>{file.name}</Typography>}
          <Button variant="contained" color="success" component="label" startIcon={<FileUpload />} disabled={!!file}>
            {file ? 'Image Selected' : 'Select Image'}
            <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
          </Button>
        </Box>
      </Box>
    </NERModal>
  );
};

export default AddImageModal;
