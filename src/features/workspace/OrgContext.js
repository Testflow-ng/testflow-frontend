import { createContext, useContext } from 'react';

export const OrgContext = createContext(null);
/** The organisation being managed: { org, orgId }. Only valid inside the workspace. */
export const useOrg = () => useContext(OrgContext);
