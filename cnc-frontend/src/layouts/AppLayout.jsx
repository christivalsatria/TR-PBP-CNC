import {
    NavLink,
    Outlet,
    useNavigate,
} from 'react-router';

const AppLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login', {
            replace: true,
        });
    };

    const getNavLinkClass = ({
        isActive,
    }) => {
        const baseClass =
            'rounded-lg px-3 py-2 text-sm font-medium transition';

        if (isActive) {
            return `${baseClass} bg-blue-600 text-white`;
        }

        return `${baseClass} text-slate-300 hover:bg-slate-800 hover:text-white`;
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-white shadow">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <img
                            src="/Logo CNC.png"
                            alt="Logo"
                            className="h-10 w-10"
                        />

                        <div className="flex flex-wrap items-center gap-1">
                            <NavLink
                                to="/dashboard"
                                className={getNavLinkClass}
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/books"
                                className={getNavLinkClass}
                            >
                                Books
                            </NavLink>

                            <NavLink
                                to="/profile"
                                className={getNavLinkClass}
                            >
                                Profile
                            </NavLink>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg border border-red-400 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-500/30"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;