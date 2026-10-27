import { redirect } from 'next/navigation'

export default function ClientGalleryRedirect() {
  redirect('/admin/galleries')
}
