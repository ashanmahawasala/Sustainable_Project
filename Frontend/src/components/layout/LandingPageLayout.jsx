import React from 'react';
import LandingPageHeader from '../header/LandingPageHeader';
import Footer from '../footer/Footer';

const LandingPageLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <LandingPageHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPageLayout;
