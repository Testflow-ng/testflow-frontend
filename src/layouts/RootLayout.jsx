import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';

function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Header />
      <OfflineBanner />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
