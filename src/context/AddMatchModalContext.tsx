import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddMatchForm } from '@/components/AddMatchForm';

type AddMatchModalContextValue = {
  openAddMatchModal: () => void;
};

const AddMatchModalContext = createContext<AddMatchModalContextValue | null>(null);

export function useAddMatchModal() {
  const ctx = useContext(AddMatchModalContext);
  if (!ctx) throw new Error('useAddMatchModal must be used within AddMatchModalProvider');
  return ctx;
}

export function AddMatchModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const openAddMatchModal = useCallback(() => {
    setOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    navigate('/inicio', { replace: true });
  }, [navigate]);

  return (
    <AddMatchModalContext.Provider value={{ openAddMatchModal }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addMatch.title')}</DialogTitle>
          </DialogHeader>
          <AddMatchForm onSuccess={handleSuccess} compact />
        </DialogContent>
      </Dialog>
    </AddMatchModalContext.Provider>
  );
}
