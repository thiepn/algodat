import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { coreContent as content } from '../../content/loaders/core';
import { preferencesRepository } from '../../persistence/repositories';

interface PreferencesContextValue {
  selectedExamProfileId: string;
  setSelectedExamProfileId: (id: string) => void;
  ready: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const defaultProfile = content.profiles[0]?.id ?? 'standard-praesenz';
  const [selectedExamProfileId, setSelectedState] = useState(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void preferencesRepository.get('preferences').then((stored) => {
      if (
        stored &&
        content.profiles.some((profile) => profile.id === stored.selectedExamProfileId)
      ) {
        setSelectedState(stored.selectedExamProfileId);
      }
      setReady(true);
    });
  }, []);

  const setSelectedExamProfileId = (id: string) => {
    setSelectedState(id);
    void preferencesRepository.put({
      id: 'preferences',
      selectedExamProfileId: id,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      updatedAt: new Date().toISOString(),
    });
  };

  const value = useMemo(
    () => ({ selectedExamProfileId, setSelectedExamProfileId, ready }),
    [ready, selectedExamProfileId],
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences muss innerhalb des Providers verwendet werden.');
  return value;
}
