import { RouterProvider } from 'react-router-dom';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { router } from './router';

export function App() {
  return (
    <PreferencesProvider>
      <RouterProvider router={router} />
    </PreferencesProvider>
  );
}
