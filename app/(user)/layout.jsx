import BottomNav from '@/components/BottomNav'

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-sm">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
