import { useSession, signIn, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!session ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Notes SaaS 🚀</h1>
          <button
            onClick={() => signIn()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Hello, {session.user?.email}
          </h1>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
