'use client';

import { useEffect, useState } from 'react';

import {
  createPppDeclencheur,
  deletePppDeclencheur,
  getPlanPreventifPredefiniById,
  updatePlanPreventifPredefini,
  updatePppDeclencheur,
} from '../services/plan-preventif-predefini.service';
import type {
  DeclencheurFormValues,
  PlanPreventifPredefini,
  PppDeclencheur,
} from '../types/plan-preventif-predefini.types';

type UseEditPlanPreventifPredefiniFormOptions = {
  id?: number;
  onSuccess?: () => void;
};

type FormValues = {
  code: string;
  libelle: string;
  etat: string;
  organisation: string;
  typeDeclenchement: string;
  idModele: string;
  actif: boolean;
};

const initialValues: FormValues = {
  code: '',
  libelle: '',
  etat: '',
  organisation: '',
  typeDeclenchement: '',
  idModele: '',
  actif: true,
};

const initialDeclencheurValues: DeclencheurFormValues = {
  priorite: '1',
  typeDeclencheur: 'CALENDAIRE',
  idGamme: '',
  idModele: '',
  horizonJours: '',
  toleranceJours: '',
  periodiciteValeur: '',
  periodiciteUnite: 'jour',
  actif: true,
  nombreJoursPremierLancement: '',
  mesureCode: '',
  operateur: '',
  seuilValeur: '',
  symptomeCode: '',
};

