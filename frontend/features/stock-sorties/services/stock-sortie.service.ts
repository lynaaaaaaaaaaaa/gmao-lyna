import type {
  CreateStockSortieDto,
  StockSortie,
} from '../types/stock-sortie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Erreur serveur.';

    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // rien
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getStockSorties(): Promise<StockSortie[]> {
  const response = await fetch(`${API_URL}/stock/sorties`, {
    cache: 'no-store',
  });

  return handleResponse<StockSortie[]>(response);
}

export async function getStockSortieById(
  idSortieStock: number,
): Promise<StockSortie> {
  const response = await fetch(`${API_URL}/stock/sorties/${idSortieStock}`, {
    cache: 'no-store',
  });

  return handleResponse<StockSortie>(response);
}

export async function createStockSortie(
  dto: CreateStockSortieDto,
) {
  const response = await fetch(`${API_URL}/stock/sorties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  return handleResponse(response);
}