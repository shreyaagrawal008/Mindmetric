import SignupPage from "./SignupPage.jsx";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Crown, FlaskConical, Gamepad2, GraduationCap,
    Lock, Rocket, ShieldCheck, Star, Trophy
} from "lucide-react";

import AstromazeGame from "./AstromazeGame.jsx";
import WordNebulaGame from "./WordNebulaGame.jsx";
import NumberCometGame from "./NumberCometGame.jsx";
import "./styles.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:8081/api";
const LOGO = "/assets/brand-logo.jpeg";
const MASCOT = "/assets/WhatsApp Image 2026-05-03 at 2.18.35 PM.jpeg";
const FALLBACK_LOGO = "/assets/brand-logo.jpeg";
const FALLBACK_MASCOT = "/assets/monkey-mascot.png";

const gameShells = ["Astro Maze", "Word Nebula", "Number Comet", "Science Scanner", "Memory Orbit", "Pattern Portal", "Quiz Rocket"];

function userPath(user) {
    return `/user/${encodeURIComponent(user.id)}`;
}

const localWeekly = {
    weekKey: "2026-W18",
    missionTitle: "Rescue the Lost Knowledge Stars",
    academicLesson: "Practice core reading, math, and science skills by solving space missions.",
    mascotLine: "Ready for liftoff? Let's explore the Mindmetric galaxy and discover new worlds!",
    lessons: [
        { subject: "Math", tier: "TIER_2", prompt: "Solve 12 + 9", answer: "21", reward: "Math Star" }
    ]
};

function tierForGrade(grade) {
    const normalized = String(grade || "1").replace("Grade ", "");
    if (["Pre-K", "K"].includes(normalized)) return "TIER_1";
    if (["1", "2", "3"].includes(normalized)) return "TIER_2";
    return "TIER_3";
}

// --- MAIN APP COMPONENT ---
function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("mindmetric-user");
        return saved ? JSON.parse(saved) : null;
    });

    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    useEffect(() => {
        if (!user && window.location.pathname !== "/") {
            window.history.replaceState({}, "", "/");
        }
        if (user && window.location.pathname !== userPath(user)) {
            window.history.replaceState({}, "", userPath(user));
        }
    }, [user]);

    if (showAuth) {
        return (
            <SignupPage
                initialMode={authMode}
                onComplete={(userData) => {
                    setUser(userData);
                    localStorage.setItem("mindmetric-user", JSON.stringify(userData));
                    window.history.replaceState({}, "", userPath(userData));
                    setShowAuth(false);
                }}
                onBack={() => setShowAuth(false)}
            />
        );
    }

    return (
        <Dashboard
            user={user}
            onOpenAuth={(mode) => { setAuthMode(mode); setShowAuth(true); }}
            onLogout={() => { localStorage.removeItem("mindmetric-user"); setUser(null); window.location.assign("/"); }}
        />
    );
}

function Dashboard({ user, setUser, onOpenAuth, onLogout }) {
    const [content, setContent] = useState(localWeekly);
    const [activeGame, setActiveGame] = useState(0);
    const [launchedGame, setLaunchedGame] = useState(null);
    const [progress, setProgress] = useState([]);
    const [globalScore, setGlobalScore] = useState(0);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`mindmetric_global_score_${user.id}`);
            if (saved) {
                setGlobalScore(parseInt(saved, 10));
            }
        }
    }, [user, launchedGame]);
    
    // Check if user is logged in
    const isLoggedIn = !!user;

    const currentGrade = user?.gradeLevel || "1";
    const tier = tierForGrade(currentGrade);

    if (launchedGame === "Astro Maze" && isLoggedIn) {
        return <AstromazeGame gradeLevel={currentGrade} userId={user.id} onExit={() => setLaunchedGame(null)} />;
    }

    if (launchedGame === "Word Nebula" && isLoggedIn) {
        return <WordNebulaGame userId={user.id} onExit={() => setLaunchedGame(null)} />;
    }

    if (launchedGame === "Number Comet" && isLoggedIn) {
        return <NumberCometGame userId={user.id} onExit={() => setLaunchedGame(null)} />;
    }

    return (
        <div className="min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] w-screen max-w-full overflow-x-hidden lg:overflow-hidden bg-space text-starWhite flex flex-col">
            <HappyBackground />

            {/* Updated Nav with Login/Signup buttons */}
            <header className="relative z-10 h-20 max-h-20 border-b border-white/10 bg-space/80 backdrop-blur">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-3 py-2 md:px-6">
                    <SmartImage src={LOGO} fallback={FALLBACK_LOGO} className="h-16 w-48 object-contain md:w-64" />

                    <div className="flex gap-3">
                        {!isLoggedIn ? (
                            <>
                                <button onClick={() => onOpenAuth('login')} className="text-sm font-bold hover:text-cyanGlow">Login</button>
                                <button onClick={() => onOpenAuth('signup')} className="neon-btn cyan text-xs">Sign Up</button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                                    <Star className="w-4 h-4" /> {globalScore}
                                </span>
                                <span className="text-sm text-cyanGlow font-bold">Grade {currentGrade}</span>
                                <button onClick={onLogout} className="text-xs text-red-400">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative mx-auto flex-1 w-full max-w-7xl lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)] lg:overflow-hidden px-3 py-3 md:px-6">
                <section className="grid h-full lg:min-h-0 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                    <BrainBase content={content} user={user || { gradeLevel: "1" }} />
                    <MissionPanel
                        activeGame={activeGame}
                        setActiveGame={setActiveGame}
                        launchGame={(game) => isLoggedIn ? setLaunchedGame(game) : onOpenAuth('login')}
                        tier={tier}
                        isLoggedIn={isLoggedIn}
                        user={user}
                    />
                </section>
            </main>
        </div>
    );
}



