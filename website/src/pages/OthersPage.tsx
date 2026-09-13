import { PageTransition } from '@/components/motion/PageTransition'
import { Hobbies } from '@/components/sections/Hobbies'
import { Gallery } from '@/components/sections/Gallery'

/**
 * Others: Hobbies and Gallery moved off the Home scroll onto their own
 * route, reusing both section components unchanged.
 */
export function OthersPage() {
  return (
    <PageTransition>
      <div className="flex flex-col">
        <h1 className="sr-only">Others</h1>
        <Hobbies />
        <Gallery />
      </div>
    </PageTransition>
  )
}
