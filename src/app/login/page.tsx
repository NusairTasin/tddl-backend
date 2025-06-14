'use client'
import { useEffect, useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    router.prefetch('/dashboard/home')
  }, [])

  const [loading, setLoading] = useState(false)
  const handleLogin = () => {
    setLoading(true)
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <span className="text-lg md:text-xl lg:text-2xl mb-5 text-green-700">{loading ? 'Logging in...' : 'Login Page'}</span>
      <form className='flex flex-col gap-4 items-center justify-center'>
        <label className='text-gray-500 justify font-bold' htmlFor="email">Email:</label>
        <input className='border border-green-700 rounded-md p-2 hover:border-green-900' id="email" name="email" type="email" required />
        <label className='text-gray-500 font-bold' htmlFor="password">Password:</label>
        <input className='border border-green-700 rounded-md p-2 hover:border-green-900' id="password" name="password" type="password" required /> 
        <div className='flex flex-col gap-2'>
          <button onClick={handleLogin} formAction={login} className='bg-green-800 text-white p-2 mt-3 rounded-md hover:bg-green-900 transition-all duration-300 min-w-[100px] min-h-[40px]'>Log in</button>
        </div>
      </form>
    </div>
  )
}