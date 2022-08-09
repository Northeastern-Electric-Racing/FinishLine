/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UseMutationResult, UseQueryResult } from 'react-query';
import { UserSettings } from 'shared';
import {
  useLogUserIn,
  useSingleUserSettings,
  useUpdateUserSettings
} from '../../../services/users.hooks';
import {
  mockUseMutationResult,
  mockUseQueryResult
} from '../../../test-support/test-data/test-utils.stub';
import { exampleUserSettingsLight } from '../../../test-support/test-data/user-settings.stub';
import { fireEvent, render, screen } from '../../../test-support/test-utils';
import UserSettingsComponent from './user-settings';

jest.mock('./user-settings-view/user-settings-view', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>user-settings-view</div>;
    }
  };
});

jest.mock('./user-settings-edit/user-settings-edit', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>user-settings-edit</div>;
    }
  };
});

jest.mock('../../../services/users.hooks');

const mockedUseSingleUserSettings = useSingleUserSettings as jest.Mock<
  UseQueryResult<UserSettings>
>;

const mockUserSettingsHook = (
  isLoading: boolean,
  isError: boolean,
  data?: UserSettings,
  error?: Error
) => {
  mockedUseSingleUserSettings.mockReturnValue(
    mockUseQueryResult<UserSettings>(isLoading, isError, data, error)
  );
};

const mockedUseUpdateUserSettings = useUpdateUserSettings as jest.Mock<UseMutationResult>;

const mockUseUpdateUserSettingsHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseUpdateUserSettings.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

const mockedUseLogUserIn = useLogUserIn as jest.Mock<UseMutationResult>;

const mockUseLogUserInHook = (isLoading: boolean, isError: boolean, error?: Error) => {
  mockedUseLogUserIn.mockReturnValue(
    mockUseMutationResult<{ in: string }>(isLoading, isError, { in: 'hi' }, error)
  );
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  mockUseLogUserInHook(false, false);
  mockUseUpdateUserSettingsHook(false, false);
  return render(<UserSettingsComponent userId={1} />);
};

describe('user settings component', () => {
  it('renders without error', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
  });

  it('renders loading', () => {
    mockUserSettingsHook(true, false);
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error', () => {
    mockUserSettingsHook(false, true, undefined, new Error('test error'));
    renderComponent();
    expect(screen.getByText('test error')).toBeInTheDocument();
  });

  it('renders title', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    expect(screen.getByText('User Settings')).toBeInTheDocument();
  });

  it('renders user settings view', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    expect(screen.getByText('user-settings-view')).toBeInTheDocument();
  });

  it('renders edit pencil icon button', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays edit form when edit pencil icon button is clicked', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('user-settings-edit')).toBeInTheDocument();
  });

  it('does not render edit pencil icon button after clicked', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryAllByRole('button').map((e) => e.innerHTML)).toStrictEqual([
      'Cancel',
      'Save'
    ]);
  });

  it('renders cancel and save buttons with edit form', () => {
    mockUserSettingsHook(false, false, exampleUserSettingsLight);
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
