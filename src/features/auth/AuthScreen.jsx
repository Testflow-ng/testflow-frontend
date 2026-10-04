function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <section
      className="
        mx-auto flex w-full max-w-[27rem] flex-1 flex-col
        px-5 pb-[calc(2.5rem+var(--safe-bottom))]
        pt-10
        sm:justify-center sm:px-0 sm:pt-0
      "
    >
      {/* Heading */}
      <div>
        <h1
          className="
            font-heading text-[2rem] font-extrabold
            leading-[1.08] tracking-[-0.035em]
            text-foreground-strong
            sm:text-[2.15rem]
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
              mt-2.5 max-w-[35ch]
              text-[15px] leading-6
              text-muted
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Form content */}
      <div className="mt-8">
        {children}
      </div>

      {/* Bottom action / navigation */}
      {footer && (
        <div
          className="
            mt-7 border-t border-border/70
            pt-5 text-[14px] leading-5 text-muted
          "
        >
          {footer}
        </div>
      )}
    </section>
  );
}

export default AuthScreen;
