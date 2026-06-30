import BottomNav from '@/components/BottomNav'

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-white/5 pb-16">
      <div className="max-w-md mx-auto bg-nocturno-500 min-h-screen relative shadow-sm">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
