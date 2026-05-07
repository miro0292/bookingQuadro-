import { getProviders, signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignIn({ providers }){
  const [email, setEmail] = useState('host@quadro.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onOwnerLogin(e) {
    e.preventDefault()
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/owner',
      redirect: false
    })

    if (result?.error) {
      setError('Credenciales invalidas para propietario')
      return
    }

    window.location.href = '/owner'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="p-6 border rounded w-full max-w-md space-y-5">
        <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>

        <form className="space-y-3" onSubmit={onOwnerLogin}>
          <p className="font-medium">Acceso propietario</p>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full px-4 py-2 border rounded bg-black text-white">
            Ingresar como propietario
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="border-t pt-4">
          <p className="font-medium mb-2">Otros accesos</p>
          <div className="flex flex-col gap-2">
            {Object.values(providers || {}).filter((provider) => provider.id !== 'credentials').map(provider => (
              <div key={provider.name}>
                <button onClick={() => signIn(provider.id)} className="px-4 py-2 border rounded w-full">Ingresar con {provider.name}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(){
  const providers = await getProviders()
  return { props: { providers } }
}
