import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  if (req.method === 'GET'){
    const listings = await prisma.listing.findMany({ include: { images: true } })
    res.json(listings)
  } else if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user || session.user.role !== 'host') {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const { title, description, address, city, price, images } = req.body
    if (!title || !description || !address || !city || !price) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const owner = await prisma.user.findFirst({ where: { role: 'host' } })
    if (!owner) return res.status(400).json({ error: 'No existe usuario propietario' })

    const created = await prisma.listing.create({
      data: {
        title,
        description,
        address,
        city,
        price: Number(price),
        ownerId: owner.id,
        images: {
          create: (images || []).map((path) => ({ path }))
        }
      },
      include: { images: true }
    })

    res.status(201).json(created)
  } else {
    res.status(405).end()
  }
}
