import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage({ mode, onComplete, onBack }) {
    const [currentMode, setCurrentMode] = useState(mode);
    const [formData, setFormData] = useState({
        email: "", parentName: "", childName: "", password: "", gradeLevel: "1"
    });

    const handleGoogleSuccess = (response) => {
        // In a real app, you'd decode the JWT here
        // For now, we simulate getting the Parent Name and Email
        const googleUser = {
            email: "parent@gmail.com",
            parentName: "Google Parent",
            gradeLevel: formData.gradeLevel,
            points: 100
        };
        onComplete(googleUser);
    };

    return (
        <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
            <button onClick={onBack} className="absolute top-10 left-10 text-cyan-400 font-bold">← BACK</button>

            <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-black text-center mb-6">
                    {currentMode === 'signup' ? "Join the Galaxy" : "Welcome Back"}
                </h2>

                <div className="mb-6">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
                </div>

                <div className="flex flex-col gap-4">
                    {currentMode === 'signup' && (
                        <>
                            <input
                                type="text" placeholder="Student Name"
                                className="bg-slate-700 p-3 rounded-xl outline-none border border-slate-600 focus:border-cyan-400"
                                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                            />
                            <select
                                className="bg-slate-700 p-3 rounded-xl outline-none border border-slate-600 focus:border-cyan-400"
                                value={formData.gradeLevel}
                                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                            >
                                {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
                            </select>
                        </>
                    )}

                    <input
                        type="text" placeholder="Email or Username"
                        className="bg-slate-700 p-3 rounded-xl outline-none border border-slate-600 focus:border-cyan-400"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password" placeholder="Password"
                        className="bg-slate-700 p-3 rounded-xl outline-none border border-slate-600 focus:border-cyan-400"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <button
                        onClick={() => {
                            if (formData.email === 'admin' && formData.password === 'admin') {
                                onComplete({ id: 'admin', email: 'admin', parentName: 'Admin', childName: 'Admin Child', gradeLevel: formData.gradeLevel || '1', points: 1000, isAdmin: true });
                            } else {
                                onComplete({ ...formData, id: 'test-user-id', points: 0 });
                            }
                        }}
                        className="w-full py-4 bg-cyan-500 text-slate-900 font-black rounded-xl hover:bg-cyan-400 mt-4"
                    >
                        {currentMode === 'signup' ? "Create Account" : "Login"}
                    </button>
                </div>

                <button
                    onClick={() => setCurrentMode(currentMode === 'signup' ? 'login' : 'signup')}
                    className="w-full mt-6 text-sm text-slate-400 hover:text-white"
                >
                    {currentMode === 'signup' ? "Already have an account? Login" : "Need an account? Sign up"}
                </button>
            </div>
        </div>
    );
}