import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClubStats } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, X, Trash2, Trophy, Building2 } from '@/components/icons';
import { useMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Club } from '@/types';

export default function ClubesPage() {
  const { matchesList, isLoading } = useMatches();
  const [localClubNames, setLocalClubNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [deleteBlockMessage, setDeleteBlockMessage] = useState('');

  const clubNamesFromMatches = [...new Set(matchesList.map((m) => m.clubId).filter(Boolean))] as string[];
  const allClubs: Club[] = [
    ...clubNamesFromMatches.map((name) => ({ id: name, name })),
    ...localClubNames
      .filter((n) => !clubNamesFromMatches.includes(n))
      .map((name) => ({ id: name, name })),
  ].filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const clubStats = getClubStats(matchesList);
  const clubMap = Object.fromEntries(allClubs.map((c) => [c.id, c]));
  const mostPlayed = clubStats.length ? clubStats.reduce((a, b) => (a.played >= b.played ? a : b)) : null;
  const mostWins = clubStats.length ? clubStats.reduce((a, b) => (a.won >= b.won ? a : b)) : null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    setLocalClubNames((prev) => (prev.includes(newName.trim()) ? prev : [...prev, newName.trim()].sort()));
    setNewName('');
    setNewCity('');
    setShowForm(false);
  };

  const tryDelete = (item: Club) => {
    const stats = clubStats.find((s) => s.clubId === item.id);
    if (stats && stats.played > 0) {
      setDeleteBlockMessage(
        `${item.name} tiene ${stats.played} partido${stats.played !== 1 ? 's' : ''} asociado${stats.played !== 1 ? 's' : ''}. Solo puedes eliminar clubes sin partidos.`
      );
      return;
    }
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setLocalClubNames((prev) => prev.filter((n) => n !== deleteTarget.name));
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-14 bg-background">
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clubes</h1>
          <p className="text-sm mt-0.5 text-muted-foreground">Donde juegas</p>
        </div>
        <Button size="icon" onClick={() => setShowForm((v) => !v)} className="w-10 h-10 rounded-xl">
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </Button>
      </div>

      {/* Resumen destacado */}
      {(mostPlayed || mostWins) && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-3.5">
            <p className="text-sm font-bold mb-2.5 text-foreground">Tus clubes</p>
            {mostPlayed && (
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 size={16} className="text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  Donde más juegas: <strong>{clubMap[mostPlayed.clubId]?.name ?? mostPlayed.clubId}</strong> ({mostPlayed.played} partidos)
                </p>
              </div>
            )}
            {mostWins && (
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-success shrink-0" />
                <p className="text-sm text-foreground">
                  Donde más ganas: <strong>{clubMap[mostWins.clubId]?.name ?? mostWins.clubId}</strong> ({mostWins.won} victorias)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulario añadir */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <Card className="mx-4 mb-4">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del club"
                  autoFocus
                />
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Ciudad"
                />
                <Button onClick={handleAdd} disabled={!newName.trim()} className="w-full">
                  Añadir club
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Spinner />
      ) : allClubs.length === 0 ? (
        <div className="flex items-center justify-center py-16 px-4">
          <p className="text-sm text-center text-muted-foreground">
            No hay clubes. Añade uno para empezar.
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2.5">
          {allClubs.map((club) => {
            const stats = clubStats.find((s) => s.clubId === club.id);
            return (
              <Card key={club.id}>
                <CardContent className="p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/15">
                    <Building2 size={22} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate text-foreground">{club.name}</p>
                    {club.city && (
                      <p className="text-xs mt-0.5 text-muted-foreground">{club.city}</p>
                    )}
                    {stats && stats.played > 0 && (
                      <p className="text-xs mt-1 font-medium text-primary">
                        {stats.played} partidos · {stats.won} victorias
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive ml-2 shrink-0"
                    onClick={() => tryDelete(club)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar club"
        message={`¿Eliminar ${deleteTarget?.name}?`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteBlockMessage}
        title="No se puede eliminar"
        message={deleteBlockMessage}
        confirmLabel="Entendido"
        onConfirm={() => setDeleteBlockMessage('')}
        onCancel={() => setDeleteBlockMessage('')}
      />
    </div>
  );
}
