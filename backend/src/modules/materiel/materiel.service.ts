import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaterielDto } from './dto/create-materiel.dto';
import { UpdateMaterielDto } from './dto/update-materiel.dto';
import { ChangeEtatMaterielDto } from './dto/change-etat-materiel.dto';
import { UpdateCycleVieMaterielDto } from './dto/update-cycle-vie-materiel.dto';

const ETATS_INTERVENTION_AUTORISES = ['VALIDE', 'EN_PANNE', 'EN_REVISION'];

const TRANSITIONS_MATERIEL_AUTORISEES: Record<string, string[]> = {
  EN_PREPARATION: ['ATTENTE_VALIDATION', 'VALIDE', 'ANNULE'],
  ATTENTE_VALIDATION: ['VALIDE', 'ANNULE'],

  VALIDE: ['EN_PANNE', 'EN_REVISION', 'AU_REBUT'],
  EN_PANNE: ['EN_REVISION', 'VALIDE', 'AU_REBUT'],
  EN_REVISION: ['EN_PANNE', 'VALIDE', 'AU_REBUT'],

  AU_REBUT: ['VALIDE', 'ANNULE'],
  ANNULE: [],
};

@Injectable()
export class MaterielService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    modele: true,
    etat_materiel: true,
    type_materiel: true,
    point_structure: true,
    materielParent: true,
    sousMateriels: true,
    points_mesure: true,
    plan_preventif: true,
    intervention: true,
  } as const;

  async create(createDto: CreateMaterielDto) {
    if (createDto.code) {
      const existing = await this.prisma.materiel.findFirst({
        where: {
          code: createDto.code.trim(),
        },
      });

      if (existing) {
        throw new BadRequestException('Un matériel avec ce code existe déjà.');
      }
    }

    if (createDto.numeroSerie) {
      const existingNumeroSerie = await this.prisma.materiel.findFirst({
        where: {
          numeroSerie: createDto.numeroSerie.trim(),
        },
      });

      if (existingNumeroSerie) {
        throw new BadRequestException(
          'Un matériel avec ce numéro de série existe déjà.',
        );
      }
    }

    if (createDto.gereEnStock === true && createDto.dateDernierInventaire) {
      throw new BadRequestException(
        "Le dernier inventaire d'un matériel géré en stock doit être mis à jour depuis le module stock.",
      );
    }

    return this.prisma.materiel.create({
      data: {
        code: createDto.code?.trim() || null,
        libelle: createDto.libelle?.trim() || null,
        numeroSerie: createDto.numeroSerie?.trim() || null,

        dateMiseService: createDto.dateMiseService
          ? new Date(createDto.dateMiseService)
          : null,

        dateDernierInventaire: createDto.dateDernierInventaire
          ? new Date(createDto.dateDernierInventaire)
          : null,

        dateRebut: createDto.dateRebut ? new Date(createDto.dateRebut) : null,
        motifRebut: createDto.motifRebut?.trim() || null,

        gereEnStock: createDto.gereEnStock ?? false,
        positionActuelle: createDto.positionActuelle?.trim() || null,

        idModele: createDto.idModele ?? null,
        idEtat: createDto.idEtat ?? null,
        idType: createDto.idType ?? null,
        idPointStructure: createDto.idPointStructure ?? null,
        idMaterielParent: createDto.idMaterielParent ?? null,
        idLigneEntreeStock: createDto.idLigneEntreeStock ?? null,

        actif: createDto.actif ?? true,
      },
      include: this.includeRelations,
    });
  }

  async findAll() {
    return this.prisma.materiel.findMany({
      orderBy: {
        idMateriel: 'desc',
      },
      include: {
        modele: true,
        etat_materiel: true,
        type_materiel: true,
        point_structure: true,
      },
    });
  }

  async findOne(id: number) {
    const materiel = await this.prisma.materiel.findUnique({
      where: {
        idMateriel: id,
      },
      include: this.includeRelations,
    });

    if (!materiel) {
      throw new NotFoundException('Matériel introuvable.');
    }

    return materiel;
  }

  async update(id: number, updateDto: UpdateMaterielDto) {
    const materiel = await this.findOne(id);

    if (updateDto.code) {
      const existing = await this.prisma.materiel.findFirst({
        where: {
          code: updateDto.code.trim(),
          NOT: {
            idMateriel: id,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Un autre matériel utilise déjà ce code.');
      }
    }

    if (updateDto.numeroSerie) {
      const existingNumeroSerie = await this.prisma.materiel.findFirst({
        where: {
          numeroSerie: updateDto.numeroSerie.trim(),
          NOT: {
            idMateriel: id,
          },
        },
      });

      if (existingNumeroSerie) {
        throw new BadRequestException(
          'Un autre matériel utilise déjà ce numéro de série.',
        );
      }
    }

    if (
      materiel.gereEnStock === true &&
      updateDto.dateDernierInventaire !== undefined
    ) {
      throw new BadRequestException(
        "Le dernier inventaire d'un matériel géré en stock doit être modifié depuis le module stock.",
      );
    }

    return this.prisma.materiel.update({
      where: {
        idMateriel: id,
      },
      data: {
        ...(updateDto.code !== undefined && {
          code: updateDto.code?.trim() || null,
        }),

        ...(updateDto.libelle !== undefined && {
          libelle: updateDto.libelle?.trim() || null,
        }),

        ...(updateDto.numeroSerie !== undefined && {
          numeroSerie: updateDto.numeroSerie?.trim() || null,
        }),

        ...(updateDto.dateMiseService !== undefined && {
          dateMiseService: updateDto.dateMiseService
            ? new Date(updateDto.dateMiseService)
            : null,
        }),

        ...(updateDto.dateDernierInventaire !== undefined && {
          dateDernierInventaire: updateDto.dateDernierInventaire
            ? new Date(updateDto.dateDernierInventaire)
            : null,
        }),

        ...(updateDto.dateRebut !== undefined && {
          dateRebut: updateDto.dateRebut ? new Date(updateDto.dateRebut) : null,
        }),

        ...(updateDto.motifRebut !== undefined && {
          motifRebut: updateDto.motifRebut?.trim() || null,
        }),

        ...(updateDto.gereEnStock !== undefined && {
          gereEnStock: updateDto.gereEnStock,
        }),

        ...(updateDto.positionActuelle !== undefined && {
          positionActuelle: updateDto.positionActuelle?.trim() || null,
        }),

        ...(updateDto.idModele !== undefined && {
          idModele: updateDto.idModele ?? null,
        }),

        ...(updateDto.idType !== undefined && {
          idType: updateDto.idType ?? null,
        }),

        ...(updateDto.idPointStructure !== undefined && {
          idPointStructure: updateDto.idPointStructure ?? null,
        }),

        ...(updateDto.idMaterielParent !== undefined && {
          idMaterielParent: updateDto.idMaterielParent ?? null,
        }),

        ...(updateDto.idLigneEntreeStock !== undefined && {
          idLigneEntreeStock: updateDto.idLigneEntreeStock ?? null,
        }),

        ...(updateDto.actif !== undefined && {
          actif: updateDto.actif,
        }),
      },
      include: this.includeRelations,
    });
  }

  async updateCycleVie(id: number, dto: UpdateCycleVieMaterielDto) {
    const materiel = await this.findOne(id);

    if (
      materiel.gereEnStock === true &&
      dto.dateDernierInventaire !== undefined
    ) {
      throw new BadRequestException(
        "Ce matériel est géré en stock. Son dernier inventaire doit être modifié depuis le module stock.",
      );
    }

    const data: any = {};

    if (dto.idEtat !== undefined) {
      const nouvelEtat = await this.findEtatOrFail(dto.idEtat);

      const ancienCodeEtat = materiel.etat_materiel?.code ?? null;
      const nouveauCodeEtat = this.getCodeEtat(nouvelEtat);

      this.verifierTransitionEtat(ancienCodeEtat, nouveauCodeEtat);

      data.idEtat = dto.idEtat;

      if (nouveauCodeEtat === 'AU_REBUT') {
        data.positionActuelle = 'AU_REBUT';
        data.dateRebut = dto.dateRebut ? new Date(dto.dateRebut) : new Date();
      }

      if (nouveauCodeEtat === 'ANNULE') {
        data.actif = false;
      }

      if (nouveauCodeEtat === 'VALIDE') {
        data.actif = true;
      }
    }

    if (dto.dateMiseService !== undefined) {
      data.dateMiseService = dto.dateMiseService
        ? new Date(dto.dateMiseService)
        : null;
    }

    if (dto.dateDernierInventaire !== undefined) {
      data.dateDernierInventaire = dto.dateDernierInventaire
        ? new Date(dto.dateDernierInventaire)
        : null;
    }

    if (dto.dateRebut !== undefined) {
      data.dateRebut = dto.dateRebut ? new Date(dto.dateRebut) : null;
    }

    if (dto.motifRebut !== undefined) {
      data.motifRebut = dto.motifRebut?.trim() || null;
    }

    return this.prisma.materiel.update({
      where: {
        idMateriel: id,
      },
      data,
      include: this.includeRelations,
    });
  }

  async changerEtatMateriel(id: number, dto: ChangeEtatMaterielDto) {
    const materiel = await this.findOne(id);
    const nouvelEtat = await this.findEtatOrFail(dto.idEtat);

    const ancienCodeEtat = materiel.etat_materiel?.code ?? null;
    const nouveauCodeEtat = this.getCodeEtat(nouvelEtat);

    this.verifierTransitionEtat(ancienCodeEtat, nouveauCodeEtat);

    const data: any = {
      idEtat: dto.idEtat,
    };

    if (nouveauCodeEtat === 'AU_REBUT') {
      data.positionActuelle = 'AU_REBUT';
      data.dateRebut = new Date();
      data.motifRebut = dto.motif?.trim() || null;
    }

    if (nouveauCodeEtat === 'ANNULE') {
      data.actif = false;
    }

    if (nouveauCodeEtat === 'VALIDE') {
      data.actif = true;
    }

    return this.prisma.materiel.update({
      where: {
        idMateriel: id,
      },
      data,
      include: this.includeRelations,
    });
  }

  async verifierInterventionPossible(id: number) {
    const materiel = await this.findOne(id);
    const codeEtat = materiel.etat_materiel?.code;

    if (!codeEtat) {
      throw new BadRequestException(
        "L'état du matériel n'a pas de code. Vérifie la table etat_materiel.",
      );
    }

    if (!ETATS_INTERVENTION_AUTORISES.includes(codeEtat)) {
      throw new BadRequestException(
        "Ce matériel ne peut pas être ciblé par une intervention. Il doit être Validé, En panne ou En révision.",
      );
    }

    return {
      possible: true,
      message: 'Le matériel peut être ciblé par une intervention.',
      materiel,
    };
  }

  async updateDernierInventaireDepuisStock(
    idMateriel: number,
    dateInventaire: Date,
  ) {
    const materiel = await this.findOne(idMateriel);

    if (materiel.gereEnStock !== true) {
      throw new BadRequestException(
        "Ce matériel n'est pas géré en stock. Son inventaire doit être modifié manuellement depuis la fiche matériel.",
      );
    }

    return this.prisma.materiel.update({
      where: {
        idMateriel,
      },
      data: {
        dateDernierInventaire: dateInventaire,
      },
      include: this.includeRelations,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.materiel.delete({
      where: {
        idMateriel: id,
      },
    });
  }

  private async findEtatOrFail(idEtat: number) {
    const etat = await this.prisma.etat_materiel.findUnique({
      where: {
        idEtat,
      },
    });

    if (!etat) {
      throw new NotFoundException('État matériel introuvable.');
    }

    return etat;
  }

  private getCodeEtat(etat: { code: string | null }) {
    if (!etat.code) {
      throw new BadRequestException(
        "Le code de l'état matériel n'est pas renseigné dans la table etat_materiel.",
      );
    }

    return etat.code;
  }

  private verifierTransitionEtat(
    ancienCodeEtat: string | null,
    nouveauCodeEtat: string,
  ) {
    if (!ancienCodeEtat) {
      return;
    }

    if (ancienCodeEtat === nouveauCodeEtat) {
      return;
    }

    const transitionsPossibles =
      TRANSITIONS_MATERIEL_AUTORISEES[ancienCodeEtat] ?? [];

    if (!transitionsPossibles.includes(nouveauCodeEtat)) {
      throw new BadRequestException(
        `Transition non autorisée : ${ancienCodeEtat} → ${nouveauCodeEtat}.`,
      );
    }
  }
}