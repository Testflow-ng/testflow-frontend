function HomePage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-12 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.08em] text-muted">Eddyrus Media</p>
      <h1 className="text-foreground-strong">TestFlow</h1>
      <p className="max-w-[34ch] text-lg leading-snug text-muted">
        Mobile-first computer-based testing. The foundation is ready and the product is in active
        development.
      </p>
    </section>
  );
}

export default HomePage;
