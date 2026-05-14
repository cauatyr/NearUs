import SidebarNegocio from '@/components/SidebarNegocio'

export default function NegocioLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SidebarNegocio />
      <main className="md:ml-72 min-h-screen">{children}</main>
    </div>
  )
}
