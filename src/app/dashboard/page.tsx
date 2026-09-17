import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { addTransaction, deleteTransaction } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  const totalExpenses = transactions?.reduce((acc, curr) => {
    return curr.type === 'expense' ? acc + Number(curr.amount) : acc
  }, 0) || 0

  const totalIncome = transactions?.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc
  }, 0) || 0

  const balance = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Sign Out
            </button>
          </form>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Balance</h3>
            <p className={`mt-2 text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{balance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <details className="group rounded-lg bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Add Transaction</h2>
            <span className="relative ml-1.5 h-5 w-5 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </summary>
          <div className="px-6 py-4">
            {/* FIX: Passed Server Action directly to action attribute */}
            <form action={addTransaction} className="grid gap-4 md:grid-cols-2">
              <input type="text" name="title" placeholder="Title (e.g. Groceries)" required className="rounded border p-2" />
              <input type="number" name="amount" placeholder="Amount (₹)" step="0.01" required className="rounded border p-2" />
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded border p-2" />
              <select name="type" className="rounded border p-2 bg-white">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input type="text" name="category" placeholder="Category (e.g. Food, Salary)" required className="rounded border p-2 md:col-span-2" />
              <button type="submit" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 md:col-span-2">
                Add Transaction
              </button>
            </form>
          </div>
        </details>

        {/* Transaction List */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          </div>
          <ul className="divide-y">
            {(!transactions || transactions.length === 0) ? (
              <li className="p-6 text-center text-gray-500">No transactions found.</li>
            ) : (
              transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <p className="text-sm text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <p className={`font-medium ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {t.type === 'expense' ? '-' : '+'}₹{Number(t.amount).toFixed(2)}
                    </p>
                    {/* FIX: Passed Server Action directly to action attribute */}
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-gray-400 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}