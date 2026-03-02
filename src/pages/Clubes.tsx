import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getClubStats } from '@/lib/utils';
import { clubs as clubsApi } from '@/lib/api';
import { Spinner } from '@/components/Spinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Trash2, Trophy, Building2, Pencil } from '@/components/icons';
import { useMatches } from '@/hooks/useMatches';
import { useClubs } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Club, ClubType } from '@/types';

const COURT_TYPE_APP_TO_API = { indoor: 'INDOOR' as const, outdoor: 'OUTDOOR' as const };

export default function ClubesPage() {
  const { t } = useTranslation();
  const { matchesList, isLoading: matchesLoading } = useMatches();
  const { clubsList: allClubs, isLoading: clubsLoading, revalidateClubs: refetchClubs } = useClubs();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ClubType>('outdoor');
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [deleteBlockMessage, setDeleteBlockMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const clubStats = getClubStats(matchesList);
  const clubMap = Object.fromEntries(allClubs.map((c) => [c.id, c]));
  const mostPlayed = clubStats.length ? clubStats.reduce((a, b) => (a.played >= b.played ? a : b)) : null;
  const mostWins = clubStats.length ? clubStats.reduce((a, b) => (a.won >= b.won ? a : b)) : null;

  const openAdd = () => {
    setNewName('');
    setNewType('outdoor');
    setError('');
    setAddModalOpen(true);
  };

  const openEdit = (club: Club) => {
    setEditingClub(club);
    setNewName(club.name);
    setNewType(club.type ?? 'outdoor');
    setError('');
    setEditModalOpen(true);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await clubsApi.create({
        name: newName.trim(),
        courtType: COURT_TYPE_APP_TO_API[newType],
      });
      await refetchClubs();
      setAddModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('clubes.errorSave'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingClub) return;
    if (!newName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await clubsApi.update(editingClub.id, {
        name: newName.trim(),
        courtType: COURT_TYPE_APP_TO_API[newType],
      });
      await refetchClubs();
      setEditModalOpen(false);
      setEditingClub(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('clubes.errorSave'));
    } finally {
      setSubmitting(false);
    }
  };

  const tryDelete = (item: Club) => {
    const stats = clubStats.find((s) => s.clubId === item.id);
    if (stats && stats.played > 0) {
      setDeleteBlockMessage(
        t('clubes.cannotDeleteMessage', { name: item.name, count: stats.played })
      );
      return;
    }
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await clubsApi.delete(deleteTarget.id);
      await refetchClubs();
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('clubes.errorDelete'));
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = matchesLoading || clubsLoading;

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-0 pt-16 md:pt-8 px-4 md:px-0 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('clubes.title')}</h1>
          <p className="text-sm mt-1 text-muted-foreground">{t('clubes.subtitle')}</p>
        </div>
        <Button size="icon" onClick={openAdd} className="w-10 h-10 rounded-xl">
          <Plus size={20} />
        </Button>
      </div>

      {/* Resumen destacado */}
      {(mostPlayed || mostWins) && (
        <Card className="mb-6">
          <CardContent className="p-3.5">
            <p className="text-sm font-bold mb-2.5 text-foreground">{t('clubes.yourClubs')}</p>
            {mostPlayed && (
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 size={16} className="text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  {t('clubes.mostPlayed', { name: clubMap[mostPlayed.clubId]?.name ?? mostPlayed.clubId, count: mostPlayed.played })}
                </p>
              </div>
            )}
            {mostWins && (
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-success shrink-0" />
                <p className="text-sm text-foreground">
                  {t('clubes.mostWins', { name: clubMap[mostWins.clubId]?.name ?? mostWins.clubId, count: mostWins.won })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('clubes.addClub')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('clubes.clubNamePlaceholder')}
              autoFocus
            />
            <div className="flex gap-2">
              {(['outdoor', 'indoor'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={newType === type ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewType(type)}
                >
                  {t(`clubes.${type}`)}
                </Button>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleAdd} disabled={!newName.trim() || submitting} className="w-full">
              {t('clubes.addClub')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={(open) => { if (!open) { setEditModalOpen(false); setEditingClub(null); setError(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('clubes.editClub')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('clubes.clubNamePlaceholder')}
              autoFocus
            />
            <div className="flex gap-2">
              {(['outdoor', 'indoor'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={newType === type ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setNewType(type)}
                >
                  {t(`clubes.${type}`)}
                </Button>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleEdit} disabled={!newName.trim() || submitting} className="w-full">
              {t('clubes.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Spinner />
      ) : allClubs.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-center text-muted-foreground">
            {t('clubes.empty')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
                    {club.type && (
                      <p className="text-xs mt-0.5 text-muted-foreground">
                        {t(`clubes.${club.type}`)}
                      </p>
                    )}
                    {stats && stats.played > 0 && (
                      <p className="text-xs mt-1 font-medium text-primary">
                        {t('clubes.matchesCount', { played: stats.played, won: stats.won })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => openEdit(club)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
                      onClick={() => tryDelete(club)}
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
        title={t('clubes.deleteTitle')}
        message={t('clubes.deleteMessage', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('clubes.deleteConfirm')}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteBlockMessage}
        title={t('clubes.cannotDeleteTitle')}
        message={deleteBlockMessage}
        confirmLabel={t('clubes.understood')}
        onConfirm={() => setDeleteBlockMessage('')}
        onCancel={() => setDeleteBlockMessage('')}
      />
    </div>
  );
}
