import { Navigate } from 'react-router-dom';
import { 
  AdminDashboard,
  UserManagement, 
  UserDetails,
  SystemStats,
  DatabaseManagement 
} from '~/components/Admin';
import DashboardRoute from './Layouts/Dashboard';

const adminRoutes = {
  path: 'admin/*',
  element: <DashboardRoute />,
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: 'users',
      element: <UserManagement />,
    },
    {
      path: 'users/:userId',
      element: <UserDetails />,
    },
    {
      path: 'stats',
      element: <SystemStats />,
    },
    {
      path: 'database',
      element: <DatabaseManagement />,
    },
    {
      path: '*',
      element: <Navigate to="/admin" replace={true} />,
    },
  ],
};

export default adminRoutes;
