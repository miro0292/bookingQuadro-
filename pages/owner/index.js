import { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

function ListingEditor({ listing, onSaved }) {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    address: listing.address,
    city: listing.city,
    price: listing.price,
    images: (listing.images || []).map((i) => i.path).join(', ')
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const imagePaths = form.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const res = await fetch(`/api/listings/${listing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, images: imagePaths })
    })

    const payload = await res.json()
    if (!res.ok) {
      setMsg(payload.error || 'No se pudo actualizar')
      setSaving(false)
      return
    }

    setMsg('Actualizado correctamente')
    setSaving(false)
    onSaved()
  }

  return (
    <form className="surface-card rounded-lg p-4 space-y-3" onSubmit={onSave}>
      <h3 className="font-semibold">Apartamento #{listing.id}</h3>
      <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titulo" />
      <textarea className="w-full border rounded px-3 py-2 bg-transparent" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripcion" />
      <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Direccion" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input className="w-full border rounded px-3 py-2 bg-transparent" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ciudad" />
        <input className="w-full border rounded px-3 py-2 bg-transparent" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value || 0) })} placeholder="Precio" />
      </div>
      <textarea
        className="w-full border rounded px-3 py-2 bg-transparent"
        rows={2}
        value={form.images}
        onChange={(e) => setForm({ ...form, images: e.target.value })}
        placeholder="Rutas de imagen separadas por coma. Ej: /listings/list1.png, /listings/list2.png"
      />
      <div className="flex items-center gap-3">
        <button disabled={saving} className="px-4 py-2 rounded bg-black text-white">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        {msg ? <span className="text-sm muted-text">{msg}</span> : null}
      </div>
    </form>
  )
}

export default function OwnerPage() {
  const { data: session, status } = useSession()
  const isHost = session?.user?.role === 'host'
  const { data, mutate } = useSWR(isHost ? '/api/listings' : null, fetcher, { fallbackData: [] })

  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    address: '',
    city: 'Bogota',
    price: 100000,
    images: '/listings/list1.png, /listings/list2.png'
  })
  const [createMsg, setCreateMsg] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') signIn(undefined, { callbackUrl: '/owner' })
  }, [status])

  const ownerName = useMemo(() => session?.user?.name || session?.user?.email || 'Propietario', [session])

  async function onCreate(e) {
    e.preventDefault()
    setCreating(true)
    setCreateMsg('')

    const imagePaths = newForm.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, images: imagePaths })
    })
    const payload = await res.json()

    if (!res.ok) {
      setCreateMsg(payload.error || 'No se pudo crear el apartamento')
      setCreating(false)
      return
    }

    setCreateMsg('Apartamento creado')
    setCreating(false)
    setNewForm({ ...newForm, title: '', description: '' })
    mutate()
  }

  if (status === 'loading') return <div className="p-6">Cargando panel...</div>

  if (!isHost) {
    return (
      <div className="min-h-screen p-6 pt-20">
        <div className="max-w-xl mx-auto surface-card rounded-lg p-6">
          <h1 className="text-2xl font-semibold">Panel propietario</h1>
          <p className="muted-text mt-2">Debes iniciar sesion como propietario para editar apartamentos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pt-20">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel del propietario</h1>
            <p className="muted-text">Sesion iniciada como {ownerName}</p>
          </div>
          <button className="px-4 py-2 border rounded" onClick={() => signOut({ callbackUrl: '/' })}>Cerrar sesion</button>
        </div>

        <form className="surface-card rounded-lg p-4 space-y-3" onSubmit={onCreate}>
          <h2 className="text-xl font-semibold">Crear apartamento</h2>
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="Titulo" />
          <textarea className="w-full border rounded px-3 py-2 bg-transparent" rows={3} value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} placeholder="Descripcion" />
          <input className="w-full border rounded px-3 py-2 bg-transparent" value={newForm.address} onChange={(e) => setNewForm({ ...newForm, address: e.target.value })} placeholder="Direccion" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="w-full border rounded px-3 py-2 bg-transparent" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })} placeholder="Ciudad" />
            <input className="w-full border rounded px-3 py-2 bg-transparent" type="number" value={newForm.price} onChange={(e) => setNewForm({ ...newForm, price: Number(e.target.value || 0) })} placeholder="Precio" />
          </div>
          <textarea className="w-full border rounded px-3 py-2 bg-transparent" rows={2} value={newForm.images} onChange={(e) => setNewForm({ ...newForm, images: e.target.value })} placeholder="/listings/list1.png, /listings/list2.png" />
          <div className="flex items-center gap-3">
            <button disabled={creating} className="px-4 py-2 rounded bg-black text-white">{creating ? 'Creando...' : 'Crear apartamento'}</button>
            {createMsg ? <span className="text-sm muted-text">{createMsg}</span> : null}
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Editar apartamentos</h2>
          {data.map((listing) => (
            <ListingEditor key={listing.id} listing={listing} onSaved={mutate} />
          ))}
        </section>
      </div>
    </div>
  )
}
