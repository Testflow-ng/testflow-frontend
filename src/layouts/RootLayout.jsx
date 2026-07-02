import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import LargeScreenNotice from '../components/LargeScreenNotice.jsx';

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <LargeScreenNotice />
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
