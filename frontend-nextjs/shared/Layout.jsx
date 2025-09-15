// /shared/Layout.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { SEO_CONFIG } from './constants';

const Layout = ({ 
  children, 
  title, 
  description, 
  image, 
  navLinks, 
  footerLinks, 
  onMenuToggle, 
  isMenuOpen 
}) => {
  const pageTitle = title ? `${title} - ${SEO_CONFIG.defaultTitle}` : SEO_CONFIG.defaultTitle;
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageImage = image || SEO_CONFIG.defaultImage;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={SEO_CONFIG.siteUrl} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="jawalgames" />
        <link rel="canonical" href={SEO_CONFIG.siteUrl} />
      </Helmet>
      
      <div className="min-vh-100 d-flex flex-column">
        <Header 
          navLinks={navLinks}
          onMenuToggle={onMenuToggle}
          isMenuOpen={isMenuOpen}
        />
        
        <main className="flex-grow-1">
          {children}
        </main>
        
        <Footer footerLinks={footerLinks} />
      </div>
    </>
  );
};

export default Layout;