import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { getPartnerStats, getPlayerDisplayName } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Pencil, Trash2 } from '@/components/icons';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Player } from '@/types';

const LEVEL_KEYS = ['principiante', 'intermedio', 'avanzado'] as const;
type LevelKey = (typeof LEVEL_KEYS)[number];

const LEVEL_TRANSLATION_KEYS: Record<LevelKey, string> = {
  principiante: 'jugadores.beginner',
  intermedio: 'jugadores.intermediate',
  avanzado: 'jugadores.advanced',
};

export default function JugadoresPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { playersList, isLoading: loadingPlayers } = usePlayers();
  const { matchesList, isLoading: loadingMatches } = useMatches();
  const isLoading = loadingPlayers || loadingMatches;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [level, setLevel] = useState<LevelKey | ''>('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [deleteBlockMessage, setDeleteBlockMessage] = useState('');

  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setLevel('');
    setPlayerModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditingId(p.id);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setLevel((p.level && LEVEL_KEYS.includes(p.level as LevelKey) ? p.level : '') as LevelKey | '');
    setPlayerModalOpen(true);
  };

  const handleSave = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      const body = appPlayerToApiBody({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        level: level || undefined,
      });
      if (editingId) {
        await playersApi.update(editingId, body);
      } else {
        await playersApi.create(body);
      }
      await revalidatePlayers();
      setPlayerModalOpen(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const tryDelete = (p: Player) => {
    const stats = getPartnerStats(userId, p.id, matchesList);
    if (stats.played > 0) {
      setDeleteBlockMessage(
        t('jugadores.cannotDeleteMessage', {
          name: getPlayerDisplayName(p),
          count: stats.played,
        })
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
    <div className="flex-1 overflow-y-auto pb-32 md:pb-0 pt-14 md:pt-0 bg-background">
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('jugadores.title')}</h1>
          <p className="text-sm mt-0.5 text-muted-foreground">{t('jugadores.count', { count: playersList.length })}</p>
        </div>
        <Button size="icon" onClick={openAdd} className="w-10 h-10 rounded-xl">
          <Plus size={20} />
        </Button>
      </div>

      <Dialog open={playerModalOpen} onOpenChange={setPlayerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t('jugadores.editPlayer') : t('jugadores.addPlayer')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <div className="space-y-1.5">
              <Label>{t('jugadores.name')}</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('jugadores.namePlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('jugadores.lastName')}</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('jugadores.lastNamePlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('jugadores.level')}</Label>
              <Select
                value={level || '__none__'}
                onValueChange={(v) => setLevel(v === '__none__' ? '' : (v as LevelKey))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('jugadores.selectLevel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('jugadores.noLevel')}</SelectItem>
                  {LEVEL_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(LEVEL_TRANSLATION_KEYS[key])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSave}
              disabled={!firstName.trim() || saving}
              className="w-full mt-1"
            >
              {saving ? t('jugadores.saving') : editingId ? t('jugadores.save') : t('jugadores.addPlayer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Spinner />
      ) : playersList.length === 0 ? (
        <div className="flex items-center justify-center py-16 px-4">
          <p className="text-sm text-center text-muted-foreground">
            {t('jugadores.empty')}
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
                          {LEVEL_TRANSLATION_KEYS[p.level as LevelKey] ? t(LEVEL_TRANSLATION_KEYS[p.level as LevelKey]) : p.level}
                        </Badge>
                      )}
                    </div>
                    {stats.played > 0 && (
                      <p className="text-xs mt-1 font-medium text-primary">
                        {t('jugadores.matchesWithYou_plural', {
                          count: stats.played,
                          won: stats.won,
                          percent: Math.round((stats.won / stats.played) * 100),
                        })}
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
        title={t('jugadores.deleteTitle')}
        message={t('jugadores.deleteMessage', { name: deleteTarget ? getPlayerDisplayName(deleteTarget) : '' })}
        confirmLabel={t('jugadores.deleteConfirm')}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteBlockMessage}
        title={t('jugadores.cannotDeleteTitle')}
        message={deleteBlockMessage}
        confirmLabel={t('jugadores.understood')}
        onConfirm={() => setDeleteBlockMessage('')}
        onCancel={() => setDeleteBlockMessage('')}
      />
    </div>
  );
}
