'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      title,
      amount,
      type,
      category,
      date,
    })

  if (error) {
    console.error('Error adding transaction:', error)
    return { error: error.message }
  }

  // Refresh the dashboard data
  revalidatePath('/dashboard')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  // Supabase RLS ensures the user can only delete their own transactions
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { error: error.message }
  }

  // Refresh the dashboard data
  revalidatePath('/dashboard')
}