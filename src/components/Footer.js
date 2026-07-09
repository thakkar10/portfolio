import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/42">
            Heet Thakkar
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/62">
            Cinematic photography, motion, and design built around atmosphere,
            restraint, and precise visual rhythm.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/48">
          <Link href="/photography" className="transition-colors hover:text-white">Photography</Link>
          <Link href="/video" className="transition-colors hover:text-white">Video</Link>
          <Link href="/design" className="transition-colors hover:text-white">Design</Link>
          <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
