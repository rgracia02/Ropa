import React, { createContext, useContext } from 'react';

export interface IPhoneContextType {
  isIPhoneFrame: boolean;
  setIsIPhoneFrame: (val: boolean) => void;
}

export const IPhoneContext = createContext<IPhoneContextType>({
  isIPhoneFrame: true,
  setIsIPhoneFrame: () => {},
});

export const useIPhoneMode = () => useContext(IPhoneContext);
