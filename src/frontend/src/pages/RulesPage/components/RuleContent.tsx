/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, IconButton, Tooltip, useTheme } from '@mui/material';
import { Close, ErrorOutline } from '@mui/icons-material';
import { useState } from 'react';
import { Rule } from 'shared';
import { useGetImageUrls } from '../../../hooks/onboarding.hook';
import ImagePreviewModal from './ImagePreviewModal';

interface RuleContentProps {
  rule: Rule;
  color?: string;
  // if set, clicking an interactive referenced code navigates to it
  onReferenceClick?: (ruleId: string) => void;
  // if set, referenced rule code turns red on hover and clicking it initiates removal process (for edit view)
  onReferenceRemove?: (ruleId: string) => void;
  // sets selected referenced rules as interactable, when omitted every reference is interactive
  // used in project view since only references in that project will be clickable
  isReferenceInteractive?: (ruleId: string) => boolean;
  // in edit view, a delete icon is shown on each image thumbnail to remove it
  onImageRemove?: (fileId: string) => void;
}

interface RuleImagesProps {
  rule: Rule;
  onImageRemove?: (fileId: string) => void;
}

/**
 * Fetches and renders a rule's image attachments
 */
const RuleImages: React.FC<RuleImagesProps> = ({ rule, onImageRemove }) => {
  const theme = useTheme();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const {
    data: imageUrls,
    isLoading: isImagesLoading,
    isError: isImagesError
  } = useGetImageUrls(rule.imageFileIds.map((fileId) => ({ objectId: fileId, imageFileId: fileId })));

  if (isImagesLoading) {
    return (
      <Box sx={{ mt: 1 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (isImagesError) {
    return (
      <Box sx={{ mt: 1 }}>
        <Tooltip title="Failed to load images" arrow>
          <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ padding: '2px', color: 'error.main' }}>
            <ErrorOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
        {imageUrls.map(
          (image, index) =>
            image.url && (
              <Box key={image.id} sx={{ position: 'relative', width: 48, height: 48 }}>
                <Box
                  component="img"
                  src={image.url}
                  alt="Rule attachment"
                  onClick={() => setPreviewIndex(index)}
                  sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, cursor: 'pointer' }}
                />
                {onImageRemove && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageRemove(image.id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      padding: '2px',
                      backgroundColor: theme.palette.grey[700],
                      '&:hover': { backgroundColor: theme.palette.primary.main }
                    }}
                  >
                    <Close sx={{ fontSize: 14, color: theme.palette.common.white }} />
                  </IconButton>
                )}
              </Box>
            )
        )}
      </Box>
      {previewIndex !== null && imageUrls[previewIndex]?.url && (
        <ImagePreviewModal
          open
          imageUrl={imageUrls[previewIndex].url!}
          title={`Rule ${rule.ruleCode} Image ${previewIndex + 1}`}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
};

/**
 * Renders a rule's content followed by a bracketed list of its referenced rule codes.
 */
const RuleContent: React.FC<RuleContentProps> = ({
  rule,
  color,
  onReferenceClick,
  onReferenceRemove,
  isReferenceInteractive,
  onImageRemove
}) => {
  const theme = useTheme();

  const { referencedRules } = rule;
  const hasImages = rule.imageFileIds.length > 0;

  const handleReferenceClick = (referencedRuleId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReferenceClick) {
      onReferenceClick(referencedRuleId);
    } else if (onReferenceRemove) {
      onReferenceRemove(referencedRuleId);
    }
  };

  // determines if interaction is possible for this view
  const interactionEnabled = Boolean(onReferenceClick || onReferenceRemove);
  // determines if this specific referenced rule is interactable
  const isReferenceInteractable = (ruleId: string) =>
    interactionEnabled && (isReferenceInteractive ? isReferenceInteractive(ruleId) : true);

  return (
    <Box>
      <span style={{ color }}>
        {rule.ruleContent}
        {referencedRules.length > 0 && (
          <Box component="span" sx={{ ml: 0.5 }}>
            {' [ '}
            {referencedRules.map((ref, index) => {
              const interactive = isReferenceInteractable(ref.ruleId);
              return (
                <Box component="span" key={ref.ruleId}>
                  {index > 0 && ', '}
                  <Box
                    component="span"
                    onClick={interactive ? handleReferenceClick(ref.ruleId) : undefined}
                    sx={{
                      textDecoration: interactive ? 'underline' : 'none',
                      cursor: interactive ? 'pointer' : 'default',
                      // for edit view, hovering over a referenced code highlights it red to signal removal
                      ...(interactive && onReferenceRemove && { '&:hover': { color: theme.palette.primary.main } })
                    }}
                  >
                    {ref.ruleCode}
                  </Box>
                </Box>
              );
            })}
            {' ]'}
          </Box>
        )}
      </span>
      {hasImages && <RuleImages rule={rule} onImageRemove={onImageRemove} />}
    </Box>
  );
};

export default RuleContent;
