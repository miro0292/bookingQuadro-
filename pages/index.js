import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())
const welcomeImages = Array.from({ length: 28 }).map((_, i) => `/welcome/welcome-${String(i + 1).padStart(2, '0')}.png`)

export default function Home(){
  const { data } = useSWR('/api/listings', fetcher, { fallbackData: [] })

  return (
    <div className="min-h-screen p-6 pt-20">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Quadro" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-semibold">Quadro Smartliving — Demo</h1>
        </div>
        <Link href="/owner" className="surface-card px-3 py-2 rounded text-sm font-medium">
          Panel propietario
        </Link>
      </header>

      <section className="max-w-5xl mx-auto mb-10">
        <div className="surface-card rounded-2xl overflow-hidden border">
          <div className="relative h-[380px] md:h-[450px]">
            <img src={welcomeImages[0]} alt="Areas comunes Quadro" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 text-black px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                Bienvenido a Quadro Smartliving
              </div>
              <h2 className="text-white text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
                Areas comunes premium para una estancia comoda y funcional
              </h2>
              <p className="text-white/90 text-sm md:text-base max-w-2xl">
                Disfruta coworking, cafeteria, living social, terraza panoramica, lavanderia comunal y parqueadero en un solo lugar.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">Lavanderia comunal</span>
                <span className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">Parqueadero</span>
                <span className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">Coworking</span>
                <span className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">Terraza</span>
                <span className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">Cafeteria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-4 mt-4">
          <h3 className="text-lg font-semibold">Galeria de areas comunes del edificio</h3>
          <p className="muted-text text-sm mt-1 mb-3"> </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {welcomeImages.map((img, idx) => (
              <div key={img} className="rounded-lg overflow-hidden surface-card">
                <img src={img} alt={`Area comun ${idx + 1}`} className="w-full h-32 md:h-36 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mb-4">
        <h2 className="text-2xl font-bold">Apartamentos disponibles</h2>
      </section>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map(l => (
          <Link key={l.id} href={`/listing/${l.id}`} className="surface-card rounded-lg overflow-hidden block">
            <div className="h-48 surface-card">
              <img src={l.images?.[0]?.path || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h2 className="font-medium">{l.title}</h2>
              <p className="text-sm muted-text">{l.address}</p>
              <div className="mt-2 font-semibold">COP {l.price}</div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
