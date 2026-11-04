import { createContext, useContext } from 'react';

export const TenantContext = createContext(null);
/** { site, brand, user, status, login, register, logout } for the organisation being viewed. */
export const useTenant = () => useContext(TenantContext);
