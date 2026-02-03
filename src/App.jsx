import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { Box, Typography } from '@mui/material';

// Placeholders for other pages
const PlaceholderPage = ({ title }) => (
  <Box>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Typography>This feature is being developed.</Typography>
  </Box>
);

import Login from './pages/Login';
import Signup from './pages/Signup';

import Transactions from './pages/Transactions';
import Coach from './pages/Coach';
import Bills from './pages/Bills';

import Budget from './pages/Budget';
import Investments from './pages/Investments';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="bills" element={<Bills />} />
          <Route path="investments" element={<Investments />} />
          <Route path="goals" element={<Goals />} />
          <Route path="coach" element={<Coach />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
