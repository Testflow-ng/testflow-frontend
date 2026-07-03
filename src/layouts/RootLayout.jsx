import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import LargeScreenNotice from '../components/LargeScreenNotice.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <LargeScreenNotice />
      <Header />
      <OfflineBanner />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
