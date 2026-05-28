import React, { useMemo, useState } from "react";
import { AtSign, BookOpen, Eye, EyeOff, KeyRound, Lock, Phone, UserRound, X, ChevronLeft } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const LOGO = "/assets/logo.jpeg";
const grades = ["Pre-K", "K", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const animals = [
    { icon: "fox", top: "8%", left: "7%", color: "#f97316" },
    { icon: "owl", top: "15%", left: "82%", color: "#22d3ee" },
    { icon: "bear", top: "70%", left: "8%", color: "#a16207" },
    { icon: "fox", top: "72%", left: "79%", color: "#ec4899" },
    { icon: "owl", top: "43%", left: "4%", color: "#84cc16" },
    { icon: "bear", top: "39%", left: "89%", color: "#eab308" },
    { icon: "fox", top: "23%", left: "24%", color: "#fb7185" },
    { icon: "owl", top: "80%", left: "28%", color: "#38bdf8" },
    { icon: "bear", top: "12%", left: "48%", color: "#f59e0b" },
    { icon: "fox", top: "57%", left: "58%", color: "#a3e635" },
    { icon: "owl", top: "81%", left: "91%", color: "#c084fc" }
];

const emptyManual = {
    parentName: "",
    parentPhone: "",
    email: "",
    username: "",
    password: "",
    childName: "",
    grade: "Pre-K"
};

export default function SignupPage({ onComplete, onBack, initialMode = "login" }) {
    const [mode, setMode] = useState(initialMode);
    const [manual, setManual] = useState(emptyManual);
    const [login, setLogin] = useState({ username: "", password: "" });
    const [googleProfile, setGoogleProfile] = useState(null);
    const [googleFinalize, setGoogleFinalize] = useState({ parentName: "", parentPhone: "", childName: "", grade: "Pre-K" });
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const passwordScore = useMemo(() => scorePassword(manual.password), [manual.password]);

    function updateManual(field, value) {
        setManual((current) => ({ ...current, [field]: value }));
    }

    function updateLogin(field, value) {
        setLogin((current) => ({ ...current, [field]: value }));
    }

    function finishAuth(user) {
        const normalized = normalizeUser(user);
        // Do NOT use localStorage.clear() here. It destroys all users' game progress.
        localStorage.setItem("mindmetric-user", JSON.stringify(normalized));
        handleRedirect(normalized);
        onComplete(normalized);
    }

    function handleRedirect(user) {
        window.history.replaceState({}, "", `/user/${encodeURIComponent(user.id)}`);
    }

    async function submitLogin(event) {
        event.preventDefault();
        setError("");
        if (!login.username.trim() || !login.password.trim()) {
            setError("Enter your username/email and password.");
            return;
        }
        setBusy(true);
        try {
            const user = await postJson("/auth/login", login);
            finishAuth(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function submitManual(event) {
        event.preventDefault();
        setError("");
        const validation = validateManual(manual);
        if (validation) {
            setError(validation);
            return;
        }
        setBusy(true);
        try {
            const user = await postJson("/auth/signup", manual);
            finishAuth(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleGoogleCredential(credentialResponse) {
        setError("");
        if (!credentialResponse?.credential) {
            setError("Google did not return a credential.");
            return;
        }
        
        setBusy(true);
        try {
            const user = await postJson("/auth/google", { credential: credentialResponse.credential });
            finishAuth(user);
        } catch (err) {
            if (err.status === 404) {
                beginGoogleFinalize(credentialResponse.credential);
            } else {
                setError(err.message);
            }
        } finally {
            setBusy(false);
        }
    }

    function beginGoogleFinalize(credential) {
        const decoded = decodeJwt(credential);
        const parentName = cleanName(decoded?.name) || "Google Parent";
        setGoogleProfile({
            credential,
            email: decoded?.email || "",
            parentName
        });
        setGoogleFinalize((current) => ({ ...current, parentName }));
        setMode("google-finalize");
    }

    async function submitGoogleFinalize(event) {
        event.preventDefault();
        setError("");
        const validation = validateGoogleFinalize(googleProfile, googleFinalize);
        if (validation) {
            setError(validation);
            return;
        }
        setBusy(true);
        try {
            const user = await postJson("/auth/google/finalize", {
                email: googleProfile.email,
                credential: googleProfile.credential,
                parentName: googleFinalize.parentName,
                parentPhone: googleFinalize.parentPhone,
                childName: googleFinalize.childName,
                grade: googleFinalize.grade
            });
            finishAuth(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function sendResetCode(event) {
        event.preventDefault();
        setError("");
        setForgotMessage("");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
            setForgotMessage("Enter the registered email address first.");
            return;
        }
        setBusy(true);
        try {
            const result = await postJson("/auth/forgot-password", { email: forgotEmail });
            setForgotMessage(`Code sent to ${result.maskedEmail}. It expires in ${result.expiresInMinutes} minutes.`);
        } catch (err) {
            setForgotMessage(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="signup-shell h-screen overflow-hidden px-4 py-3 text-white">
            <div className="animal-sky" aria-hidden="true">
                {animals.map((animal, index) => <Animal key={`${animal.icon}-${index}`} {...animal} />)}
            </div>

            <section className="relative z-10 mx-auto flex h-[calc(100vh-1.5rem)] max-w-4xl flex-col items-center justify-center gap-3">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-0 left-0 flex items-center gap-1 text-sm font-bold text-white/70 hover:text-cyanGlow transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                </button>

                <div className="signup-card w-full">
                    <img src={LOGO} alt="MindMetric logo" className="signup-logo signup-logo-top" />

                    {mode !== "google-finalize" && (
                        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
                            <button type="button" className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Login</button>
                            <button type="button" className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
                        </div>
                    )}

                    <div className="google-native-wrap mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleCredential}
                            onError={() => setError("Google Sign-In Failed")}
                            theme="outline"
                            size="large"
                            text={mode === "login" ? "signin_with" : "signup_with"}
                            shape="rectangular"
                        />
                    </div>

                    <div className="my-4 flex items-center gap-3 text-xs font-black uppercase text-slate-400">
                        <span className="h-px flex-1 bg-white/15" />
                        {mode === "google-finalize" ? "finish google profile" : mode === "login" ? "or login with password" : "or use email"}
                        <span className="h-px flex-1 bg-white/15" />
                    </div>

                    {error && <div className="mb-3 rounded-xl border border-rose-300/40 bg-rose-500/15 px-4 py-2 text-sm font-bold text-rose-100">{error}</div>}

                    {mode === "login" && (
                        <form className="grid gap-3" onSubmit={submitLogin}>
                            <SignupField label="Username or Email" icon={<UserRound />} value={login.username} onChange={(value) => updateLogin("username", value)} placeholder="mindhero or parent@email.com" />
                            <SignupField label="Password" icon={<Lock />} type="password" value={login.password} onChange={(value) => updateLogin("password", value)} placeholder="Your password" />
                            <button className="w-fit text-xs font-black text-cyanGlow" type="button" onClick={() => setForgotOpen(true)}>Forgot password?</button>
                            <button className="signup-submit" disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
                        </form>
                    )}

                    {mode === "signup" && (
                        <form className="grid gap-3" onSubmit={submitManual}>
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignupField label="Parent Name" icon={<UserRound />} value={manual.parentName} onChange={(value) => updateManual("parentName", value)} placeholder="Parent name" />
                                <SignupField label="Child Name" icon={<BookOpen />} value={manual.childName} onChange={(value) => updateManual("childName", value)} placeholder="Child name" />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignupField label="Gmail" icon={<AtSign />} type="email" value={manual.email} onChange={(value) => updateManual("email", value)} placeholder="parent@gmail.com" />
                                <SignupField label="Parent Phone" icon={<Phone />} type="tel" value={manual.parentPhone} onChange={(value) => updateManual("parentPhone", digitsOnly(value).slice(0, 10))} placeholder="10 digit mobile number" inputMode="numeric" maxLength={10} />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignupField label="Username" icon={<UserRound />} value={manual.username} onChange={(value) => updateManual("username", value)} placeholder="mindhero" />
                                <GradeSelect value={manual.grade} onChange={(value) => updateManual("grade", value)} />
                            </div>
                            <label className="signup-label">
                                <span>Password</span>
                                <div className="signup-input-wrap">
                                    <Lock className="h-5 w-5 text-cyanGlow" />
                                    <input className="signup-input" type={showPassword ? "text" : "password"} value={manual.password} onChange={(event) => updateManual("password", event.target.value)} placeholder="8+ chars with a number" />
                                    <button className="text-slate-300" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </label>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-yellow-400 to-emerald-400 transition-all" style={{ width: `${passwordScore}%` }} /></div>
                            <button className="signup-submit" disabled={busy}>{busy ? "Creating account..." : "Create MindMetric Account"}</button>
                        </form>
                    )}

                    {mode === "google-finalize" && (
                        <form className="grid gap-3" onSubmit={submitGoogleFinalize}>
                            <div className="rounded-xl border border-cyanGlow/30 bg-cyanGlow/10 px-4 py-3 text-sm font-bold text-cyanGlow">Google verified. Complete the remaining details.</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignupField label="Parent Name" icon={<UserRound />} value={googleFinalize.parentName} onChange={() => {}} placeholder="Parent name" readOnly />
                                <SignupField label="Gmail" icon={<AtSign />} type="email" value={googleProfile?.email || ""} onChange={() => {}} placeholder="parent@gmail.com" readOnly />
                            </div>
                            <SignupField label="Parent Phone" icon={<Phone />} type="tel" value={googleFinalize.parentPhone} onChange={(value) => setGoogleFinalize((current) => ({ ...current, parentPhone: digitsOnly(value).slice(0, 10) }))} placeholder="10 digit mobile number" inputMode="numeric" maxLength={10} />
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignupField label="Child Name" icon={<BookOpen />} value={googleFinalize.childName} onChange={(value) => setGoogleFinalize((current) => ({ ...current, childName: value }))} placeholder="Child name" />
                                <GradeSelect value={googleFinalize.grade} onChange={(value) => setGoogleFinalize((current) => ({ ...current, grade: value }))} />
                            </div>
                            <button className="signup-submit" disabled={busy}>{busy ? "Finishing profile..." : "Finish Google Signup"}</button>
                            <button className="text-sm font-black text-cyanGlow" type="button" onClick={() => { setMode("login"); setGoogleProfile(null); setError(""); }}>Back to login</button>
                        </form>
                    )}
                </div>
            </section>

            {forgotOpen && <ForgotPasswordDialog busy={busy} email={forgotEmail} message={forgotMessage} onEmail={setForgotEmail} onSubmit={sendResetCode} onClose={() => { setForgotOpen(false); setForgotMessage(""); }} />}
        </main>
    );
}

function ForgotPasswordDialog({ busy, email, message, onEmail, onSubmit, onClose }) {
    return (
        <div className="modal-backdrop">
            <form className="forgot-modal" role="dialog" aria-modal="true" aria-label="Forgot password" onSubmit={onSubmit}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <KeyRound className="mb-3 h-8 w-8 text-cyan-600" />
                        <h2 className="text-xl font-black text-slate-950">Forgot password?</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Enter the registered email and we will send a reset code.</p>
                    </div>
                    <button className="icon-close" type="button" onClick={onClose} aria-label="Close forgot password"><X className="h-5 w-5" /></button>
                </div>
                <div className="mt-4 grid gap-3">
                    <SignupField label="Registered email" icon={<AtSign />} type="email" value={email} onChange={onEmail} placeholder="parent@email.com" />
                    {message && <div className="reset-message">{message}</div>}
                    <button className="google-continue" type="submit" disabled={busy}>{busy ? "Sending code..." : "Send reset code"}</button>
                </div>
            </form>
        </div>
    );
}

function SignupField({ label, icon, value, onChange, placeholder, type = "text", readOnly = false, inputMode, maxLength }) {
    return (
        <label className="signup-label">
            <span>{label}</span>
            <div className="signup-input-wrap">
                {icon}
                <input className="signup-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} readOnly={readOnly} inputMode={inputMode} maxLength={maxLength} />
            </div>
        </label>
    );
}

function GradeSelect({ value, onChange }) {
    return (
        <label className="signup-label">
            <span>Grade</span>
            <select className="signup-select" value={value} onChange={(event) => onChange(event.target.value)}>
                {grades.map((grade) => <option key={grade}>{grade}</option>)}
            </select>
        </label>
    );
}

function Animal({ icon, top, left, color }) {
    return (
        <svg className="animal-float" style={{ top, left, color }} width="92" height="92" viewBox="0 0 92 92" fill="none">
            {icon === "fox" && <Fox />}
            {icon === "owl" && <Owl />}
            {icon === "bear" && <Bear />}
        </svg>
    );
}

function Fox() {
    return (
        <g>
            <path d="M18 17L33 32L46 25L59 32L74 17L68 56C65 72 27 72 24 56L18 17Z" fill="currentColor" opacity=".92" />
            <path d="M28 29L37 35L29 39Z" fill="#fff7ed" opacity=".85" />
            <path d="M64 29L55 35L63 39Z" fill="#fff7ed" opacity=".85" />
            <ellipse cx="46" cy="55" rx="16" ry="11" fill="#fff7ed" opacity=".88" />
            <circle cx="38" cy="45" r="4.2" fill="#0f172a" />
            <circle cx="54" cy="45" r="4.2" fill="#0f172a" />
            <circle cx="39.5" cy="43.5" r="1.2" fill="#fff" />
            <circle cx="55.5" cy="43.5" r="1.2" fill="#fff" />
            <path d="M42 55L46 59L50 55Z" fill="#0f172a" />
            <path d="M36 61C41 66 51 66 56 61" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </g>
    );
}

function Owl() {
    return (
        <g>
            <path d="M24 28C29 18 63 18 68 28V60C68 73 24 73 24 60V28Z" fill="currentColor" opacity=".92" />
            <path d="M31 25L24 17V35Z" fill="currentColor" opacity=".92" />
            <path d="M61 25L68 17V35Z" fill="currentColor" opacity=".92" />
            <circle cx="38" cy="43" r="10" fill="#f8fafc" opacity=".9" />
            <circle cx="54" cy="43" r="10" fill="#f8fafc" opacity=".9" />
            <circle cx="38" cy="43" r="4" fill="#0f172a" />
            <circle cx="54" cy="43" r="4" fill="#0f172a" />
            <circle cx="39.5" cy="41.5" r="1.1" fill="#fff" />
            <circle cx="55.5" cy="41.5" r="1.1" fill="#fff" />
            <path d="M42 53L46 59L50 53Z" fill="#facc15" />
            <path d="M35 62C40 67 52 67 57 62" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" opacity=".55" />
        </g>
    );
}

function Bear() {
    return (
        <g>
            <circle cx="27" cy="31" r="10" fill="currentColor" opacity=".88" />
            <circle cx="65" cy="31" r="10" fill="currentColor" opacity=".88" />
            <circle cx="46" cy="49" r="29" fill="currentColor" opacity=".94" />
            <circle cx="27" cy="31" r="5" fill="#fde68a" opacity=".72" />
            <circle cx="65" cy="31" r="5" fill="#fde68a" opacity=".72" />
            <ellipse cx="46" cy="58" rx="15" ry="11" fill="#fde68a" opacity=".78" />
            <circle cx="36" cy="45" r="4" fill="#0f172a" />
            <circle cx="56" cy="45" r="4" fill="#0f172a" />
            <circle cx="37.3" cy="43.6" r="1.1" fill="#fff" />
            <circle cx="57.3" cy="43.6" r="1.1" fill="#fff" />
            <path d="M42 56C42 53 50 53 50 56C50 60 42 60 42 56Z" fill="#0f172a" />
            <path d="M39 64C43 68 49 68 53 64" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </g>
    );
}

function validateManual(form) {
    if (!form.parentName.trim() || !form.parentPhone.trim() || !form.childName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) return "Please complete every field.";
    if (!isValidName(form.parentName)) return "Parent name can use letters and spaces only.";
    if (!isValidName(form.childName)) return "Child name can use letters and spaces only.";
    if (!/^[^@\s]+@gmail\.com$/i.test(form.email)) return "Please enter a valid @gmail.com address.";
    if (!/^\d{10}$/.test(form.parentPhone)) return "Phone number must be exactly 10 digits.";
    if (!/^[A-Za-z0-9_]{3,20}$/.test(form.username)) return "Username must be 3-20 characters using letters, numbers, or underscores.";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) return "Password must be at least 8 characters and include a number.";
    return "";
}

function validateGoogleFinalize(profile, form) {
    if (!profile?.email || !form.parentName.trim() || !form.childName.trim() || !form.parentPhone.trim()) return "Please complete phone number, child name, and grade.";
    if (!isValidName(form.parentName)) return "Parent name can use letters and spaces only.";
    if (!isValidName(form.childName)) return "Child name can use letters and spaces only.";
    if (!/^[^@\s]+@gmail\.com$/i.test(profile.email)) return "Google signup must use a valid @gmail.com address.";
    if (!/^\d{10}$/.test(form.parentPhone)) return "Phone number must be exactly 10 digits.";
    return "";
}

function isValidName(value) {
    return /^[A-Za-z][A-Za-z ]{1,49}$/.test(value.trim());
}

function digitsOnly(value) {
    return value.replace(/\D/g, "");
}

function cleanName(value) {
    return String(value || "").replace(/[^A-Za-z ]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeUser(user) {
    return {
        id: user.id,
        name: user.childName || user.name,
        username: user.username,
        gradeLevel: String(user.gradeLevel || user.grade || "Grade 1").replace("Grade ", ""),
        premiumStatus: user.premiumStatus,
        points: user.points || 0,
        email: user.email,
        parentName: user.parentName,
        parentPhone: user.parentPhone,
        authType: user.authType
    };
}

function scorePassword(password) {
    let score = 0;
    if (password.length >= 8) score += 40;
    if (/[A-Za-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    return Math.min(100, score);
}

async function postJson(path, body) {
    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch {
        throw new Error(`Unable to reach the MindMetric server at ${API_BASE}. Make sure the backend is running, then try again.`);
    }
    if (!response.ok) {
        const text = await response.text();
        const error = new Error(readSpringMessage(text) || `Request failed. Status: ${response.status}. Raw text: '${text}'`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function readSpringMessage(text) {
    try {
        const parsed = JSON.parse(text);
        return parsed.message || parsed.error;
    } catch {
        return text;
    }
}

function decodeJwt(token) {
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(payload));
    } catch {
        return null;
    }
}