function BrainBase({ content, user }) {
    return (
        <section className="min-h-0 lg:overflow-hidden rounded-xl border border-pinkGlow/30 bg-black/30 p-4 shadow-pink flex flex-col relative">
            <div className="mb-4 flex items-center gap-3 relative z-10">
                <Brain className="text-pinkGlow h-8 w-8" />
                <h2 className="text-2xl font-black">Mission Control</h2>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 relative z-10">
                {/* The Mascot Image filling the left area */}
                <div className="flex-shrink-0 flex items-center justify-center">
                    <SmartImage 
                        src={MASCOT} 
                        fallback={FALLBACK_MASCOT} 
                        className="h-48 w-48 lg:h-64 lg:w-64 rounded-full border-4 border-cyanGlow object-cover shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:scale-105 transition-transform duration-300"
                    />
                </div>
                
                {/* Speech Bubble to the right of Mascot */}
                <div className="flex-1 flex items-center">
                    <div className="w-full">
                        <SpeechBubble speaker="Mindmetric">{content.mascotLine}</SpeechBubble>
                        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.04]">
                            <h3 className="text-cyan-300 font-bold mb-1">Welcome!</h3>
                            <p className="text-sm text-slate-300">Select a mission on the right to start earning knowledge stars.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MissionPanel({ activeGame, setActiveGame, launchGame, tier, isLoggedIn, user }) {
    return (
        <section className="min-h-0 lg:overflow-hidden rounded-xl border border-cyanGlow/30 bg-black/30 p-4 shadow-cyan flex flex-col">
            <h2 className="mb-3 text-xl font-black shrink-0">7 Missions</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 flex-1 overflow-y-auto pr-1 pb-1">
                {gameShells.map((name, index) => {
                    const isComingSoon = ["Science Scanner", "Memory Orbit", "Pattern Portal", "Quiz Rocket"].includes(name) || (name === "Number Comet" && (tier !== "TIER_1" || user?.gradeLevel === "Pre-K"));
                    
                    return (
                        <button
                            key={name}
                            className={`game-tile relative overflow-hidden ${activeGame === index && !isComingSoon ? "active" : ""} ${isComingSoon ? "opacity-70 cursor-not-allowed grayscale-[0.5]" : ""}`}
                            onClick={(e) => {
                                if (isComingSoon) {
                                    e.preventDefault();
                                    return;
                                }
                                launchGame(name);
                            }}
                        >
                            {isLoggedIn && !isComingSoon ? <Rocket className="h-6 w-6 mb-1 text-cyanGlow" /> : <Lock className="h-6 w-6 text-slate-500 mb-1" />}
                            <span>{name}</span>
                            
                            {isComingSoon && (
                                <div className="absolute top-2 -right-8 bg-yellow-400 text-black text-[9px] font-black px-8 py-1 rotate-45 shadow-lg z-10 w-36 text-center border-y border-yellow-200 pointer-events-none tracking-widest">
                                    COMING SOON
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function SpeechBubble({ speaker, children }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs font-black text-cyanGlow uppercase">{speaker}</p>
            <p className="mt-1 text-sm text-slate-100">{children}</p>
        </div>
    );
}

function SmartImage({ src, fallback, ...props }) {
    const [current, setCurrent] = useState(src);
    return <img {...props} src={current} onError={() => setCurrent(fallback)} />;
}

function Starfield() {
    return <div className="pointer-events-none fixed inset-0 bg-space" />;
}

function HappyBackground() {
    const bubbles = useMemo(() => Array.from({ length: 30 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 20,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5
    })), []);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-900">
            {bubbles.map((b, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    initial={{ left: `${b.x}%`, top: `${b.y}%`, scale: 0.5 }}
                    animate={{
                        top: [`${b.y}%`, `${Math.random() * 100}%`, `${b.y}%`],
                        left: [`${b.x}%`, `${Math.random() * 100}%`, `${b.x}%`],
                        scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{
                        duration: b.duration,
                        delay: b.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: b.size,
                        height: b.size,
                        filter: 'blur(3px)'
                    }}
                />
            ))}
        </div>
    );
}



const rootElement = document.getElementById("root");
createRoot(rootElement).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>
);
