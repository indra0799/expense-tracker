'use client'

import { createClient } from '@/utils/supabase/client' 
// Note: Adjust the import path above if your supabase client is located elsewhere

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`, 
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Do NOT wrap this in a <form> */}
      <button 
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  )
}