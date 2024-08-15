import { useAllLinkTypes } from '../hooks/projects.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import { IconButton, MenuItem, Select } from '@mui/material';
import {
  Control,
  FieldArrayWithId,
  FieldErrorsImpl,
  FieldValues,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormWatch
} from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRequiredLinkTypeNames } from '../utils/link.utils';
import { ProjectFormInput } from '../pages/ProjectDetailPage/ProjectForm/ProjectForm';
import { Box } from '@mui/system';
import { NERButton } from './NERButton';
import { useEffect, useMemo } from 'react';
import ReactHookTextField from './ReactHookTextField';

const LinksEditView: React.FC<{
  ls: FieldArrayWithId[];
  control: Control<ProjectFormInput>;
  errors: FieldErrorsImpl<ProjectFormInput>;
  register: UseFormRegister<ProjectFormInput>;
  watch: UseFormWatch<ProjectFormInput>;
  append: UseFieldArrayAppend<ProjectFormInput, 'links'>;
  remove: UseFieldArrayRemove;
  enforceRequired?: boolean;
}> = ({ ls, control, errors, register, append, remove, watch, enforceRequired }) => {
  const { isLoading, isError, error, data: linkTypes } = useAllLinkTypes();

  const requiredLinkTypeNames = useMemo(() => {
    return linkTypes ? getRequiredLinkTypeNames(linkTypes) : [];
  }, [linkTypes]);

  const links = watch('links');

  useEffect(() => {
    if (enforceRequired) {
      requiredLinkTypeNames.forEach((linkTypeName) => {
        if (links.some((link) => link.linkTypeName === linkTypeName)) return;
        append({ linkId: '-1', url: '', linkTypeName });
      });
    }
  }, [append, enforceRequired, linkTypes, links, requiredLinkTypeNames]);

  if (isLoading || !linkTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const currentLinkTypeNames = links.map((link) => link.linkTypeName);

  /* Checks whether the link at the given index is of a required type and does not already exist  */
  const isRequired = (index: number) => {
    const link = watch(`links.${index}`);
    const { linkTypeName } = link;
    return (
      requiredLinkTypeNames.includes(linkTypeName) &&
      !currentLinkTypeNames.includes(linkTypeName, currentLinkTypeNames.indexOf(linkTypeName) + 1)
    );
  };

  const isValidLink = (index: number, yupErrors: FieldValues) => {
    return yupErrors.at(index)?.url;
  };

  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: '5px' }}>
            <Select
              {...register(`links.${i}.linkTypeName`, { required: true })}
              sx={{ minWidth: '200px', mr: '5px' }}
              disabled={enforceRequired && isRequired(i)}
              value={watch(`links.${i}.linkTypeName`)}
            >
              {linkTypes.map((linkType) => (
                <MenuItem key={linkType.name} value={linkType.name}>
                  {linkType.name}
                </MenuItem>
              ))}
            </Select>
            <ReactHookTextField
              required
              fullWidth
              control={control}
              errorMessage={errors && errors.links && isValidLink(i, errors.links)}
              {...register(`links.${i}.url`, { required: true })}
            />
            <Box sx={{ minWidth: '56px', height: '40px' }}>
              {(!enforceRequired || !isRequired(i)) && (
                <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}
      <NERButton
        variant="contained"
        color="primary"
        onClick={() => append({ linkId: '-1', url: '', linkTypeName: '-1' })}
        sx={{ my: 2, width: 'max-content' }}
      >
        + Add Link
      </NERButton>
    </>
  );
};

export default LinksEditView;
