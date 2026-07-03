import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';

function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <Header />
      <OfflineBanner />

      <main className="flex flex-1 flex-col relative z-10">
        <Outlet />
      </main>

      {/* Subtle Footer for a more complete look */}
      <footer className="w-full border-t border-border/50 bg-surface/30 py-6 px-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-50">
          Powered by TestFlow &bull; Eddyrus Media
        </p>
      </footer>
    </div>
  );
}

export default RootLayout;
