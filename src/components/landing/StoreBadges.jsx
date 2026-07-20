import './StoreBadges.css';

function StoreBadges({ className }) {
  return (
    <div className={className}>
      <img
        src="/badges/app-store.svg"
        alt="Download on the App Store, coming soon"
        width={144}
        height={48}
        className="store-badge--invert h-12 w-auto transition-transform hover:scale-[1.03]"
      />
      <img
        src="/badges/google-play.png"
        alt="Get it on Google Play, coming soon"
        width={161}
        height={48}
        className="h-12 w-auto transition-transform hover:scale-[1.03]"
      />
    </div>
  );
}

export default StoreBadges;
