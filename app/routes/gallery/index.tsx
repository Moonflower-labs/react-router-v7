import type { Route } from './+types/index.tsx'

export default function Gallery({ }: Route.ComponentProps) {
    return (
        <div className='min-h-screen p-4 text-center'>
            <h1 className='text-primary  text-3xl '>Susurros de La Flor Blanca</h1>
        </div>
    )
}
