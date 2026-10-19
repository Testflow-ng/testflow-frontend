import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OrgThemeProvider from '../../components/everybody/OrgThemeProvider.jsx';
import { TenantContext } from './TenantContext.js';
import { setTenantHost, tenantApi } from './tenantApi.js';

/** Loads the organisation behind this address, its brand and the signed-in student, and themes everything with its colours. */
function TenantProvider({ hostname, children }) {
  const qc = useQueryClient();
  setTenantHost(hostname);

  const siteQ = useQuery({ queryKey: ['tenant', hostname, 'site'], queryFn: tenantApi.site, retry: false, staleTime: 5 * 60 * 1000 });
  const meQ = useQuery({ queryKey: ['tenant', hostname, 'me'], queryFn: () => tenantApi.me().catch(() => null), retry: false, enabled: siteQ.isSuccess });

  const brand = useMemo(() => ({ ...(siteQ.data?.site?.brand ?? {}), name: siteQ.data?.site?.brand?.name ?? siteQ.data?.organization?.name }), [siteQ.data]);

  // The browser tab and share data follow the organisation's brand, never Testflow's.
  useEffect(() => {
    if (!brand.name) return;
    document.title = brand.name;
    const setMeta = (sel, attr, value) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement('meta'); const [k, v] = sel.match(/\[(.+?)="(.+?)"\]/).slice(1); el.setAttribute(k, v); document.head.appendChild(el); }
      el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', 'content', brand.name);
    setMeta('meta[name="application-name"]', 'content', brand.name);
    if (brand.primaryColor) setMeta('meta[name="theme-color"]', 'content', brand.primaryColor);
    if (brand.logoUrl) {
      let icon = document.head.querySelector('link[rel="icon"]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
      icon.href = brand.logoUrl;
    }
  }, [brand]);

  const setUser = useCallback((u) => qc.setQueryData(['tenant', hostname, 'me'], u), [qc, hostname]);
  const value = useMemo(() => ({
    hostname,
    site: siteQ.data?.site,
    organization: siteQ.data?.organization,
    brand,
    user: meQ.data ?? null,
    status: siteQ.isLoading || (siteQ.isSuccess && meQ.isLoading) ? 'loading' : siteQ.isError ? 'missing' : meQ.data ? 'signed-in' : 'signed-out',
    login: async (body) => setUser(await tenantApi.login(body)),
    register: async (body) => setUser(await tenantApi.register(body)),
    logout: async () => { try { await tenantApi.logout(); } finally { setUser(null); } },
  }), [hostname, siteQ, meQ, brand, setUser]);

  return (
    <TenantContext.Provider value={value}>
      <OrgThemeProvider brand={brand} className="min-h-svh bg-background">{children}</OrgThemeProvider>
    </TenantContext.Provider>
  );
}

export default TenantProvider;
