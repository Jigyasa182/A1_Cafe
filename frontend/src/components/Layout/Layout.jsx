import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import FloatingCart from '../FloatingCart/FloatingCart';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="main-content" style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '60px' }}>
                <Outlet />
            </div>
            <Footer />
            {/* Optional: Keep FloatingCart global or only on specific pages. Keeping it global for now. */}
            <FloatingCart />
        </div>
    );
};

export default Layout;
