export type TransactionType = 'expense';

export interface Transaction {
    id: string;
    description: string;
    subCategory: string;
    categoryDetail: string;
    descriptionDetail: string;
    category: string;
    amount: number;
    date: string;
    type: TransactionType;
    paymentMode: string;
}
