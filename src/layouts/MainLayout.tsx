import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from '../components/Navbar';

const MainLayout: React.FC = () => {
    return (
        <>
            <NavbarComponent />
            <main className="container mt-4">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;