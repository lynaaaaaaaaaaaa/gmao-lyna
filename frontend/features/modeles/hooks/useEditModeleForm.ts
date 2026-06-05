'use client';

import { useEffect, useState } from 'react';

import { getFamilles } from '@/features/familles/services/famille.service';
import type { FamilleApi } from '@/features/familles/types/famille';

import {
  getEtatsModele,
  getFabricants,
  getMarques,
  getModeleById,
  getTypesEquipement,
  updateModele,
} from '@/features/modeles/services/modele.service';

import type {
  FabricantApi,
  MarqueApi,
  ModeleApi,
  ModeleEtat,
  TypeEquipementApi,
  UpdateModelePayload,
} from '@/features/modeles/types/modele';

type UseEditModeleFormOptions = {
  modeleId: string;
  onSuccess?: () => void;
};

export function useEditModeleForm({
  modeleId,
  onSuccess,
}: UseEditModeleFormOptions) {
  const [modele, setModele] = useState<ModeleApi | null>(null);

  const [familles, setFamilles] = useState<FamilleApi[]>([]);
  const [etats, setEtats] = useState<ModeleEtat[]>([]);
  const [typesEquipement, setTypesEquipement] = useState<TypeEquipementApi[]>(
    [],
  );
  const [fabricants, setFabricants] = useState<FabricantApi[]>([]);
  const [marques, setMarques] = useState<MarqueApi[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [
          modeleData,
          famillesData,
          etatsData,
          typesEquipementData,
          fabricantsData,
          marquesData,
        ] = await Promise.all([
          getModeleById(modeleId),
          getFamilles(),
          getEtatsModele(),
          getTypesEquipement(),
          getFabricants(),
          getMarques(),
        ]);

        setModele(modeleData);
        setFamilles(famillesData);
        setEtats(etatsData);
        setTypesEquipement(typesEquipementData);
        setFabricants(fabricantsData);
        setMarques(marquesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue.');
      } finally {
        setLoading(false);
      }
    }

    if (modeleId) {
      fetchData();
    }
  }, [modeleId]);

  async function submitModele(payload: UpdateModelePayload) {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await updateModele(modeleId, payload);

      setModele(updated);
      setSuccess('Le modèle a été modifié avec succès.');
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la modification.';

      setError(message);
      setSuccess(null);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    modele,

    familles,
    etats,
    typesEquipement,
    fabricants,
    marques,

    loading,
    saving,
    error,
    success,

    submitModele,
  };
}