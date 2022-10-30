/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useParams } from 'react-router-dom';
import { validateWBS, isProject } from 'shared';
import WorkPackagePage from './WorkPackageDetailPage/WorkPackagePage';
import ErrorPage from './ErrorPage';
import ProjectPage from './ProjectDetailPage/ProjectPage';

const WBSDetails: React.FC = () => {
  interface ParamTypes {
    wbsNum: string;
  }
  const { wbsNum } = useParams<ParamTypes>();
  let wbsNumber;
  try {
    wbsNumber = validateWBS(wbsNum); // ensure the provided wbsNum is correctly formatted
  } catch (error: any) {
    return <ErrorPage message={error.message} />;
  }

  if (isProject(wbsNumber)) {
    return <ProjectPage wbsNum={wbsNumber} />;
  }
  return <WorkPackagePage wbsNum={wbsNumber} />;
};

export default WBSDetails;
