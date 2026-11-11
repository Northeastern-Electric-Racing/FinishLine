import { RoleEnum, WorkPackageStage } from 'shared';
import WorkPackagesService from '../../src/services/work-packages.services';

const user = {
  userId: '123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  role: RoleEnum.ADMIN
};

const project = new 


const wbsNum = WorkPackagesService.createWorkPackage(
  user,
  'Example name 1',
  '1',
  WorkPackageStage.Design,
  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toDateString(), // 3 days ago
  2,
  [],
  [],
  new ,
  'team'
);

describe('Irrelevant Work Package States');
