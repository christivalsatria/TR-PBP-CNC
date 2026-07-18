import { useState } from 'react';

import { Navigate, useNavigate } from 'react-router';

import api from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const [error, setError] =
        useState('');

    const [isLoading, setIsLoading] =
        useState(false);

    const token =
        localStorage.getItem('token');

    if (token) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError('');

        if (
            !form.username.trim() ||
            !form.password
        ) {
            setError(
                'Username dan password wajib diisi.'
            );

            return;
        }

        setIsLoading(true);

        try {
            const response =
                await api.post(
                    '/auth/login',
                    {
                        username:
                            form.username.trim(),
                        password:
                            form.password,
                    }
                );

            localStorage.setItem(
                'token',
                response.data.token
            );

            localStorage.setItem(
                'user',
                JSON.stringify(
                    response.data.user
                )
            );

            navigate('/dashboard', {
                replace: true,
            });
        } catch (error) {
            setError(
                error.response?.data
                    ?.message ||
                'Login gagal. Periksa email, password, atau koneksi server.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        S1TI Library
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Silakan login untuk melanjutkan
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={
                                handleChange
                            }
                            placeholder="admin@s1ti.test"
                            autoComplete="email"
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Masukkan password"
                            autoComplete="current-password"
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {isLoading
                            ? 'Memproses...'
                            : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;