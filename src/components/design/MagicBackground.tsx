import {
  Cloud, Balloon, Butterfly, StarDoodle, Rainbow, CircleRing, HeartDoodle, DotCluster,
} from '@/components/ui/HeroDecorations'

export function MagicBackground({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${subtle ? 'opacity-60' : ''}`} aria-hidden>
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/50 to-mint-200/30 blur-3xl" />
      <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-gradient-to-br from-violet-200/30 to-sky-200/30 blur-3xl" />
      <Cloud className="absolute top-20 left-[8%] w-28 h-14 text-sky-300/40 animate-float-slow" />
      <Cloud className="absolute top-32 right-[12%] w-36 h-18 text-white/60 animate-float" />
      <div className="absolute top-28 left-[20%] animate-float-slow"><Balloon className="w-8 h-11" color="#FF8A4C" /></div>
      <div className="absolute top-40 right-[25%] animate-float" style={{ animationDelay: '1s' }}><Balloon className="w-7 h-10" color="#7DD3FC" /></div>
      <div className="absolute bottom-32 left-[15%] animate-float-slow" style={{ animationDelay: '0.5s' }}><Balloon className="w-9 h-12" color="#FDE68A" /></div>
      <div className="absolute top-16 right-[8%] w-12 h-9 animate-drift hidden sm:block"><Butterfly color="#FF8A4C" className="w-full h-full" /></div>
      <div className="absolute bottom-40 right-[18%] w-16 h-9 animate-float-slow hidden md:block"><Rainbow className="w-full h-full" /></div>
      <div className="absolute top-1/2 left-[6%] w-8 h-8 animate-wiggle"><StarDoodle color="#FBBF24" className="w-full h-full" /></div>
      <div className="absolute bottom-24 right-[6%] w-10 h-10 animate-spin-slow hidden md:block"><CircleRing className="w-full h-full" /></div>
      <div className="absolute top-1/3 right-[4%] w-8 h-7 animate-pulse-soft hidden lg:block"><HeartDoodle className="w-full h-full" /></div>
      <div className="absolute bottom-16 left-[40%] w-8 h-8 animate-drift hidden md:block"><DotCluster className="w-full h-full" /></div>
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute text-amber-300/50 animate-pulse-soft"
          style={{
            top: `${10 + (i * 9) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            fontSize: `${6 + (i % 3) * 2}px`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}
