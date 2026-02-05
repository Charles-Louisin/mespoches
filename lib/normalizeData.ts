/**
 * Utilitaires pour normaliser les données de l'API avant de les sauvegarder dans IndexedDB
 * Les données de l'API peuvent avoir des objets populés (ex: wallet_id = objet Wallet)
 * mais IndexedDB attend juste les IDs (ex: wallet_id = string)
 */

export const normalizeTransaction = (transaction: any): any => {
  return {
    ...transaction,
    wallet_id: typeof transaction.wallet_id === 'object' 
      ? transaction.wallet_id._id 
      : transaction.wallet_id,
    destination_wallet_id: transaction.destination_wallet_id 
      ? (typeof transaction.destination_wallet_id === 'object' 
          ? transaction.destination_wallet_id._id 
          : transaction.destination_wallet_id)
      : undefined,
    category_id: transaction.category_id 
      ? (typeof transaction.category_id === 'object' 
          ? transaction.category_id._id 
          : transaction.category_id)
      : undefined,
  };
};

export const normalizeWallet = (wallet: any): any => {
  // Les wallets n'ont pas de références, pas besoin de normalisation
  return wallet;
};

export const normalizeCategory = (category: any): any => {
  // Les catégories n'ont pas de références, pas besoin de normalisation
  return category;
};
