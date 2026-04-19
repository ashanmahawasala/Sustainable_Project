// RecyclerLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import RecyclerHeader from '../header/RecyclerHeader';
import Footer from '../footer/Footer';

const RecyclerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      
      <RecyclerHeader />

      <main className="flex-grow pt-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default RecyclerLayout;