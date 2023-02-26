/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NERButton } from '../../components/NERButton';
import { Grid, Typography, useTheme } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useState } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { wbsPipe, WorkPackage } from 'shared';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useToast } from '../../hooks/toasts.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
//import WorkPackagesService from '../../../../backend/src/services/work-packages.services';

const AdminToolsWorkPackageMangaement: React.FC = () => {
  const [workPackage, setWorkPackage] = useState<WorkPackage | null>(null);
  const [hideSuccessLabel, setHideSuccessLabel] = useState(true);
  const { isLoading, isError, error, data: workPackages } = useAllWorkPackages();
  const theme = useTheme();
  const toast = useToast();

  if (isLoading || !workPackages) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const workPackageSearchOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      const workPackage = workPackages.find((wp: WorkPackage) => wp.id.toString() === value.id);
      if (workPackage) {
        setWorkPackage(workPackage);
      }
    } else {
      setWorkPackage(null);
    }
  };

  const handleClick = async () => {
    setHideSuccessLabel(true);
    if (!workPackage) return;
    // if (!auth.user) return <LoadingIndicator />;
    try {
      //await WorkPackagesService.deleteWorkPackage({ ...auth.user, googleAuthId: 'testGoogleAuthId' }, workPackage.wbsNum);
      setHideSuccessLabel(false);
      setWorkPackage(null);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const workPackageToAutocompleteOption = (workPackage: WorkPackage): { label: string; id: string } => {
    return { label: `${wbsPipe(workPackage.wbsNum)}`, id: workPackage.id.toString() };
  };

  return (
    <PageBlock title={'Work Package Deletion'}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <NERAutocomplete
            id="work-package-autocomplete"
            onChange={workPackageSearchOnChange}
            options={workPackages.map(workPackageToAutocompleteOption)}
            size="small"
            placeholder="Select a Work Package"
            value={workPackage ? workPackageToAutocompleteOption(workPackage) : null}
          />
        </Grid>
      </Grid>
      <NERButton sx={{ mt: '20px', float: 'right' }} variant="contained" disabled={!workPackage} onClick={handleClick}>
        Delete Work Package
      </NERButton>
      <Typography hidden={hideSuccessLabel} style={{ color: theme.palette.primary.main, marginTop: '20px' }}>
        Successfully Deleted Work Package
      </Typography>
    </PageBlock>
  );
};

export default AdminToolsWorkPackageMangaement;
