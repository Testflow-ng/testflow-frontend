import { contrastRatio, isHex, readableOn, shade } from '../../utils/color.js';

/** Token overrides for an organisation's brand colours (see OrgThemeProvider). Invalid or unreadable colours are ignored. */
export function orgThemeVars({ primaryColor, accentColor }) {
  const vars = {};
  if (isHex(primaryColor) && contrastRatio(primaryColor, '#f6f4ee') >= 3) {
    vars['--color-primary'] = primaryColor;
    vars['--color-primary-hover'] = shade(primaryColor, 0.14);
    vars['--color-primary-active'] = shade(primaryColor, 0.26);
    vars['--color-primary-foreground'] = readableOn(primaryColor);
    vars['--color-focus'] = primaryColor;
    vars['--brand-indigo'] = primaryColor;
  }
  if (isHex(accentColor)) {
    vars['--color-accent'] = accentColor;
    vars['--color-accent-hover'] = shade(accentColor, 0.1);
    vars['--color-accent-active'] = shade(accentColor, 0.2);
    vars['--color-accent-foreground'] = readableOn(accentColor);
    vars['--brand-lime'] = accentColor;
  }
  return vars;
}

