/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AxiosResponse } from 'axios';
import { UseMutationResult, UseQueryResult } from 'react-query';
import { User } from 'shared';
import { exampleAdminUser } from './users.stub';
import { Auth, LinkItem } from '../../../utils/Types';
import { faExchangeAlt, faFolder, faHome } from '@fortawesome/free-solid-svg-icons';
import { routes } from '../../../utils/Routes';

export const mockContext = {
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  callbackWaitsForEmptyEventLoop: false,
  getRemainingTimeInMillis: () => 0,
  done: () => 0,
  fail: () => 0,
  succeed: () => 0
};

export const mockPromiseAxiosResponse = <Return>(data: Return) => {
  return new Promise((res, rej) => res({ status: 0, statusText: '', headers: {}, config: {}, data })) as Promise<
    AxiosResponse<Return>
  >;
};

export const mockUseQueryResult = <Return>(isLoading: boolean, isError: boolean, data?: Return, err?: Error) => {
  return {
    data: data ?? undefined,
    error: err ?? null,
    isError,
    isIdle: true,
    isLoading,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: false,
    status: 'idle',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isStale: false,
    refetch: () => {
      return new Promise((_res, _rej) => 5);
    },
    remove: () => {
      return 0;
    }
  } as UseQueryResult<Return, Error>;
};

export const mockUseMutationResult = <Input>(isLoading: boolean, isError: boolean, input: Input, err?: Error) => {
  return {
    error: err ?? null,
    isError,
    isLoading,
    context: undefined,
    data: undefined,
    failureCount: 0,
    isIdle: true,
    isPaused: false,
    isSuccess: true,
    variables: undefined,
    reset: () => {},
    status: 'idle',
    mutate: () => {},
    mutateAsync: () => {
      return new Promise((_res, _rej) => 5);
    }
  } as UseMutationResult<Input, Error>;
};

export const mockAuth = (isLoading: boolean, user?: User) => {
  return {
    user,
    devSignin: (u) => new Promise((res, rej) => res(exampleAdminUser)),
    signin: (t) => new Promise((res, rej) => res(exampleAdminUser)),
    signout: () => {},
    isLoading
  } as Auth;
};

export const mockUtils = {
  add: () => null,
  remove: () => null,
  update: () => null
};

export const testLinkItems: LinkItem[] = [
  {
    name: 'Home',
    icon: faHome,
    route: routes.HOME
  },
  {
    name: 'Projects',
    icon: faFolder,
    route: routes.PROJECTS
  },
  {
    name: 'Change Requests',
    icon: faExchangeAlt,
    route: routes.CHANGE_REQUESTS
  }
];
