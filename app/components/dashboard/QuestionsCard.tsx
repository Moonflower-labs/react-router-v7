import { use } from 'react'
import { GoArrowRight } from 'react-icons/go'
import { href, Link } from 'react-router'
import type { UserWithProfile } from '~/models/profile.server'

export default function QuestionsCard({ promise }: { promise: Promise<UserWithProfile> }) {
    const profile = use(promise)

    return (
        <div className="rounded-lg border shadow-lg p-4">
            <h2 className="text-xl text-center text-primary font-semibold py-3">Preguntas Realizadas</h2>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <span>Personalidad</span> <span className="badge badge-primary badge-outline">{profile?.profile?.basicQuestionCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Live</span> <span className="badge badge-primary badge-outline">{profile?.profile?.liveQuestionCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tarot</span> <span className="badge badge-primary badge-outline">{profile?.profile?.tarotQuestionCount}</span>
                </div>
                <Link to={href("/profile/questions")} className="text-primary flex justify-end" viewTransition>
                    <GoArrowRight size={24} />
                </Link>
            </div>
        </div>
    )
}

export function QuestionsSkeleton() {
    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col justify-between">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="skeleton h-5 w-32"></div>
                    <div className='flex justify-between w-full'>
                        <div className="skeleton h-4 w-40"></div>
                        <div className="skeleton h-4 w-5"></div>
                    </div>
                    <div className='flex justify-between w-full'>
                        <div className="skeleton h-4 w-24"></div>
                        <div className="skeleton h-4 w-5"></div>
                    </div>
                    <div className='flex justify-between w-full'>
                        <div className="skeleton h-4 w-24"></div>
                        <div className="skeleton h-4 w-5"></div>
                    </div>
                    <div className="h-4 w-full rounded-lg"></div>
                </div>
            </div>
            <div className='flex justify-end'>
                <div className="skeleton h-6 w-6"></div>
            </div>
        </div>
    )
}