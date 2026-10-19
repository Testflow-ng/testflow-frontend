import { orgThemeVars } from './orgThemeVars.js';

/**
 * Applies an organisation's own colours to everything inside it, without touching the rest of the app.
 * It overrides the semantic tokens (primary, accent and their hover/active/foreground) on a wrapper element, so
 * every shared component (`Button`, `Badge`, focus rings ...) picks the colours up. See orgThemeVars.js for the safety rules.
 */
function OrgThemeProvider({ brand = {}, children, className }) {
  return (
    <div className={className} style={orgThemeVars(brand)}>
      {children}
    </div>
  );
}

export default OrgThemeProvider;
