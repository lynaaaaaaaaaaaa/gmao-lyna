import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateModeleDto } from './dto/create-modele.dto';
import { UpdateModeleDto } from './dto/update-modele.dto';

@Injectable()
export class ModeleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.modele.findMany({
      include: {
        famille: true,
        etat_modele: true,
        type_equipement: true,
        fabricant: true,
        marque: true,
      },
      orderBy: {
        idModele: 'desc',
      },
    });
  }

  async findOne(idModele: number) {
    const modele = await this.prisma.modele.findUnique({
      where: { idModele },
      include: {
        famille: true,
        etat_modele: true,
        type_equipement: true,
        fabricant: true,
        marque: true,
        gamme: true,
        materiel: true,
        articles: true,
        plan_preventif_predefini: true,
      },
    });

    if (!modele) {
      throw new NotFoundException('Modèle introuvable.');
    }

    return modele;
  }

  async create(createModeleDto: CreateModeleDto) {
    const code = this.cleanText(createModeleDto.code);
    const libelle = this.cleanText(createModeleDto.libelle);
    const commentaire = this.cleanText(createModeleDto.commentaire);

    if (code) {
      const existingCode = await this.prisma.modele.findFirst({
        where: { code },
      });

      if (existingCode) {
        throw new BadRequestException('Ce code modèle existe déjà.');
      }
    }

    await this.validateFamille(createModeleDto.idFamille);
    await this.validateEtat(createModeleDto.idEtat);
    await this.validateTypeEquipement(createModeleDto.idTypeEquipement);
    await this.validateFabricant(createModeleDto.idFabricant);
    await this.validateMarque(createModeleDto.idMarque);

    return this.prisma.modele.create({
      data: {
        code,
        libelle,
        idFamille: createModeleDto.idFamille ?? null,
        idEtat: createModeleDto.idEtat,

        idTypeEquipement: createModeleDto.idTypeEquipement ?? null,
        idFabricant: createModeleDto.idFabricant ?? null,
        idMarque: createModeleDto.idMarque ?? null,

        commentaire,
        dureeVie: createModeleDto.dureeVie ?? null,
        budget: createModeleDto.budget ?? null,
      },
      include: {
        famille: true,
        etat_modele: true,
        type_equipement: true,
        fabricant: true,
        marque: true,
      },
    });
  }

  async update(idModele: number, updateModeleDto: UpdateModeleDto) {
    const existingModele = await this.prisma.modele.findUnique({
      where: { idModele },
    });

    if (!existingModele) {
      throw new NotFoundException('Modèle introuvable.');
    }

    const code =
      updateModeleDto.code !== undefined
        ? this.cleanText(updateModeleDto.code)
        : undefined;

    const libelle =
      updateModeleDto.libelle !== undefined
        ? this.cleanText(updateModeleDto.libelle)
        : undefined;

    const commentaire =
      updateModeleDto.commentaire !== undefined
        ? this.cleanText(updateModeleDto.commentaire)
        : undefined;

    if (code && code !== existingModele.code) {
      const existingCode = await this.prisma.modele.findFirst({
        where: {
          code,
          idModele: {
            not: idModele,
          },
        },
      });

      if (existingCode) {
        throw new BadRequestException('Ce code modèle existe déjà.');
      }
    }

    if (updateModeleDto.idFamille !== undefined) {
      await this.validateFamille(updateModeleDto.idFamille);
    }

    if (updateModeleDto.idEtat !== undefined) {
      await this.validateEtat(updateModeleDto.idEtat);
    }

    if (updateModeleDto.idTypeEquipement !== undefined) {
      await this.validateTypeEquipement(updateModeleDto.idTypeEquipement);
    }

    if (updateModeleDto.idFabricant !== undefined) {
      await this.validateFabricant(updateModeleDto.idFabricant);
    }

    if (updateModeleDto.idMarque !== undefined) {
      await this.validateMarque(updateModeleDto.idMarque);
    }

    return this.prisma.modele.update({
      where: { idModele },
      data: {
        code,
        libelle,

        idFamille: updateModeleDto.idFamille,
        idEtat: updateModeleDto.idEtat,

        idTypeEquipement: updateModeleDto.idTypeEquipement,
        idFabricant: updateModeleDto.idFabricant,
        idMarque: updateModeleDto.idMarque,

        commentaire,
        dureeVie: updateModeleDto.dureeVie,
        budget: updateModeleDto.budget,
      },
      include: {
        famille: true,
        etat_modele: true,
        type_equipement: true,
        fabricant: true,
        marque: true,
      },
    });
  }

  async remove(idModele: number) {
    const existingModele = await this.prisma.modele.findUnique({
      where: { idModele },
      include: {
        _count: {
          select: {
            gamme: true,
            gamme_operation: true,
            materiel: true,
            articles: true,
            plan_preventif_declencheur: true,
            plan_preventif_predefini: true,
            ppp_declencheur: true,
          },
        },
      },
    });

    if (!existingModele) {
      throw new NotFoundException('Modèle introuvable.');
    }

    const isUsed =
      existingModele._count.gamme > 0 ||
      existingModele._count.gamme_operation > 0 ||
      existingModele._count.materiel > 0 ||
      existingModele._count.articles > 0 ||
      existingModele._count.plan_preventif_declencheur > 0 ||
      existingModele._count.plan_preventif_predefini > 0 ||
      existingModele._count.ppp_declencheur > 0;

    if (isUsed) {
      throw new BadRequestException(
        'Impossible de supprimer ce modèle car il est déjà utilisé dans le système.',
      );
    }

    return this.prisma.modele.delete({
      where: { idModele },
    });
  }

  private cleanText(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }

    const cleaned = value.trim();

    return cleaned.length > 0 ? cleaned : null;
  }

  private async validateFamille(idFamille?: number | null) {
    if (idFamille === undefined || idFamille === null) {
      return;
    }

    const famille = await this.prisma.famille.findUnique({
      where: { idFamille },
    });

    if (!famille) {
      throw new BadRequestException('La famille sélectionnée est introuvable.');
    }
  }

  private async validateEtat(idEtat?: number | null) {
    if (idEtat === undefined || idEtat === null) {
      throw new BadRequestException("L'état du modèle est obligatoire.");
    }

    const etat = await this.prisma.etat_modele.findUnique({
      where: { idEtat },
    });

    if (!etat) {
      throw new BadRequestException("L'état du modèle est introuvable.");
    }
  }

  private async validateTypeEquipement(idTypeEquipement?: number | null) {
    if (idTypeEquipement === undefined || idTypeEquipement === null) {
      return;
    }

    const typeEquipement = await this.prisma.type_equipement.findUnique({
      where: { idTypeEquipement },
    });

    if (!typeEquipement) {
      throw new BadRequestException(
        "Le type d'équipement sélectionné est introuvable.",
      );
    }
  }

  private async validateFabricant(idFabricant?: number | null) {
    if (idFabricant === undefined || idFabricant === null) {
      return;
    }

    const fabricant = await this.prisma.fabricant.findUnique({
      where: { idFabricant },
    });

    if (!fabricant) {
      throw new BadRequestException('Le fabricant sélectionné est introuvable.');
    }
  }

  private async validateMarque(idMarque?: number | null) {
    if (idMarque === undefined || idMarque === null) {
      return;
    }

    const marque = await this.prisma.marque.findUnique({
      where: { idMarque },
    });

    if (!marque) {
      throw new BadRequestException('La marque sélectionnée est introuvable.');
    }
  }
}