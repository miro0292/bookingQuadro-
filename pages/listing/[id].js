import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'

const fetcher = (url) => fetch(url).then(r => r.json())

function normalizeDate(dateLike) {
  const d = new Date(dateLike)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatISODate(dateLike) {
  const d = normalizeDate(dateLike)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function nightsBetween(start, end) {
  if (!start || !end) return 0
  const s = normalizeDate(start)
  const e = normalizeDate(end)
  const diff = e.getTime() - s.getTime()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
}

function isDateBooked(day, bookings) {
  return bookings.some((b) => {
    const start = normalizeDate(b.startDate)
    const end = normalizeDate(b.endDate)
    return day >= start && day < end
  })
}

function buildMockReviews(listingId) {
  const names = ['Ana Maria', 'Diana', 'Carolina', 'Fernando', 'Juan', 'Myriam', 'Camila', 'Andres']
  const cities = ['Bogota, Colombia', 'Medellin, Colombia', 'Cali, Colombia', 'Barranquilla, Colombia']
  const texts = [
    'Muy comoda la habitacion y excelente ubicacion. Volveriamos sin duda.',
    'Todo muy limpio, facil llegada y buena comunicacion con el anfitrion.',
    'La vista y la zona comun del edificio son excelentes para descansar.',
    'Buena relacion calidad/precio. El proceso de reserva fue sencillo.',
    'Ideal para viajes cortos de trabajo o descanso, muy recomendado.',
    'Comodidades completas y seguridad en el edificio. Muy buena experiencia.'
  ]

  return Array.from({ length: 6 }).map((_, idx) => ({
    id: idx + 1,
    name: names[(listingId + idx) % names.length],
    city: cities[(listingId + idx) % cities.length],
    rating: idx % 3 === 0 ? 4 : 5,
    text: texts[(listingId + idx) % texts.length],
    dateText: idx % 2 === 0 ? 'hace 2 semanas' : 'enero de 2026'
  }))
}

function Stars({ value }) {
  return <span>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

export default function ListingPage(){
  const router = useRouter()
  const { id } = router.query
  const { data: session, status: sessionStatus } = useSession()
  const { data, mutate } = useSWR(id ? `/api/listings/${id}` : null, fetcher)
  const [arrival, setArrival] = useState('')
  const [departure, setDeparture] = useState('')
  const [guests, setGuests] = useState(1)
  const [busy, setBusy] = useState(false)
  const [payBusy, setPayBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [openImageAccordion, setOpenImageAccordion] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const listingId = Number(id) || 0
  const reviews = useMemo(() => buildMockReviews(listingId), [listingId])
  const avgScore = useMemo(() => {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.length).toFixed(2)
  }, [reviews])

  useEffect(() => {
    setOpenImageAccordion(0)
    setActiveImageIndex(0)
    setModalImageIndex(0)
    setIsGalleryModalOpen(false)
  }, [listingId])

  useEffect(() => {
    if (!isGalleryModalOpen) return

    const onKeydown = (event) => {
      if (event.key === 'Escape') setIsGalleryModalOpen(false)
      if (event.key === 'ArrowRight') setModalImageIndex((prev) => prev + 1)
      if (event.key === 'ArrowLeft') setModalImageIndex((prev) => prev - 1)
    }

    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [isGalleryModalOpen])

  if(!data) return <div className="p-6 pt-20">Cargando...</div>

  const images = data.images || []
  const safeActiveIndex = activeImageIndex >= 0 && activeImageIndex < images.length ? activeImageIndex : 0
  const heroImage = images[safeActiveIndex]?.path || '/placeholder.jpg'
  const safeModalIndex = ((modalImageIndex % Math.max(images.length, 1)) + Math.max(images.length, 1)) % Math.max(images.length, 1)
  const modalImage = images[safeModalIndex]?.path || heroImage
  const bookings = data.bookings || []
  const nights = nightsBetween(arrival, departure)
  const total = nights * data.price
  const nightsText = nights === 1 ? '1 noche' : `${nights} noches`
  const amenities = [
    { icon: '🏆', title: 'En el 10% de alojamientos mejor valorados', desc: 'Segun valoraciones, reseñas y confiabilidad de los huespedes.' },
    { icon: '🔐', title: 'Llegada autonoma', desc: 'Ingreso sencillo con instrucciones de check-in y acceso al edificio.' },
    { icon: '🏋️', title: 'Comodidades del edificio', desc: 'Gimnasio, lobby, vigilancia, ascensor y zonas comunes modernas.' },
    { icon: '🛜', title: 'WiFi y espacio para trabajar', desc: 'Conexion estable para trabajo remoto y videollamadas.' }
  ]

  const firstGridDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
  firstGridDay.setDate(firstGridDay.getDate() - firstGridDay.getDay())
  const gridDays = Array.from({ length: 42 }).map((_, index) => {
    const d = new Date(firstGridDay)
    d.setDate(firstGridDay.getDate() + index)
    return d
  })

  async function handleReserve(e) {
    e.preventDefault()
    setMessage('')

    if (!session?.user) {
      setMessage('Debes iniciar sesion para solicitar una reserva.')
      return
    }

    if (!arrival || !departure) {
      setMessage('Selecciona fecha de llegada y salida.')
      return
    }
    if (normalizeDate(arrival) >= normalizeDate(departure)) {
      setMessage('La salida debe ser posterior a la llegada.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: data.id,
          startDate: arrival,
          endDate: departure,
          total
        })
      })

      const payload = await res.json()
      if (!res.ok) {
        setMessage(payload.error || 'No fue posible reservar en este momento.')
        return
      }

      setMessage('Reserva solicitada con exito. Te contactaremos para confirmar.')
      await mutate()
    } catch (err) {
      setMessage('Error de conexion al solicitar la reserva.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCheckout() {
    setMessage('')
    if (!session?.user) {
      setMessage('Inicia sesion antes de continuar con el pago.')
      return
    }
    if (!arrival || !departure || nights <= 0) {
      setMessage('Selecciona fechas validas antes de pagar.')
      return
    }

    setPayBusy(true)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: data.id,
          listingTitle: data.title,
          price: data.price,
          nights,
          guests,
          startDate: arrival,
          endDate: departure
        })
      })

      const payload = await res.json()
      if (!res.ok || !payload.url) {
        setMessage(payload.error || 'No se pudo iniciar el pago.')
        return
      }

      window.location.href = payload.url
    } catch (err) {
      setMessage('Error de conexion al iniciar pago.')
    } finally {
      setPayBusy(false)
    }
  }

  const mapQuery = encodeURIComponent(`${data.address}, ${data.city}`)

  return (
    <div className="min-h-screen p-6 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="muted-text mt-1">{data.city} - {data.address}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-8">
            <section className="surface-card rounded-xl p-4">
              <img src={heroImage} className="w-full h-96 object-cover rounded-lg" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="muted-text text-sm">Galeria del apartamento</p>
                <button
                  type="button"
                  className="surface-card px-3 py-2 rounded text-sm font-medium"
                  onClick={() => {
                    setModalImageIndex(safeActiveIndex)
                    setIsGalleryModalOpen(true)
                  }}
                >
                  Ver todas las fotos
                </button>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {images.map((im, i) => {
                  const isSelected = i === safeActiveIndex
                  return (
                    <button
                      key={`thumb-${im.id || i}`}
                      type="button"
                      className={`shrink-0 rounded-lg overflow-hidden border-2 ${isSelected ? 'border-yellow-500' : 'border-transparent'}`}
                      onClick={() => {
                        setActiveImageIndex(i)
                        setOpenImageAccordion(i)
                      }}
                    >
                      <img src={im.path} className="w-24 h-16 object-cover" />
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2">
                {images.map((im, i) => {
                  const isOpen = openImageAccordion === i
                  return (
                    <div key={im.id || i} className="surface-card rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                        onClick={() => {
                          setOpenImageAccordion(isOpen ? -1 : i)
                          setActiveImageIndex(i)
                        }}
                      >
                        <span className="font-medium">Foto {i + 1} del apartamento</span>
                        <span className="muted-text">{isOpen ? 'Ocultar' : 'Ver'}</span>
                      </button>
                      {isOpen ? (
                        <div className="px-4 pb-4">
                          <img src={im.path} className="w-full h-52 object-cover rounded" />
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="surface-card rounded-xl p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-3xl">🏅</span>
                <div>
                  <h2 className="text-2xl font-bold">{avgScore} Favorito entre huespedes</h2>
                  <p className="muted-text">Calificacion basada en opiniones verificadas (demo aleatoria).</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                <div className="surface-card rounded p-3">
                  <p className="font-semibold">Limpieza</p>
                  <p className="text-xl font-bold">5.0</p>
                </div>
                <div className="surface-card rounded p-3">
                  <p className="font-semibold">Exactitud</p>
                  <p className="text-xl font-bold">4.9</p>
                </div>
                <div className="surface-card rounded p-3">
                  <p className="font-semibold">Comunicacion</p>
                  <p className="text-xl font-bold">5.0</p>
                </div>
                <div className="surface-card rounded p-3">
                  <p className="font-semibold">Ubicacion</p>
                  <p className="text-xl font-bold">4.9</p>
                </div>
              </div>
            </section>

            <section className="surface-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4">Beneficios y comodidades</h3>
              <div className="space-y-4">
                {amenities.map((a) => (
                  <div key={a.title} className="flex gap-3">
                    <div className="text-2xl">{a.icon}</div>
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      <p className="muted-text">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4">Calendario de disponibilidad</h3>
              <div className="flex items-center justify-between mb-4">
                <button
                  className="surface-card px-3 py-2 rounded"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                >
                  Mes anterior
                </button>
                <p className="font-semibold">
                  {monthCursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                </p>
                <button
                  className="surface-card px-3 py-2 rounded"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                >
                  Mes siguiente
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm muted-text mb-2">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {gridDays.map((day) => {
                  const inCurrentMonth = day.getMonth() === monthCursor.getMonth()
                  const booked = isDateBooked(day, bookings)
                  const dateCode = formatISODate(day)
                  return (
                    <div
                      key={dateCode}
                      className={`rounded border px-2 py-2 ${booked ? 'bg-red-100 border-red-300 text-red-700' : 'surface-card'} ${!inCurrentMonth ? 'opacity-50' : ''}`}
                    >
                      {day.getDate()}
                    </div>
                  )
                })}
              </div>
              <p className="muted-text text-sm mt-3">Rojo: no disponible. Gris/tema: disponible.</p>
            </section>

            <section className="surface-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4">Comentarios y opiniones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map((r) => (
                  <article key={r.id} className="surface-card rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="muted-text text-sm">{r.city}</p>
                      </div>
                      <span className="font-semibold"><Stars value={r.rating} /></span>
                    </div>
                    <p className="text-sm mt-2 muted-text">{r.dateText}</p>
                    <p className="mt-3">{r.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="surface-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4">Ubicacion</h3>
              <p className="muted-text mb-3">{data.address}, {data.city}</p>
              <div className="rounded overflow-hidden border" style={{ height: '320px' }}>
                <iframe
                  title="Mapa del alojamiento"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          </main>

          <aside className="lg:col-span-1">
            <div className="surface-card rounded-xl p-5 lg:sticky lg:top-24">
              <p className="text-2xl font-bold">COP {data.price} <span className="text-sm font-normal muted-text">/ noche</span></p>

              <div className="mt-3 surface-card rounded p-3">
                <p className="text-sm font-semibold">Autenticacion para reserva</p>
                {session?.user ? (
                  <p className="text-sm muted-text mt-1">Sesion activa: {session.user.email}</p>
                ) : (
                  <>
                    <p className="text-sm muted-text mt-1">Inicia sesion con Google, Facebook o Instagram (via Meta).</p>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <button type="button" className="surface-card rounded px-3 py-2 text-sm" onClick={() => signIn('google', { callbackUrl: `/listing/${data.id}` })}>
                        Continuar con Google
                      </button>
                      <button type="button" className="surface-card rounded px-3 py-2 text-sm" onClick={() => signIn('facebook', { callbackUrl: `/listing/${data.id}` })}>
                        Continuar con Facebook
                      </button>
                      <button type="button" className="surface-card rounded px-3 py-2 text-sm" onClick={() => signIn('facebook', { callbackUrl: `/listing/${data.id}` })}>
                        Continuar con Instagram (Meta)
                      </button>
                    </div>
                  </>
                )}
              </div>

              <form className="mt-4 space-y-3" onSubmit={handleReserve}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm">
                    <span className="block mb-1 muted-text">Llegada</span>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-2 bg-transparent"
                      value={arrival}
                      onChange={(e) => setArrival(e.target.value)}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block mb-1 muted-text">Salida</span>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-2 bg-transparent"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                    />
                  </label>
                </div>
                <label className="text-sm block">
                  <span className="block mb-1 muted-text">Huespedes</span>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full border rounded px-2 py-2 bg-transparent"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value || 1))}
                  />
                </label>

                <div className="surface-card rounded p-3 text-sm">
                  <p>{nights > 0 ? `${nightsText} x COP ${data.price}` : 'Selecciona fechas para calcular total'}</p>
                  <p className="font-semibold mt-1">Total: COP {total || 0}</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-black font-semibold py-3 rounded"
                  disabled={busy || sessionStatus === 'loading'}
                >
                  {busy ? 'Reservando...' : 'Solicitar reserva'}
                </button>
                <button
                  type="button"
                  className="w-full bg-black text-white font-semibold py-3 rounded"
                  disabled={payBusy || sessionStatus === 'loading'}
                  onClick={handleCheckout}
                >
                  {payBusy ? 'Redirigiendo a pago...' : 'Pagar ahora (Stripe)'}
                </button>
                {message ? <p className="text-sm muted-text">{message}</p> : null}
              </form>
              <a className="mt-4 inline-block text-sm underline" href={`/api/whatsapp?listing=${data.id}`}>
                Contactar por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>

      {isGalleryModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 md:p-10">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">Foto {safeModalIndex + 1} de {images.length}</p>
              <button
                type="button"
                className="bg-white/10 text-white border border-white/20 px-3 py-2 rounded"
                onClick={() => setIsGalleryModalOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 grid grid-cols-[auto,1fr,auto] gap-3 items-center">
              <button
                type="button"
                className="bg-white/10 text-white border border-white/20 px-3 py-3 rounded"
                onClick={() => setModalImageIndex((prev) => prev - 1)}
              >
                Anterior
              </button>
              <img src={modalImage} className="w-full h-[70vh] object-contain rounded-lg bg-black/30" />
              <button
                type="button"
                className="bg-white/10 text-white border border-white/20 px-3 py-3 rounded"
                onClick={() => setModalImageIndex((prev) => prev + 1)}
              >
                Siguiente
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {images.map((im, i) => (
                <button
                  key={`modal-thumb-${im.id || i}`}
                  type="button"
                  className={`shrink-0 rounded overflow-hidden border-2 ${i === safeModalIndex ? 'border-yellow-500' : 'border-transparent'}`}
                  onClick={() => setModalImageIndex(i)}
                >
                  <img src={im.path} className="w-20 h-14 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
