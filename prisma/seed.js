const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function randomPrice() {
  const options = [110000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 150000]
  return options[Math.floor(Math.random() * options.length)]
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const images = [
  ['/listings/list1.png', '/listings/list2.png'],
  ['/listings/list2.png', '/listings/list3.png'],
  ['/listings/list3.png', '/listings/list4.png'],
  ['/listings/list4.png', '/listings/list1.png'],
  ['/listings/list1.png', '/listings/list3.png'],
  ['/listings/list2.png', '/listings/list4.png'],
  ['/listings/list1.png', '/listings/list2.png', '/listings/list3.png'],
  ['/listings/list2.png', '/listings/list3.png', '/listings/list4.png'],
  ['/listings/list3.png', '/listings/list4.png', '/listings/list1.png'],
  ['/listings/list4.png', '/listings/list1.png', '/listings/list2.png'],
  ['/listings/list1.png', '/listings/list4.png'],
  ['/listings/list2.png', '/listings/list1.png'],
]

const listingsData = [
  {
    title: 'Apartamento Quadro 101',
    description: 'Espacioso apartamento en primer piso con acceso directo a zonas comunes. Ideal para estadías cortas y ejecutivas. Cuenta con cocina equipada, WiFi de alta velocidad y espacio de trabajo.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 1',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 102',
    description: 'Unidad acogedora con excelente iluminación natural. Perfecta para trabajo remoto, con escritorio dedicado y conexión estable. A pasos del coworking y la cafetería del edificio.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 1',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 201',
    description: 'Apartamento moderno en segundo piso con vista al jardín interior. Acabados contemporáneos, baño completo y cocina funcional. Acceso a gimnasio y terraza panorámica incluido.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 2',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 202',
    description: 'Ambiente tranquilo y minimalista ideal para descanso. Ropa de cama premium, blackout total y sistema de climatización. Ubicado lejos de las áreas de tráfico del edificio.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 2',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 301',
    description: 'Unidad premium en tercer piso con acabados de lujo. Cocina tipo loft, baño con ducha tipo lluvia y sala con sofá cama. Excelente para parejas o viajeros de negocios.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 3',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 302',
    description: 'Amplio y funcional con doble ventanería para mayor aislamiento. Escritorio ejecutivo, silla ergonómica y pantalla adicional disponible. WiFi simétrico de 300 Mbps.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 3',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 401',
    description: 'Estudio inteligente con distribución optimizada. Cama murphy integrada que libera espacio durante el día. Sistema de domótica básico para control de luces y temperatura.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 4',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 402',
    description: 'Apartamento de esquina con dos ventanas y vista parcial a la ciudad. Decoración neutra y elegante. Incluye estacionamiento en el sótano del edificio sin costo adicional.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 4',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 501',
    description: 'Piso intermedio con acceso directo al living social del edificio. Ideal para grupos pequeños o familias. Cocina completa con electrodomésticos de última generación.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 5',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 502',
    description: 'Cálido y bien ventilado, con orientación norte para luz constante. Ropa de cama incluida y servicio de lavandería comunal disponible las 24 horas.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 5',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 601 — Superior',
    description: 'Nuestra unidad superior en sexto piso con la mejor vista del edificio. Sala independiente, dormitorio doble y baño con bañera. La opción más cómoda para estadías largas.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 6',
    city: 'Bogotá',
  },
  {
    title: 'Apartamento Quadro 602 — Superior',
    description: 'Segunda unidad superior con distribución espejo. Terraza privada de 4m² con sillas y mesa. Acceso prioritario a todos los amenities del edificio. Experiencia Quadro completa.',
    address: 'Edificio Quadro Smartliving, Carrera 33 # 25B-45, Piso 6',
    city: 'Bogotá',
  },
]

async function main() {
  // Limpiar datos existentes
  await prisma.booking.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.image.deleteMany({})
  await prisma.listing.deleteMany({})

  // Crear usuarios
  const host = await prisma.user.upsert({
    where: { email: 'host@quadro.local' },
    update: {},
    create: { email: 'host@quadro.local', name: 'Quadro Host', role: 'host' }
  })

  const guest = await prisma.user.upsert({
    where: { email: 'guest@quadro.local' },
    update: {},
    create: { email: 'guest@quadro.local', name: 'Demo Guest', role: 'guest' }
  })

  const today = new Date()

  for (let i = 0; i < listingsData.length; i++) {
    const item = listingsData[i]
    const price = randomPrice()

    const listing = await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        address: item.address,
        city: item.city,
        price,
        owner: { connect: { id: host.id } }
      }
    })

    // Imágenes rotadas
    for (const imgPath of images[i % images.length]) {
      await prisma.image.create({ data: { path: imgPath, listingId: listing.id } })
    }

    // Reserva pasada (ya ocurrió)
    const pastStart = addDays(today, -(20 + i * 3))
    const pastEnd = addDays(pastStart, 3 + (i % 3))
    await prisma.booking.create({
      data: {
        listingId: listing.id,
        userId: guest.id,
        startDate: pastStart,
        endDate: pastEnd,
        total: price * (3 + (i % 3))
      }
    })

    // Reserva próxima 1 (dentro de pocos días)
    const soon1Start = addDays(today, 3 + i * 2)
    const soon1End = addDays(soon1Start, 2 + (i % 4))
    await prisma.booking.create({
      data: {
        listingId: listing.id,
        userId: guest.id,
        startDate: soon1Start,
        endDate: soon1End,
        total: price * (2 + (i % 4))
      }
    })

    // Reserva próxima 2 (en 3-4 semanas)
    const soon2Start = addDays(today, 25 + i * 2)
    const soon2End = addDays(soon2Start, 4 + (i % 3))
    await prisma.booking.create({
      data: {
        listingId: listing.id,
        userId: guest.id,
        startDate: soon2Start,
        endDate: soon2End,
        total: price * (4 + (i % 3))
      }
    })
  }

  console.log(`Seed completado: ${listingsData.length} apartamentos creados con reservas pasadas y futuras.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
