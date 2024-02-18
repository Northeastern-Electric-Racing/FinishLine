import PageBlock from '../../layouts/PageBlock';
import LinkTypeTable from './ProjectsConfig/LinkTypeTable';

const AdminToolsProjectsConfig: React.FC = () => {
  return (
    <PageBlock title="Projects Config">
      <LinkTypeTable />
    </PageBlock>
  );
};

export default AdminToolsProjectsConfig;
