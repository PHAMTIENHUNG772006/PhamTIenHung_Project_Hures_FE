import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { RequireRole } from '../components/guards/RequireRole';
import { RequireAuth } from '../components/guards/RequireAuth';

// Feature imports
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { BookingListPage } from '../features/reservation/BookingListPage';
import { TableMapView } from '../features/reservation/TableMapView';
import { OrderTakingPage } from '../features/pos/OrderTakingPage';
import { KdsPage } from '../features/kds/KdsPage';
import { IngredientListPage } from '../features/inventory/IngredientListPage';
import { StockImportPage } from '../features/inventory/StockImportPage';
import { RecipeEditorPage } from '../features/inventory/RecipeEditorPage';
import { ShiftSchedulePage } from '../features/hrm/ShiftSchedulePage';
import { AttendancePage } from '../features/hrm/AttendancePage';
import { FinancialReportPage } from '../features/reports/FinancialReportPage';
import { MenuEngineeringPage } from '../features/reports/MenuEngineeringPage';
import { BranchListPage } from '../features/branches/BranchListPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Application Layout */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          {/* Default redirect to appropriate landing */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* 1. Admin & Management Module: ADMIN, MANAGER */}
          <Route
            path="dashboard"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <DashboardPage />
              </RequireRole>
            }
          />

          <Route
            path="branches"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <BranchListPage />
              </RequireRole>
            }
          />

          {/* 2. POS & Tables Module: WAITER, CASHIER, MANAGER, ADMIN */}
          <Route
            path="pos"
            element={
              <RequireRole allowedRoles={['waiter', 'cashier', 'manager', 'admin']}>
                <OrderTakingPage />
              </RequireRole>
            }
          />

          {/* 3. KDS Kitchen Display System Module: CHEF, MANAGER, ADMIN */}
          <Route
            path="kds"
            element={
              <RequireRole allowedRoles={['chef', 'kitchen', 'manager', 'admin']}>
                <KdsPage />
              </RequireRole>
            }
          />

          {/* 4. Reservation & Tables Module: WAITER, CASHIER, MANAGER, ADMIN */}
          <Route
            path="reservation/bookings"
            element={
              <RequireRole allowedRoles={['waiter', 'cashier', 'manager', 'admin']}>
                <BookingListPage />
              </RequireRole>
            }
          />
          <Route
            path="reservation/tables"
            element={
              <RequireRole allowedRoles={['waiter', 'cashier', 'chef', 'manager', 'admin']}>
                <TableMapView />
              </RequireRole>
            }
          />

          {/* 5. Inventory & BOM Module: ADMIN, MANAGER */}
          <Route
            path="inventory/ingredients"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <IngredientListPage />
              </RequireRole>
            }
          />
          <Route
            path="inventory/imports"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <StockImportPage />
              </RequireRole>
            }
          />
          <Route
            path="inventory/recipes"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <RecipeEditorPage />
              </RequireRole>
            }
          />

          {/* 6. HRM Module */}
          <Route
            path="hrm/schedule"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <ShiftSchedulePage />
              </RequireRole>
            }
          />
          <Route
            path="hrm/attendance"
            element={
              <RequireRole allowedRoles={['admin', 'manager', 'cashier', 'chef', 'waiter']}>
                <AttendancePage />
              </RequireRole>
            }
          />

          {/* 7. Reports Module: ADMIN, MANAGER */}
          <Route
            path="reports/financial"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <FinancialReportPage />
              </RequireRole>
            }
          />
          <Route
            path="reports/menu-engineering"
            element={
              <RequireRole allowedRoles={['admin', 'manager']}>
                <MenuEngineeringPage />
              </RequireRole>
            }
          />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

