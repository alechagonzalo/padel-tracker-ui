import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getPartnerStats, getPlayerDisplayName } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, X, Pencil, Trash2 } from '@/components/icons';
import { players as playersApi } from '@/lib/api';
import { appPlayerToApiBody } from '@/lib/apiMappers';
import { usePlayers, revalidatePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Player } from '@/types';

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'] as const;
type Nivel = (typeof NIVELES)[number];

const LEVEL_DISPLAY_TO_KEY: Record<string, string> = {
  Principiante: 'principiante',
  Intermedio: 'intermedio',
  Avanzado: 'avanzado',
};
const LEVEL_KEY_TO_DISPLAY: Record<string, Nivel> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export default function JugadoresPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { playersList, isLoading: loadingPlayers } = usePlayers();
  const { matchesList, isLoading: loadingMatches } = useMatches();
  const isLoading = loadingPlayers || loadingMatches;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [level, setLevel] = useState<Nivel | ''>('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [deleteBlockMessage, setDeleteBlockMessage] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setLevel('');
    setShowForm(true);
  };

  const openEdit = (p: Player) => {
    setEditingId(p.id);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setLevel((p.level && LEVEL_KEY_TO_DISPLAY[p.level]) || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      const body = appPlayerToApiBody({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        level: level ? LEVEL_DISPLAY_TO_KEY[level] : undefined,
      });
      if (editingId) {
        await playersApi.update(editingId, body);
      } else {
        await playersApi.create(body);
      }
      await revalidatePlayers();
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const tryDelete = (p: Player) => {
    const stats = getPartnerStats(userId, p.id, matchesList);
    if (stats.played > 0) {
      setDeleteBlockMessage(
        `${getPlayerDisplayName(p)} tiene ${stats.played} partido${stats.played !== 1 ? 's' : ''} asociado${stats.played !== 1 ? 's' : ''}. Solo puedes eliminar jugadores sin partidos.`
      );
      return;
    }
    setDeleteTarget(p);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await playersApi.delete(deleteTarget.id);
    await revalidatePlayers();
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-14 bg-background">
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jugadores</h1>
          <p className="text-sm mt-0.5 text-muted-foreground">{playersList.length} jugadores</p>
        </div>
        <Button
          size="icon"
          onClick={showForm ? () => setShowForm(false) : openAdd}
          className="w-10 h-10 rounded-xl"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </Button>
      </div>

      {/* Formulario añadir/editar */}
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
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre del jugador"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Apellido</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellido del jugador"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <div className="flex gap-2 flex-wrap">
                    {NIVELES.map((n) => (
                      <Button
                        key={n}
                        type="button"
                        variant={level === n ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setLevel(level === n ? '' : n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!firstName.trim() || saving}
                  className="w-full mt-1"
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar' : 'Añadir jugador'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Spinner />
      ) : playersList.length === 0 ? (
        <div className="flex items-center justify-center py-16 px-4">
          <p className="text-sm text-center text-muted-foreground">
            No hay jugadores. Añade uno para empezar.
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2.5">
          {playersList.map((p) => {
            const stats = getPartnerStats(userId, p.id, matchesList);
            return (
              <Card key={p.id}>
                <CardContent className="p-3.5 flex items-center gap-3">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="text-base font-bold bg-primary/15 text-primary">
                      {(p.firstName || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {getPlayerDisplayName(p)}
                      </p>
                      {p.level && (
                        <Badge variant="secondary" className="text-xs">
                          {LEVEL_KEY_TO_DISPLAY[p.level] ?? p.level}
                        </Badge>
                      )}
                    </div>
                    {stats.played > 0 && (
                      <p className="text-xs mt-1 font-medium text-primary">
                        {stats.played} partido{stats.played !== 1 ? 's' : ''} contigo · {stats.won} victoria{stats.won !== 1 ? 's' : ''} ({Math.round((stats.won / stats.played) * 100)}%)
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
                      onClick={() => tryDelete(p)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar jugador"
        message={`¿Eliminar a ${deleteTarget ? getPlayerDisplayName(deleteTarget) : ''}?`}
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
