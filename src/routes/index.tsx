import { createBrowserRouter } from 'react-router-dom';
import { DashboardContainer } from "@/containers";
import {
  DatasetUploadView,
  ModelUploadView,
  DetailView,
  Assets
} from "@/components/dashboard";
import { RootLayout } from '../components/layouts';
import { Navigate } from 'react-router-dom';
import Faucet from '@/components/Faucet';
import ProvidersDetails from '@/components/dashboard/ProvidersDetails';
import PlayGround from '@/components/playground/PlayGround';
import { CompContainer } from '@/components/competition/CompContainer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/all" replace />,
      },
      {
        path: '/dashboard',
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/all" replace />,
          },
          {
            path: ':view',
            element: <DashboardContainer />,
            children: [
              {
                path: 'assets',
                element: <Assets />
              }
            ]
          },
          {
            path: 'model/:id',
            element: <DetailView />
          },
          {
            path: 'dataset/:id',
            element: <DetailView />
          },
          {
            path: 'infra/:id',
            element: <DetailView />
          },
          {
            path: 'assets/:id',
            element: <DetailView />
          },

          {
            path: 'upload/model',
            element: <ModelUploadView />,
          },
          {
            path: 'upload/dataset',
            element: <DatasetUploadView />,
          },
          {
            path: 'providerDetails/:id',
            element: <ProvidersDetails />,
          }

        ]
      },
      {
        path: 'faucet',
        element: <Faucet />,
      },
      {
        path: 'playground',
        element: <PlayGround />,
      },
      {
        path: '/competition/:compid',
        children: [
          {
            index: true,
            element: <CompContainer />,
          },
          {
            path: ':view',
            element: <CompContainer />,
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/dashboard/all" replace />,
      }
    ]
  }
]);