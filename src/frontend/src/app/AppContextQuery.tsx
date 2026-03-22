/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

const AppContextQuery: React.FC = (props) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};

export default AppContextQuery;
