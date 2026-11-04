import { createContext, useContext } from 'react';

export const TourContext = createContext({ start: () => {}, active: false });
export const useTour = () => useContext(TourContext);
