import { useState } from 'react';
import { useAuth } from '../useAuth.js';
import { authApi } from '../api.js';
import { Modal, Button, Input, Alert } from '../../../components/ui/index.js';
import { Flame, Trophy, User as UserIcon, ChevronDown, ChevronUp, Sparkles, BookMarked, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn.js';

function FeatureTile({ icon: Icon, title, description, details, colorClass, isOpen, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden",
        isOpen ? "ring-2 ring-primary ring-offset-2 border-transparent bg-surface shadow-xl" : "bg-surface-strong border-border hover:border-primary/30 hover:bg-surface"
      )}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className={cn("p-2.5 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground-strong">{title}</h4>
            <p className="text-[10px] text-muted font-medium mt-0.5">{description}</p>
          </div>
        </div>
        <div className="text-muted transition-transform group-hover:scale-110">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="h-px bg-border mb-3" />
              <div className="space-y-2">
                {details.map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-muted font-medium italic">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UsernameSetupModal({ open, onComplete }) {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);

  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const title = isAdmin ? "Secure Your Admin Handle" : "The Big Exam Upgrade";
  const description = isAdmin
    ? "Please set a unique username for your administrative account. This ensures clear tracking in audit logs."
    : "We've added powerful new tools to help you dominate your upcoming exams. Let's get you set up!";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedUser = await authApi.setUsername(username);
      setUser(updatedUser);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'leaderboard',
      icon: Trophy,
      title: "Hall of Fame",
      description: "Compete with other students in your courses.",
      colorClass: "bg-amber-500",
      details: [
        "Each subject has its own unique leaderboard.",
        "Rankings are based on Score %, Accuracy, and Speed.",
        "Privacy first: You can opt-out at any time from settings."
      ]
    },
    {
      id: 'streaks',
      icon: Flame,
      title: "Daily Streaks",
      description: "Stay consistent and keep your fire burning.",
      colorClass: "bg-orange-500",
      details: [
        "Practice daily to increase your streak count.",
        "Your streak fire 🔥 appears on your avatar for all to see.",
        "Missing a day resets the fire—don't lose your momentum!"
      ]
    },
    {
      id: 'courses',
      icon: BookMarked,
      title: "Course Organization",
      description: "Filter and pin your specific courses.",
      colorClass: "bg-blue-500",
      details: [
        "Star ⭐ your current courses to keep them at the top.",
        "Filter by Level (100L, 200L, etc.) to hide irrelevant subjects.",
        "Clean, personalized dashboard designed for exam focus."
      ]
    }
  ];

  return (
    <Modal
      open={open}
      onOpenChange={() => {}} // Prevent closing without setup
      title={
        <span className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-primary" /> {title}
        </span>
      }
      description={description}
    >
      <div className="space-y-6 pt-2">
        {/* Features Preview - Students only */}
        {!isAdmin && (
          <div className="flex flex-col gap-3">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1 ml-1">What's New</p>
             {features.map((f) => (
               <FeatureTile
                 key={f.id}
                 {...f}
                 isOpen={expandedFeature === f.id}
                 onClick={() => setExpandedFeature(expandedFeature === f.id ? null : f.id)}
               />
             ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface-strong p-6 rounded-[2rem] border border-border shadow-inner">
          <div className="space-y-3">
            <label className="text-sm font-black text-foreground-strong flex items-center gap-2">
              <UserIcon size={16} className="text-primary" />
              {isAdmin ? "Admin Handle" : "Secure Your Username"}
            </label>
            {!isAdmin && (
              <p className="text-[11px] text-muted font-medium leading-relaxed">
                This is how you will appear on the <span className="text-primary font-bold">Hall of Fame</span>. Pick something cool!
              </p>
            )}
            <Input
              placeholder={isAdmin ? "e.g. Admin_Jane" : "e.g. Scholar_King"}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
              className="h-12 text-base font-bold bg-surface border-2 focus:border-primary transition-all"
              autoFocus
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          {error && <Alert variant="danger" className="text-xs py-2">{error}</Alert>}

          <Button
            type="submit"
            className="w-full h-14 text-base font-black shadow-xl shadow-primary/20 rounded-2xl group"
            loading={loading}
          >
            {isAdmin ? "Complete Admin Setup" : "Start Dominating Exams"}
            <ChevronDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
        </form>
      </div>
    </Modal>
  );
}

export default UsernameSetupModal;
