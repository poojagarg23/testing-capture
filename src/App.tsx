import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideBar from './components/reusable/Sidebar';
import PatientList from './components/main/PatientList';
import Charges from './components/main/Charges';
import SignIn from './components/main/SignIn';
import SignUp from './components/main/SignUp';
import ResetPassword from './components/main/ResetPassword';
import MacroMateClinical from './components/reusable/MacroMateClinical';
import Directory from './components/single/Directory';
import SuggestionsAndFeedback from './components/reusable/SuggestionsAndFeedback';
import ConsultsTrackingTable from './components/reusable/ConsultsTrackingTable';
import Patient from './components/main/Patient.tsx';
import Utilities from './components/main/Utilities.tsx';
import EmployeeCalendar from './components/reusable/EmployeeCalendar.tsx';
import TrainingMaterials from './components/reusable/TrainingMaterials.tsx';
import DispoConsult from './components/reusable/DispoConsult.tsx';
import Profile from './components/reusable/Profile.tsx';
import MyProfile from './components/single/MyProfile.tsx';
import ManageAbsence from './components/single/ManageAbsence.tsx';
import SecurityAndPrivacy from './components/single/SecurityAndPrivacy.tsx';
import NotFound from './components/main/NotFound.tsx';
import PrivateRoute from './PrivateRoute.tsx';
// import PullToRefreshOverlay from './components/reusable/PullToRefreshOverlay';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pull-to-refresh is handled by the dedicated overlay component.

  return (
    <>
      <Routes>
        {/* Authentication routes - full screen without sidebar */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes - with sidebar layout */}
        <Route
          path="/*"
          element={
            <div className="flex h-screen bg-main overflow-x-hidden justify-center">
              {/* Hamburger for mobile/tablet */}
              <button
                className="fixed top-4 left-4 z-50 cursor-pointer lg:hidden bg-white rounded-full p-2 shadow"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Centered container that wraps sidebar + gap + main */}
              <div className="flex w-full h-full container-max-width">
                {/* Sidebar container - dynamic width based on collapsed state */}
                <div
                  className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
                    sidebarCollapsed
                      ? 'w-[80px] min-w-[80px] max-w-[80px]'
                      : 'sidebar-width sidebar-constraints'
                  }`}
                >
                  <SideBar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                  />
                </div>

                {/* Gap - 5% width with min-width 50px */}
                <div className="hidden bg-main lg:block gap-width gap-constraints flex-shrink-0" />

                {/* 
                Main content container - takes remaining space
                CONSISTENT PATTERN FOR ALL CHILD COMPONENTS:
                - Main container: flex-1 w-full md:w-[85%] p-4 md:p-8 overflow-x-auto
                - Inner wrapper: w-full h-full pt-14 md:pt-0 (pt-14 for mobile hamburger spacing)
                - Child components should use: w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-6
              */}
                <main className="flex-1 bg-main w-full p-4 lg:p-8 overflow-x-auto h-full">
                  <div className="w-full height-landscape h-full pt-14 lg:pt-0">
                    <Routes>
                      <Route
                        path="/patient-list"
                        element={
                          <PrivateRoute>
                            <PatientList />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/charges"
                        element={
                          <PrivateRoute>
                            <Charges />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/patient"
                        element={
                          <PrivateRoute>
                            <Patient />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities"
                        element={
                          <PrivateRoute>
                            <Utilities />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/macromate-clinical"
                        element={
                          <PrivateRoute>
                            <MacroMateClinical />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/directory"
                        element={
                          <PrivateRoute>
                            <Directory />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/suggestions-and-feedback"
                        element={
                          <PrivateRoute>
                            <SuggestionsAndFeedback />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/consults-tracking-table"
                        element={
                          <PrivateRoute>
                            <ConsultsTrackingTable />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/calendar"
                        element={
                          <PrivateRoute>
                            <EmployeeCalendar />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/training-materials"
                        element={
                          <PrivateRoute>
                            <TrainingMaterials />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/utilities/Dispo-Consult"
                        element={
                          <PrivateRoute>
                            <DispoConsult />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/profile/*"
                        element={
                          <PrivateRoute>
                            <Profile />
                          </PrivateRoute>
                        }
                      >
                        <Route path="my-profile" element={<MyProfile />} />
                        <Route path="manage-absence" element={<ManageAbsence />} />
                        <Route path="security-privacy" element={<SecurityAndPrivacy />} />
                        <Route index element={<MyProfile />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>

              {/* Mobile sidebar overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Mobile sidebar */}
              <div className="lg:hidden h-full">
                <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          }
        />
      </Routes>

      {/* Pull-to-refresh overlay */}
      {/* <PullToRefreshOverlay /> */}

      {/* Toast Container - moved outside Routes to be available globally */}
      <ToastContainer position="top-right" />
    </>
  );
};

export default App;
