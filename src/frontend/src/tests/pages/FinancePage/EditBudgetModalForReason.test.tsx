/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, fireEvent, waitFor, within } from '../../test-support/test-utils';
import { IndexCode, OtherProductReason } from 'shared';
import { EditBudgetModalForReason } from '../../../pages/FinancePage/FinanceComponents/EditBudgetModalForReason';
import * as financeHooks from '../../../hooks/finance.hooks';
import * as userHooks from '../../../hooks/users.hooks';
import * as toastHooks from '../../../hooks/toasts.hooks';
import * as changeRequestsApi from '../../../apis/change-requests.api';
import { mockUseQueryResult } from '../../test-support/test-data/test-utils.stub';
import { exampleAuthenticatedAdminUser } from '../../test-support/test-data/authenticated-user.stub';
import { exampleAdminUser } from '../../test-support/test-data/users.stub';

const exampleIndexCode: IndexCode = {
  indexCodeId: 'index-code-1',
  name: 'CASH',
  code: '830667',
  userCreated: exampleAdminUser,
  dateCreated: new Date()
};

const exampleCategory: OtherProductReason = {
  otherProductReasonId: 'category-1',
  name: 'GENERAL_TOOLS',
  userCreated: exampleAdminUser,
  dateCreated: new Date(),
  budget: 500000,
  indexCode: exampleIndexCode,
  accountCodes: []
};

const mockToastError = vi.fn();
const mockHandleClose = vi.fn();

const renderComponent = () => render(<EditBudgetModalForReason showModal handleClose={mockHandleClose} />);

const selectOption = (comboboxIndex: number, optionText: string) => {
  fireEvent.mouseDown(screen.getAllByRole('combobox')[comboboxIndex]);
  fireEvent.click(within(screen.getByRole('listbox')).getByText(optionText));
};

const fillAndSubmit = (amount: string) => {
  selectOption(0, 'General Tools');
  selectOption(1, 'CASH');
  fireEvent.change(screen.getByPlaceholderText('New Amount'), { target: { value: amount } });
  fireEvent.click(screen.getByText('Create Change Request'));
};

describe('EditBudgetModalForReason', () => {
  beforeEach(() => {
    vi.spyOn(financeHooks, 'useGetAllIndexCodes').mockReturnValue(
      mockUseQueryResult<IndexCode[]>(false, false, [exampleIndexCode]) as ReturnType<
        typeof financeHooks.useGetAllIndexCodes
      >
    );
    vi.spyOn(financeHooks, 'useGetAllOtherProductReason').mockReturnValue(
      mockUseQueryResult<OtherProductReason[]>(false, false, [exampleCategory]) as ReturnType<
        typeof financeHooks.useGetAllOtherProductReason
      >
    );
    vi.spyOn(userHooks, 'useCurrentUser').mockReturnValue(exampleAuthenticatedAdminUser);
    vi.spyOn(toastHooks, 'useToast').mockReturnValue({
      fire: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      error: mockToastError
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockToastError.mockReset();
    mockHandleClose.mockReset();
  });

  it('converts a whole dollar amount to cents before creating the change request', async () => {
    const createSpy = vi
      .spyOn(changeRequestsApi, 'createBudgetChangeRequest')
      .mockResolvedValue({ data: { message: 'ok' } } as Awaited<
        ReturnType<typeof changeRequestsApi.createBudgetChangeRequest>
      >);

    renderComponent();
    fillAndSubmit('5000');

    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    expect(createSpy).toHaveBeenCalledWith(exampleAuthenticatedAdminUser.userId, 500000, 'category-1', undefined);
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('converts a dollar amount with cents to a whole number of cents', async () => {
    const createSpy = vi
      .spyOn(changeRequestsApi, 'createBudgetChangeRequest')
      .mockResolvedValue({ data: { message: 'ok' } } as Awaited<
        ReturnType<typeof changeRequestsApi.createBudgetChangeRequest>
      >);

    renderComponent();
    // 19.99 * 100 is 1998.9999999999998 in floating point, so this checks the value is rounded
    fillAndSubmit('19.99');

    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    expect(createSpy).toHaveBeenCalledWith(exampleAuthenticatedAdminUser.userId, 1999, 'category-1', undefined);
  });

  it('shows an error toast and stays open when creating the change request fails', async () => {
    vi.spyOn(changeRequestsApi, 'createBudgetChangeRequest').mockRejectedValue(new Error('Request failed'));

    renderComponent();
    fillAndSubmit('5000');

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Request failed'));
    expect(mockHandleClose).not.toHaveBeenCalled();
  });
});