export function useEditPlanPreventifPredefiniForm(
  options?: UseEditPlanPreventifPredefiniFormOptions,
) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [item, setItem] = useState<PlanPreventifPredefini | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [declencheurValues, setDeclencheurValues] =
    useState<DeclencheurFormValues>(initialDeclencheurValues);
  const [declencheurSaving, setDeclencheurSaving] = useState(false);
  const [declencheurError, setDeclencheurError] = useState<string | null>(null);
  const [editingDeclencheurId, setEditingDeclencheurId] = useState<number | null>(
    null,
  );

  const id = options?.id;

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function setDeclencheurField<K extends keyof DeclencheurFormValues>(
    field: K,
    value: DeclencheurFormValues[K],
  ) {
    setDeclencheurValues((prev) => ({ ...prev, [field]: value }));
  }

  function resetDeclencheurForm() {
    setDeclencheurValues(initialDeclencheurValues);
    setEditingDeclencheurId(null);
    setDeclencheurError(null);
  }

  function startEditDeclencheur(declencheur: PppDeclencheur) {
    setEditingDeclencheurId(declencheur.idPppDeclencheur);
    setDeclencheurError(null);

    setDeclencheurValues({
      priorite:
        declencheur.priorite !== null && declencheur.priorite !== undefined
          ? String(declencheur.priorite)
          : '',
      typeDeclencheur: declencheur.typeDeclencheur ?? 'CALENDAIRE',
      idGamme:
        declencheur.idGamme !== null && declencheur.idGamme !== undefined
          ? String(declencheur.idGamme)
          : '',
      idModele:
        declencheur.idModele !== null && declencheur.idModele !== undefined
          ? String(declencheur.idModele)
          : '',
      horizonJours:
        declencheur.horizonJours !== null &&
        declencheur.horizonJours !== undefined
          ? String(declencheur.horizonJours)
          : '',
      toleranceJours:
        declencheur.toleranceJours !== null &&
        declencheur.toleranceJours !== undefined
          ? String(declencheur.toleranceJours)
          : '',
      periodiciteValeur:
        declencheur.periodiciteValeur !== null &&
        declencheur.periodiciteValeur !== undefined
          ? String(declencheur.periodiciteValeur)
          : '',
      periodiciteUnite: declencheur.periodiciteUnite ?? '',
      actif: declencheur.actif ?? true,
      nombreJoursPremierLancement:
        declencheur.nombreJoursPremierLancement !== null &&
        declencheur.nombreJoursPremierLancement !== undefined
          ? String(declencheur.nombreJoursPremierLancement)
          : '',
      mesureCode: declencheur.mesureCode ?? '',
      operateur: declencheur.operateur ?? '',
      seuilValeur:
        declencheur.seuilValeur !== null && declencheur.seuilValeur !== undefined
          ? String(declencheur.seuilValeur)
          : '',
      symptomeCode: declencheur.symptomeCode ?? '',
    });
  }

  async function loadData() {
    if (!id || Number.isNaN(id)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPlanPreventifPredefiniById(id);
      setItem(data);

      setValues({
        code: data.code ?? '',
        libelle: data.titre ?? '',
        etat: data.etat ?? '',
        organisation: data.organisation ?? '',
        typeDeclenchement: data.typeDeclenchement ?? '',
        idModele:
          data.idModele !== null && data.idModele !== undefined
            ? String(data.idModele)
            : '',
        actif: data.actif ?? true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du plan préventif prédéfini.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id || Number.isNaN(id)) {
      setError('Identifiant invalide.');
      return;
    }

    if (!values.code.trim()) {
      setError('Le code est obligatoire.');
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updatePlanPreventifPredefini(id, {
        code: values.code.trim(),
        libelle: values.libelle.trim() || undefined,
        etat: values.etat || undefined,
        organisation: values.organisation.trim() || undefined,
        typeDeclenchement: values.typeDeclenchement || undefined,
        idModele: values.idModele ? Number(values.idModele) : undefined,
        actif: values.actif,
      });

      setSuccess('Plan préventif prédéfini mis à jour avec succès.');
      await loadData();

      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour du plan préventif prédéfini.',
      );
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateOrUpdateDeclencheur(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!id || Number.isNaN(id)) {
      setDeclencheurError('Identifiant de PPP invalide.');
      return;
    }

    if (!declencheurValues.idGamme) {
      setDeclencheurError('La gamme est obligatoire.');
      return;
    }

    try {
      setDeclencheurSaving(true);
      setDeclencheurError(null);

      const payload = {
        priorite: declencheurValues.priorite
          ? Number(declencheurValues.priorite)
          : undefined,
        typeDeclencheur: declencheurValues.typeDeclencheur || undefined,
        idGamme: Number(declencheurValues.idGamme),
        idModele: declencheurValues.idModele
          ? Number(declencheurValues.idModele)
          : undefined,
        horizonJours: declencheurValues.horizonJours
          ? Number(declencheurValues.horizonJours)
          : undefined,
        toleranceJours: declencheurValues.toleranceJours
          ? Number(declencheurValues.toleranceJours)
          : undefined,
        periodiciteValeur: declencheurValues.periodiciteValeur
          ? Number(declencheurValues.periodiciteValeur)
          : undefined,
        periodiciteUnite: declencheurValues.periodiciteUnite || undefined,
        nombreJoursPremierLancement:
          declencheurValues.nombreJoursPremierLancement
            ? Number(declencheurValues.nombreJoursPremierLancement)
            : undefined,
        mesureCode: declencheurValues.mesureCode || undefined,
        operateur: declencheurValues.operateur || undefined,
        seuilValeur: declencheurValues.seuilValeur
          ? Number(declencheurValues.seuilValeur)
          : undefined,
        symptomeCode: declencheurValues.symptomeCode || undefined,
        actif: declencheurValues.actif,
      };

      if (editingDeclencheurId) {
        await updatePppDeclencheur(editingDeclencheurId, payload);
      } else {
        await createPppDeclencheur(id, payload);
      }

      resetDeclencheurForm();
      await loadData();
    } catch (err) {
      setDeclencheurError(
        err instanceof Error
          ? err.message
          : editingDeclencheurId
            ? 'Erreur lors de la mise à jour du déclencheur PPP.'
            : 'Erreur lors de la création du déclencheur PPP.',
      );
    } finally {
      setDeclencheurSaving(false);
    }
  }

  async function handleDeleteDeclencheur(idPppDeclencheur: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce déclencheur PPP ?',
    );

    if (!confirmed) return;

    try {
      await deletePppDeclencheur(idPppDeclencheur);

      if (editingDeclencheurId === idPppDeclencheur) {
        resetDeclencheurForm();
      }

      await loadData();
    } catch (err) {
      setDeclencheurError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du déclencheur PPP.',
      );
    }
  }

  return {
    item,
    values,
    loading,
    saving,
    error,
    success,
    setField,
    handleSubmit,
    declencheurValues,
    declencheurSaving,
    declencheurError,
    editingDeclencheurId,
    setDeclencheurField,
    handleCreateOrUpdateDeclencheur,
    handleDeleteDeclencheur,
    startEditDeclencheur,
    resetDeclencheurForm,
  };
}