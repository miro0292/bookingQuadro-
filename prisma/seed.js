const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function main() {
  // Reset listing-related demo data to keep seed deterministic.
  await prisma.booking.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.image.deleteMany({})
  await prisma.listing.deleteMany({})

  // Create two users (host and guest)
  const host = await prisma.user.upsert({
    where: { email: 'host@quadro.local' },
    update: {},
    create: {
      email: 'host@quadro.local',
      name: 'Quadro Host',
      role: 'host'
    }
  })

  const guest = await prisma.user.upsert({
    where: { email: 'guest@quadro.local' },
    update: {},
    create: {
      email: 'guest@quadro.local',
      name: 'Demo Guest',
      role: 'guest'
    }
  })

  const listingsData = [
    {
      title: 'Apartamento Quadro 101',
      description: 'Agradable apartamento en Edificio Quadro Smartliving',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 120000,
      images: ['list1.png','list2.png']
    },
    {
      title: 'Apartamento Quadro 102',
      description: 'Cómodo y cerca de servicios',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 95000,
      images: ['list3.png','list4.png']
    },
    {
      title: 'Apartamento Quadro 103',
      description: 'Habitacion moderna con excelente iluminacion natural.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 98000,
      images: ['list1.png','list3.png']
    },
    {
      title: 'Apartamento Quadro 104',
      description: 'Espacio funcional para estancias cortas y ejecutivas.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 102000,
      images: ['list2.png','list4.png']
    },
    {
      title: 'Apartamento Quadro 105',
      description: 'Ambiente tranquilo con diseno contemporaneo.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 108000,
      images: ['list3.png','list1.png']
    },
    {
      title: 'Apartamento Quadro 106',
      description: 'Unidad premium con acabados sobrios y elegantes.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 115000,
      images: ['list4.png','list2.png']
    },
    {
      title: 'Apartamento Quadro 107',
      description: 'Ideal para trabajo remoto, comodo y bien ubicado.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 99000,
      images: ['list1.png','list4.png']
    },
    {
      title: 'Apartamento Quadro 108',
      description: 'Estadia confortable en el corazon de la ciudad.',
      address: 'Edificio Quadro Smartliving, carrera 33 bus 25b-45',
      city: 'Bogotá',
      price: 105000,
      images: ['list2.png','list3.png']
    }
  ]

  for (const item of listingsData) {
    const listing = await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        address: item.address,
        city: item.city,
        price: item.price,
        owner: { connect: { id: host.id } }
      }
    })

    for (const img of item.images) {
      await prisma.image.create({ data: { path: `/listings/${img}`, listingId: listing.id } })
    }

    const offsetDays = listing.id % 5
    const start = new Date()
    start.setDate(start.getDate() + 4 + offsetDays)
    const end = new Date(start)
    end.setDate(start.getDate() + 3)

    await prisma.booking.create({
      data: {
        listingId: listing.id,
        userId: guest.id,
        startDate: start,
        endDate: end,
        total: item.price * 3
      }
    })
  }

  console.log('Seed completed')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
