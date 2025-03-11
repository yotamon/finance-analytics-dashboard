import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { FinancialDataProvider } from "./context/FinancialDataContext";
import { SettingsProvider } from "./context/SettingsContext";
import { UiStateProvider } from "./context/UiStateContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ConfigProvider } from "./context/ConfigContext";
import { DataProvider } from "./context/DataContext";
import { I18nProvider } from "./context/I18nContext";
import { UiProvider } from "./context/UiContext";
import { ThemeProvider as DesignSystemThemeProvider } from "./design-system/ThemeProvider";

// Layout Components
import MainLayout from "./components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ExportPage from "./pages/ExportPage";
import Upload from "./pages/Upload";
import TestPage from "./pages/TestPage";

// Placeholder for pages not yet implemented
const PlaceholderPage: React.FC<{ pageName: string }> = ({ pageName }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h1>{pageName} Page</h1>
    <p>This page is under construction.</p>
  </div>
);

/**
 * Main App component that sets up the application with
 * routing and global context providers
 */
const App: React.FC = () => {
  return (
    <ConfigProvider>
      <SettingsProvider>
        <ThemeProvider>
          <CssBaseline />
          <DesignSystemThemeProvider>
            <I18nProvider>
              <UiProvider>
                <UiStateProvider>
                  <CurrencyProvider>
                    <DataProvider>
                      <FinancialDataProvider>
                        <Router>
                          <Routes>
                            <Route path="/" element={<MainLayout />}>
                              {/* Dashboard - Home page */}
                              <Route index element={<Dashboard />} />

                              {/* Financial management routes */}
                              <Route
                                path="transactions"
                                element={<PlaceholderPage pageName="Transactions" />}
                              />
                              <Route
                                path="accounts"
                                element={<PlaceholderPage pageName="Accounts" />}
                              />
                              <Route
                                path="categories"
                                element={<PlaceholderPage pageName="Categories" />}
                              />
                              <Route
                                path="budgets"
                                element={<PlaceholderPage pageName="Budgets" />}
                              />

                              {/* Reports and analytics */}
                              <Route
                                path="reports"
                                element={<PlaceholderPage pageName="Reports" />}
                              />

                              {/* Data management */}
                              <Route
                                path="import"
                                element={<PlaceholderPage pageName="Import Data" />}
                              />
                              <Route path="export" element={<ExportPage />} />

                              {/* User preferences */}
                              <Route path="settings" element={<Settings />} />

                              {/* Test page for rendering diagnostics */}
                              <Route path="test" element={<TestPage />} />

                              {/* Redirect legacy URLs */}
                              <Route path="home" element={<Navigate to="/" replace />} />

                              {/* 404 Not Found page */}
                              <Route path="*" element={<NotFound />} />
                            </Route>
                          </Routes>
                        </Router>
                      </FinancialDataProvider>
                    </DataProvider>
                  </CurrencyProvider>
                </UiStateProvider>
              </UiProvider>
            </I18nProvider>
          </DesignSystemThemeProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ConfigProvider>
  );
};

export default App;
