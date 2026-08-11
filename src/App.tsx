import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import HardwareGallery from './pages/HardwareGallery'
import Packaging3DCustom from './pages/Packaging3DCustom'
import Merchandise3DCustom from './pages/Merchandise3DCustom'
import Dashboard from './pages/Dashboard'
import PlansPage from './pages/PlansPage'
import PersonalCenter from './pages/PersonalCenter'
import ComparePage from './pages/ComparePage'
import AboutPage from './pages/AboutPage'
import SignInPage from './pages/SignInPage'
import ProductCustomList from './pages/ProductCustomList'
import UploadImagePage from './pages/UploadImagePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminPage from './pages/AdminPage'
import LegalPage from './pages/LegalPage'
import PageViewTracker from './components/analytics/PageViewTracker'

function PreviewPathRedirect() {
  const location = useLocation()
  const destination = location.pathname.replace(/^\/dscannabiz/, '') || '/'
  return <Navigate to={`${destination}${location.search}${location.hash}`} replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PageViewTracker />
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/dscannabiz" element={<HomePage />} />
          <Route path="/dscannabiz/*" element={<PreviewPathRedirect />} />
          <Route path="/hardware-gallery" element={<HardwareGallery />} />
          <Route path="/hardware-gallery/compare" element={<ComparePage />} />
          <Route path="/hardware-gallery/:sku" element={<HardwareGallery />} />
          <Route path="/search-results" element={<HardwareGallery />} />
          <Route path="/upload-image" element={<ProtectedRoute><UploadImagePage /></ProtectedRoute>} />
          <Route path="/product-custom/packaging" element={<ProductCustomList kind="packaging" />} />
          <Route path="/product-custom/merchandise" element={<ProductCustomList kind="merchandise" />} />
          <Route path="/product-custom/packaging/:id/edit" element={<Packaging3DCustom />} />
          <Route path="/product-custom/merchandise/:id/edit" element={<Merchandise3DCustom />} />
          <Route path="/product-custom/packaging/:id/models" element={<Packaging3DCustom initialTab="models" />} />
          <Route path="/product-custom/packaging/:id/layout" element={<Packaging3DCustom initialTab="layout" />} />
          <Route path="/product-custom/packaging/:id/background" element={<Packaging3DCustom initialTab="background" />} />
          <Route path="/product-custom/packaging/:id/video" element={<Packaging3DCustom initialTab="video" />} />
          <Route path="/product-custom/packaging/:id/ai" element={<Packaging3DCustom initialTab="ai" />} />
          <Route path="/product-custom/packaging-3d" element={<Navigate to="/product-custom/packaging" replace />} />
          <Route path="/product-custom/merchandise-3d" element={<Navigate to="/product-custom/merchandise" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/creativities" replace /></ProtectedRoute>} />
          <Route path="/dashboard/:tab" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/personal-center" element={<ProtectedRoute><PersonalCenter /></ProtectedRoute>} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} />
          <Route path="/privacy" element={<LegalPage page="privacy" />} />
          <Route path="/terms" element={<LegalPage page="terms" />} />
          <Route path="/refund-policy" element={<LegalPage page="refunds" />} />
          <Route path="/acceptable-use" element={<LegalPage page="acceptable" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
