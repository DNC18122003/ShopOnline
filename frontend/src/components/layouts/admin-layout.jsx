import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Menu, Home, Package, FolderOpen, LogOut, Users, ShoppingCart } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">TechParts</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Package className="w-5 h-5" />
                                <span>Products</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="/admin/categories"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <FolderOpen className="w-5 h-5" />
                                <span>Categories</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Orders</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <span>Users</span>
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff"
                            alt="User"
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Admin User</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>

            {/* Toast */}
            <ToastContainer />
        </div>
    );
};

export default AdminLayout;
