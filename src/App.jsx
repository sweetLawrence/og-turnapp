import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import ManualPaymentPage from './pages/ManualPaymentPage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsManagementPage from './pages/EventsManagementPage';
import CreateEventPage from './pages/CreateEventPage.jsx';
import EditEventPage from './pages/EditEventPage';
import ShowEventPage from './pages/ShowEventPage';
import PromoCodesPage from './pages/PromoCodesPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignEnrollmentsPage from './pages/CampaignEnrollmentsPage';
import CampaignAnalyticsPage from './pages/CampaignAnalyticsPage';
import OrdersPage from './pages/OrdersPage';
import SoldTicketsPage from './pages/SoldTicketsPage';
import CustomersPage from './pages/CustomersPage';
import ComplimentaryTicketsPage from './pages/ComplimentaryTicketsPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import AffiliateLearnMorePage from './pages/AffiliateLearnMorePage';
import AffiliateRegisterPage from './pages/AffiliateRegisterPage';
import AffiliateDashboardPage from './pages/AffiliateDashboardPage';
import AffiliateBrowseCampaignsPage from './pages/AffiliateBrowseCampaignsPage';
import AffiliateEarningsPage from './pages/AffiliateEarningsPage';
import AffiliateWithdrawalsPage from './pages/AffiliateWithdrawalsPage';
import AffiliateMyCampaignsPage from './pages/AffiliateMyCampaignsPage';
import OrganizerAffiliateEnrollmentsPage from './pages/OrganizerAffiliateEnrollmentsPage';
import OAuthCallback from './components/OAuthCallback';

import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors expand={true} />
    </>
  );
}

// Redirect component for /events/:identifier -> /:identifier
function EventsRedirect() {
  const { identifier } = useParams();
  const location = useLocation();
  
  return (
    <Navigate 
      to={`/${identifier}${location.search}${location.hash}`} 
      replace 
    />
  );
}

// 🆕 Redirect component for /event/:id -> /:id
function LegacyEventRedirect() {
  const { id } = useParams();
  const location = useLocation();

  return (
    <Navigate
      to={`/${id}${location.search}${location.hash}`}
      replace
    />
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Landing Page - root
      { index: true, element: <LandingPage /> },

      // Event Routes
      { path: 'events', element: <EventsPage /> },
      
      // Redirect old /events/:slug to new /:slug (BACKWARD COMPATIBILITY)
      { 
        path: 'events/:identifier', 
        element: <EventsRedirect /> 
      },
      
      // Redirect old /event/:id to new /:id (BACKWARD COMPATIBILITY)
      { path: 'event/:id', element: <LegacyEventRedirect /> },

      // Main event route - supports slug, UUID, or ID (at root level)
      { path: ':identifier', element: <EventDetailsPage /> },

      // Checkout & Payment
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'manual-payment/:saleId', element: <ManualPaymentPage /> },
      { path: 'success/:saleId', element: <SuccessPage /> },
      { path: 'tickets/:saleId', element: <SuccessPage /> },

      // 👤 Auth Routes
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auth/callback', element: <OAuthCallback /> },

      // Organizer Profile
      { path: 'organizer/:identifier', element: <OrganizerProfilePage /> },

      // Dashboard Routes
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'dashboard/events', element: <EventsManagementPage /> },
      { path: 'dashboard/events/create', element: <CreateEventPage /> },
      { path: 'dashboard/events/:identifier', element: <ShowEventPage /> },
      { path: 'dashboard/events/:id/edit', element: <EditEventPage /> },
      { path: 'dashboard/promo-codes', element: <PromoCodesPage /> },
      { path: 'dashboard/affiliate', element: <CampaignsPage /> },
      { path: 'dashboard/campaigns/:id/enrollments', element: <CampaignEnrollmentsPage /> },
      { path: 'dashboard/campaigns/:id/analytics', element: <CampaignAnalyticsPage /> },
      { path: 'dashboard/orders', element: <OrdersPage /> },
      { path: 'dashboard/sold-tickets', element: <SoldTicketsPage /> },
      { path: 'dashboard/customers', element: <CustomersPage /> },
      { path: 'dashboard/complimentary', element: <ComplimentaryTicketsPage /> },
      { path: 'dashboard/wallet', element: <WalletPage /> },
      { path: 'dashboard/profile', element: <ProfilePage /> },
      { path: 'dashboard/notifications', element: <NotificationsPage /> },
      {
        path: 'dashboard/affiliate-management/campaigns/:campaignId/enrollments',
        element: <OrganizerAffiliateEnrollmentsPage />,
      },

      // Affiliate Routes
      { path: 'affiliate/notifications', element: <NotificationsPage /> },
      { path: 'affiliate/learn-more', element: <AffiliateLearnMorePage /> },
      { path: 'affiliate/register', element: <AffiliateRegisterPage /> },
      { path: 'affiliate/dashboard', element: <AffiliateDashboardPage /> },
      { path: 'affiliate/campaigns', element: <AffiliateBrowseCampaignsPage /> },
      { path: 'affiliate/my-campaigns', element: <AffiliateMyCampaignsPage /> },
      { path: 'affiliate/earnings', element: <AffiliateEarningsPage /> },
      { path: 'affiliate/withdrawals', element: <AffiliateWithdrawalsPage /> },

      // Admin Routes
      { path: 'admin/withdrawals', element: <AdminWithdrawalsPage /> },

      // 404 - Catch all
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;