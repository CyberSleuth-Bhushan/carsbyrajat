import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompareContextType {
  shortlist: number[];
  toggleShortlist: (id: number) => void;
  isShortlisted: (id: number) => boolean;
  clearShortlist: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shortlist, setShortlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cbr_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cbr_shortlist', JSON.stringify(shortlist));
    } catch {}
  }, [shortlist]);

  const toggleShortlist = (id: number) => {
    setShortlist((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 vehicles simultaneously.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const isShortlisted = (id: number) => shortlist.includes(id);

  const clearShortlist = () => setShortlist([]);

  return (
    <CompareContext.Provider value={{ shortlist, toggleShortlist, isShortlisted, clearShortlist }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};

