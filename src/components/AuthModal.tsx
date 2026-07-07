import React from "react";
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { User as UserType } from "../types";
import { useAuth } from "../context/AuthContext.tsx";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

type AuthTab = "login" | "register" | "forgot";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState<AuthTab>("login");
  const { signUp, signIn, signInWithGoogle, resetPassword, currentUser } = useAuth();
  
  // Input fields
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  
  // Message and Validation States
  const [errMessage, setErrMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      onLoginSuccess(currentUser);
    }
  }, [currentUser, onLoginSuccess]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrMessage("");
    setSuccessMessage("");

    // BASIC VALS
    if (!email.trim()) {
      setErrMessage("Email coordinate is required.");
      return;
    }
    if (activeTab === "register" && !username.trim()) {
      setErrMessage("Please enter a username.");
      return;
    }

    // Email Pattern validator
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrMessage("Please enter a valid email address.");
      return;
    }

    if (activeTab !== "forgot") {
      if (!password || password.length < 6) {
        setErrMessage("Password must be at least 6 characters.");
        return;
      }
    }

    if (activeTab === "register") {
      if (password !== confirmPassword) {
        setErrMessage("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        await signIn(email.trim(), password);
        onClose();
      } else if (activeTab === "register") {
        const signUpResult = await signUp(email.trim(), password, username.trim());
        const confirmRequired = signUpResult?.user && !signUpResult?.session;
        if (confirmRequired) {
          setSuccessMessage("Account registered successfully! A confirmation link has been sent. Please verify your email via the link in your inbox (or spam) before logging in.");
        } else {
          setSuccessMessage("Account registered successfully! You may now sign in.");
        }
        setActiveTab("login");
      } else if (activeTab === "forgot") {
        await resetPassword(email.trim());
        setSuccessMessage("A password recovery transmission has been dispatched to your email address.");
      }
    } catch (error: any) {
      console.warn("Auth process message:", error.message || error);
      let msg = error.message || "Authentication attempt failed. Please check your credentials.";
      if (msg.toLowerCase().includes("email not confirmed")) {
        msg = "Email not confirmed. Please check your inbox (including spam) for the Supabase confirmation link. Alternatively, if this is your database, you can bypass this by turning off 'Confirm email' under Auth Settings -> Providers -> Email in your Supabase Dashboard.";
      }
      setErrMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setErrMessage("");
    setSuccessMessage("");
    setLoading(true);
    
    try {
      await signInWithGoogle();
      onClose();
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      setErrMessage(error.message || "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-earth-border rounded-2xl p-6 relative space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button 
          id="close-auth-modal"
          onClick={onClose}
          className="p-2 text-earth-text/50 hover:text-earth-text rounded-lg hover:bg-earth-light-sage/20 absolute top-4 right-4 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-xl bg-earth-accent/10 border border-earth-accent/20 text-earth-accent mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif italic font-light text-2xl text-earth-text tracking-tight">
            {activeTab === "login" && "Access Voyage Vault"}
            {activeTab === "register" && "Create Luxury Account"}
            {activeTab === "forgot" && "Recover Passkey"}
          </h2>
          <p className="text-xs text-earth-text/60 font-light max-w-[280px] mx-auto">
            {activeTab === "login" && "Unlock global route persistence, ledger synchronization, and concierge AI chats."}
            {activeTab === "register" && "Begin your lifetime travel ledger mapping. Completely secure, offline-resilient storage."}
            {activeTab === "forgot" && "Dispatches cryptographic recovery instructions directly to your email coordinates."}
          </p>
        </div>

        {errMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-earth-light-sage/50 border border-earth-border flex items-start gap-2.5 text-xs text-earth-sage font-medium">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">USERNAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. wanderlust"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">EMAIL COORDINATE</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voyager@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
              />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">SECURE PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#4A4A3A] font-mono uppercase tracking-wider">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  id="auth-confirmpass-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-border text-earth-text focus:border-earth-accent/40 focus:outline-none text-xs font-medium shadow-inner"
                />
              </div>
            </div>
          )}

          {activeTab === "login" && (
            <div className="text-right">
              <button 
                id="auth-switch-forgot"
                type="button" 
                onClick={() => setActiveTab("forgot")}
                className="text-[10px] font-mono text-earth-accent hover:text-earth-accent/80 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-earth-accent hover:bg-earth-accent/90 disabled:opacity-50 text-white font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 font-sans shadow-sm cursor-pointer"
          >
            <span>
              {loading ? "Authenticating..." : (
                activeTab === "login" && "Unlock Vault" ||
                activeTab === "register" && "Register Ledger" ||
                activeTab === "forgot" && "Reset Passkey"
              )}
            </span>
          </button>

        </form>

        {activeTab !== "forgot" && (
          <div className="space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-earth-border"></div>
              <span className="flex-shrink mx-4 text-[10px] text-earth-text/40 font-mono">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-earth-border"></div>
            </div>

            <button
              id="google-signin-btn"
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-full border border-earth-border bg-white hover:bg-earth-light-sage/20 disabled:opacity-50 text-earth-text text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Connect Google Account</span>
            </button>
          </div>
        )}

        {/* Tab Switcher links */}
        <div className="border-t border-earth-border pt-4 flex justify-between text-xs font-medium font-sans text-earth-text/75">
          {activeTab === "login" ? (
            <span>New Voyager? <button id="auth-switch-register" onClick={() => { setActiveTab("register"); setErrMessage(""); }} className="text-earth-accent hover:underline font-bold cursor-pointer">Register Account</button></span>
          ) : (
            <span>Already have credentials? <button id="auth-switch-login" onClick={() => { setActiveTab("login"); setErrMessage(""); }} className="text-earth-accent hover:underline font-bold cursor-pointer">Sign In</button></span>
          )}
        </div>

        {/* Supabase Note */}
        <div className="text-[10px] text-earth-text/40 font-mono text-center pt-2 leading-relaxed border-t border-dashed border-earth-border/60">
          Tip: If login fails with "Email not confirmed", check your mailbox or turn off "Confirm email" in Supabase Auth Settings.
        </div>

      </div>
    </div>
  );
}
