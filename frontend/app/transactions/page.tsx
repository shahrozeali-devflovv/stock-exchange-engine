"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/services/transactionService";

type Transaction = {
  id: number;
  stock_id: number;
  transaction_type: string;
  quantity: number;
  price: number;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
  const loadTransactions = async () => {
    try {
      const data = await getTransactions();

      console.log("SUCCESS:", data);

      setTransactions(data);
    } catch (error: any) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("MESSAGE:", error.message);
    }
  };

  loadTransactions();
}, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        Transaction History
      </h1>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">
                Type
              </th>

              <th className="px-4 py-3 text-right">
                Quantity
              </th>

              <th className="px-4 py-3 text-right">
                Price
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-t border-slate-800"
              >
                <td className="px-4 py-3">
                  {tx.transaction_type}
                </td>

                <td className="px-4 py-3 text-right">
                  {tx.quantity}
                </td>

                <td className="px-4 py-3 text-right">
                  ${tx.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}