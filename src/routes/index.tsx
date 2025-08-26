

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardContainer } from "@/containers";
import {
  DatasetUploadView,
  ModelUploadView,
  CreatorProfileView,
  DetailView,
  InfraUploadView,
  InfraPricingView,
  InfraReviewView
} from "@/components/dashboard";
import { RootLayout } from '../components/layouts';
import Faucet from '@/components/Faucet';
import PlatformPage from '@/components/dashboard/platformPage';
import PlayGround from '@/components/playground/PlayGround';
import { CompContainer } from '@/components/competition/CompContainer';



const dashboardRoutes = [
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
    path: 'creator/:creatorId',
    element: <CreatorProfileView />
  },
  {
    path: 'upload/model',
    element: <ModelUploadView />
  },
  {
    path: 'upload/dataset',
    element: <DatasetUploadView />
  },
  {
    path: 'providerDetails/:id',
    element: <PlatformPage />
  },
  {
    path: 'upload/infra',
    element: <InfraUploadView />
  },
  {
    path: 'upload/infra/pricing',
    element: <InfraPricingView />
  },
  {
    path: 'upload/infra/review',
    element: <InfraReviewView />
  }
];


const competitionRoutes = [
  {
    index: true,
    element: <CompContainer />
  },
  {
    path: ':view',
    element: <CompContainer />
  }
];



export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/all" replace />
      },
      {
        path: '/dashboard',
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/all" replace />
          },
          {
            path: ':view',
            element: <DashboardContainer />,
            children: dashboardRoutes
          },
          ...dashboardRoutes
        ]
      },
      {
        path: 'faucet',
        element: <Faucet />
      },
      {
        path: 'playground',
        element: <PlayGround />
      },
      {
        path: '/competition/:compid',
        children: competitionRoutes
      },
      {
        path: '*',
        element: <Navigate to="/dashboard/all" replace />
      }
    ]
  }
]);
