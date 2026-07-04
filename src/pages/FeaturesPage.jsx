import { Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  ListChecks,
  Target,
  BarChart3,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';
import { cn } from '../utils/cn.js';

const STEPS = [
  {
    icon: Target,
    title: 'Choose Your Subject',
    description: 'Select from our rapidly growing database of university courses, from Economics to Physics.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Clock,
    title: 'Configure Your Session',
    description: 'Set your own time limits and question counts to match your study goals for the day.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    icon: ShieldCheck,
    title: 'Focused Examination',
    description: 'Enter a distraction-free, secure environment designed to mimic real computer-based tests.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    icon: BarChart3,
    title: 'Analyze & Improve',
    description: 'Receive instant grading with detailed corrections and explanations for every question.',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  }
];

const CORE_CAPABILITIES = [
  { title: 'Autosave Protection', desc: 'Your progress is saved after every click. Never lose an answer to poor network.' },
  { title: 'Anti-Cheat Integrity', desc: 'Focus detection and content protection ensure a fair and rigorous practice session.' },
  { title: 'Deep Analytics', desc: 'Track your average scores and subject mastery over time with visual charts.' },
  { title: 'Native Feel', desc: 'Optimized for mobile-first use. Install it on your device for the full experience.' },
];

function FeaturesPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
              Platform Overview
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground-strong sm:text-6xl font-display">
              Examination logic, <br/><span className="text-primary">perfected.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted max-w-2xl mx-auto">
              TestFlow combines rigorous academic standards with a world-class digital interface
              to provide the ultimate preparation environment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Workflow */}
      <section className="mx-auto w-full max-w-5xl px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card raised className="h-full border-primary/5 hover:border-primary/20 transition-all group p-8">
                <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm", step.bg)}>
                  <step.icon className={cn("size-7", step.color)} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-[10px] font-black text-primary opacity-40 uppercase tracking-widest">Step 0{index + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground-strong tracking-tight mb-3 font-display">{step.title}</h2>
                <p className="text-sm leading-relaxed text-muted font-medium">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="bg-surface-strong/50 border-y border-border/50 py-20 mt-12">
        <div className="mx-auto max-w-5xl px-5">
           <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-8">
                 <h2 className="text-3xl font-black text-foreground-strong font-display tracking-tight">Built for Integrity</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {CORE_CAPABILITIES.map((cap) => (
                      <div key={cap.title} className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-primary shrink-0" />
                            <h3 className="font-bold text-sm text-foreground-strong">{cap.title}</h3>
                         </div>
                         <p className="text-xs text-muted leading-relaxed font-medium pl-6">{cap.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="w-full max-w-[320px] shrink-0">
                 <div className="relative aspect-[9/16] rounded-[2.5rem] border-[8px] border-surface bg-background shadow-2xl overflow-hidden p-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface rounded-b-2xl z-10" />
                    <div className="h-full w-full rounded-[1.5rem] overflow-hidden border border-border/50 flex flex-col items-center justify-center bg-surface gap-4">
                        <Lock size={48} className="text-primary opacity-10 animate-pulse" />
                        <p className="text-[10px] font-black uppercase text-muted tracking-tighter">Secure Focus Mode</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto w-full max-w-xl px-5 py-24 text-center">
         <h2 className="text-2xl font-bold text-foreground-strong mb-8 font-display">Ready to begin your first simulation?</h2>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-12 rounded-full shadow-xl shadow-primary/20">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full px-12 rounded-full shadow-xl shadow-primary/20">
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full px-12 rounded-full">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
         </div>
         <p className="mt-8 text-xs font-bold text-muted uppercase tracking-[0.2em]">Join hundreds of academic achievers</p>
      </section>
    </div>
  );
}

export default FeaturesPage;
