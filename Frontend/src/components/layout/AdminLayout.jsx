import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../header/AdminHeader';
import Footer from '../footer/Footer';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;