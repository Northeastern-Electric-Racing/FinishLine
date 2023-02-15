/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { QueryClient, QueryClientProvider } from 'react-query';

type Props = {
  children?: React.ReactNode;
};

const AppContextQuery = (props: Props) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};

export default AppContextQuery;
