/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { QueryClient, QueryClientProvider } from 'react-query';

const AppContextQuery: React.FC = (props) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};

export default AppContextQuery;
