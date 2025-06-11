import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Layout
import MainLayout from '@/components/layout/MainLayout';

// Main Pages
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Clients from '@/pages/Clients';
import Suppliers from '@/pages/Suppliers';
import SupplierDetails from '@/pages/SupplierDetails';
import Timeline from '@/pages/Timeline';
import Analytics from '@/pages/Analytics';
import ExternalLinks from '@/pages/ExternalLinks';
import HelpPage from '@/pages/HelpPage';
import FeedbackPage from '@/pages/Feedback';

// Admin Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminClients from '@/pages/admin/AdminClients';
import AdminSuppliers from '@/pages/admin/AdminSuppliers';
import AdminPurchaseOrders from '@/pages/admin/AdminPurchaseOrders';
import AdminExternalLinks from '@/pages/admin/AdminExternalLinks';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminShipments from '@/pages/admin/AdminShipments';
import AdminFeedback from '@/pages/admin/AdminFeedback';

// Not Found
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <DataProvider>
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:projectId" element={<ProjectDetails />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="suppliers/:supplierId" element={<SupplierDetails />} />
                    <Route path="timeline" element={<Timeline />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="external-links" element={<ExternalLinks />} />
                    <Route path="help" element={<HelpPage />} />
                    <Route path="feedback" element={<FeedbackPage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="clients" element={<AdminClients />} />
                    <Route path="suppliers" element={<AdminSuppliers />} />
                    <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
                    <Route path="external-links" element={<AdminExternalLinks />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="shipments" element={<AdminShipments />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                  </Route>

                  {/* Not Found Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
