import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import CreateEventPage from './pages/CreateEventPage';
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
import BackendOfflineBanner from './components/BackendOfflineBanner';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <div className="App">
      <BackendOfflineBanner>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/manual-payment/:saleId" element={<ManualPaymentPage />} />
          <Route path="/success/:saleId" element={<SuccessPage />} />
          <Route path="/tickets/:saleId" element={<SuccessPage />} />
          <Route path="/organizer/:userId" element={<OrganizerProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/events" element={<EventsManagementPage />} />
          <Route path="/dashboard/events/create" element={<CreateEventPage />} />
          <Route path="/dashboard/events/:id" element={<ShowEventPage />} />
          <Route path="/dashboard/events/:id/edit" element={<EditEventPage />} />
          <Route path="/dashboard/promo-codes" element={<PromoCodesPage />} />
          <Route path="/dashboard/affiliate" element={<CampaignsPage />} />
          <Route path="/dashboard/campaigns/:id/enrollments" element={<CampaignEnrollmentsPage />} />
          <Route path="/dashboard/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
          <Route path="/dashboard/orders" element={<OrdersPage />} />
          <Route path="/dashboard/sold-tickets" element={<SoldTicketsPage />} />
          <Route path="/dashboard/customers" element={<CustomersPage />} />
          <Route path="/dashboard/complimentary" element={<ComplimentaryTicketsPage />} />
          <Route path="/dashboard/wallet" element={<WalletPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/affiliate/learn-more" element={<AffiliateLearnMorePage />} />
          <Route path="/affiliate/register" element={<AffiliateRegisterPage />} />
          <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />
          <Route path="/affiliate/campaigns" element={<AffiliateBrowseCampaignsPage />} />
          <Route path="/affiliate/my-campaigns" element={<AffiliateMyCampaignsPage />} />
          <Route path="/affiliate/earnings" element={<AffiliateEarningsPage />} />
          <Route path="/affiliate/withdrawals" element={<AffiliateWithdrawalsPage />} />
          <Route path="/dashboard/affiliate-management/campaigns/:campaignId/enrollments" element={<OrganizerAffiliateEnrollmentsPage />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
          </Routes>
        </BrowserRouter>
      </BackendOfflineBanner>
      <Toaster position="top-center" richColors expand={true} />
    </div>
  );
}

export default App;
