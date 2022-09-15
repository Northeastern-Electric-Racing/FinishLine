// /*
//  * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
//  * See the LICENSE file in the repository root folder for details.
//  */

// import { render, screen } from '@testing-library/react';
// import { useTheme } from '../../../../hooks/Theme.hooks';
// import themes from '../../../../utils/Themes';
// import { Theme } from '../../../../utils/Types';
// import RiskLog from '../../../../pages/ProjectDetailPage/ProjectViewContainer/RiskLog';
// import { exampleRisk1, exampleRisk2, exampleRisk3 } from '../../../TestSupport/TestData/Risks.stub';
// import { Auth } from '../../../../utils/Types';
// import { useAuth } from '../../../../hooks/Auth.hooks';
// import { mockAuth, mockPromiseAxiosResponse } from '../../../TestSupport/TestData/TestUtils.stub';
// import { exampleAdminUser } from '../../../TestSupport/TestData/Users.stub';
// import { exampleProject1 } from '../../../TestSupport/TestData/Projects.stub';
// import { getRisksForProject } from '../../../../apis/Risks.api';
// import { AxiosResponse } from 'axios';
// import { Risk } from 'shared';
// import { useGetRisksForProject } from '../../../../hooks/Risks.hooks';
// import { renderHook } from '@testing-library/react-hooks';
// import wrapper from '../../../../app/AppContextQuery';

// jest.mock('../../../../hooks/Theme.hooks');
// const mockTheme = useTheme as jest.Mock<Theme>;

// const mockHook = () => {
//   mockTheme.mockReturnValue(themes[0]);
// };

// jest.mock('../../../../hooks/Auth.hooks');
// const mockedUseAuth = useAuth as jest.Mock<Auth>;

// jest.mock('../../../../apis/Risks.api');

// const mockAuthHook = (user = exampleAdminUser) => {
//   mockedUseAuth.mockReturnValue(mockAuth(false, user));

// const testRisks = [exampleRisk1, exampleRisk2, exampleRisk3];

// describe('Rendering Project Risk Log Component', () => {
//   beforeEach(() => mockHook());

//   it('Renders the RiskLog title', async () => {
//     mockAuthHook();
//     const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
//     mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));

//     const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
//       wrapper
//     });
//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(testRisks);
//     render(<RiskLog projectId={exampleProject1.id} />);
//     expect(screen.getByText('Risk Log')).toBeInTheDocument();
//   });

//   it('Renders all of the risks', async () => {
//     mockAuthHook();
//     const mockRisks = getRisksForProject as jest.Mock<Promise<AxiosResponse<Risk[]>>>;
//     mockRisks.mockReturnValue(mockPromiseAxiosResponse<Risk[]>(testRisks));

//     const { result, waitFor } = renderHook(() => useGetRisksForProject(exampleProject1.id), {
//       wrapper
//     });
//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(testRisks);
//     render(<RiskLog projectId={exampleProject1.id} />);
//     expect(screen.getByText('Risk #1')).toBeInTheDocument();
//     expect(screen.getByText('Risk #2')).toBeInTheDocument();
//     expect(screen.getByText('Risk #3')).toBeInTheDocument();
//   });
// });
