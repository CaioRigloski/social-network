'use client'

import React, { createContext, useState, useContext, useEffect, useRef } from 'react'

const HeaderHeightContext = createContext()

export const useHeaderHeight = () => useContext(HeaderHeightContext)

export const HeaderHeightProvider = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef(null)

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, []);

  return (
    <HeaderHeightContext.Provider value={{ headerHeight, headerRef }}>
      {children}
    </HeaderHeightContext.Provider>
  );
};
