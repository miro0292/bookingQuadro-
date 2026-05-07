export default function handler(req, res){
  const { listing } = req.query
  const phone = '3123479640'
  const text = encodeURIComponent(`Hola, estoy interesado en el apartamento (id: ${listing}). ¿Está disponible?`)
  const url = `https://api.whatsapp.com/send/?phone=${phone}&text=${text}`
  res.redirect(url)
}
