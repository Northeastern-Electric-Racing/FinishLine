/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, useTheme } from '@mui/material';
import { Rule } from 'shared';
import { useGetImageUrls } from '../../../hooks/onboarding.hook';

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
}

/**
 * Renders a rule's content followed by a bracketed list of its referenced rule codes.
 */
const RuleContent: React.FC<RuleContentProps> = ({
  rule,
  color,
  onReferenceClick,
  onReferenceRemove,
  isReferenceInteractive
}) => {
  const theme = useTheme();

  const { referencedRules } = rule;

  const { data: imageUrls } = useGetImageUrls(
    rule.imageFileIds.map((fileId) => ({ objectId: fileId, imageFileId: fileId }))
  );

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
      {imageUrls && imageUrls.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {imageUrls.map(
            (image) =>
              image.url && (
                <Box
                  key={image.id}
                  component="img"
                  src={image.url}
                  alt="Rule attachment"
                  sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                />
              )
          )}
        </Box>
      )}
    </Box>
  );
};

export default RuleContent;
