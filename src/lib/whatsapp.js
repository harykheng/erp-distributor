export function waLink(phone, message) {
  const digits = (phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
