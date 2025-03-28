import { getUserId } from '~/middleware/sessionMiddleware';
import type { Route } from './+types/questions'
import { getUserQuestions } from '~/models/question.server'
import { formatDayTimeEs } from '~/utils/format'

export async function loader({ context }: Route.LoaderArgs) {
    const userId = getUserId(context);
    return getUserQuestions(userId)

}

export default function Component({ loaderData }: Route.ComponentProps) {
    const basic = loaderData?.basic
    const tarot = loaderData?.tarot
    const live = loaderData?.live

    return (
        <div className='flex flex-col gap-4 justify-center items-center'>
            <h1 className='text-2xl font-bold text-primary py-3'>Preguntas realizadas</h1>
            <div className='rounded-lg shadow-lg w-full md:w-2/3 mb-4 p-2 bg-base-200'>
                <h2 className='text-xl font-bold'>Personalidad</h2>
                {basic?.length > 0
                    ? basic.map((question, index) =>
                        <div key={question.id} className='mb-3'>
                            <p>{index + 1}. {formatDayTimeEs(question.createdAt)}</p>
                            <p>{question.text}</p>
                        </div>
                    )
                    : <p>No has realizado ninguna pregunta de Personalidad</p>
                }
            </div>
            <div className='rounded-lg shadow-lg w-full md:w-2/3 mb-4 p-2 bg-base-200'>
                <h2 className='text-xl font-bold'>Tarot</h2>
                {tarot?.length > 0
                    ? tarot.map((question, index) =>
                        <div key={question.id} className='mb-3'>
                            <p>{index + 1}. {formatDayTimeEs(question.createdAt)}</p>
                            <p>{question.text}</p>
                        </div>
                    )
                    : <p>No has realizado ninguna pregunta de Tarot</p>
                }
            </div>
            <div className='rounded-lg shadow-lg w-full md:w-2/3 mb-4 p-2 bg-base-200'>
                <h2 className='text-xl font-bold'>Directo</h2>
                {live?.length > 0
                    ? live.map((question, index) =>
                        <div key={question.id} className='mb-3'>
                            <p>{index + 1}. {formatDayTimeEs(question.createdAt)}</p>
                            <p>{question.text}</p>
                            <p>{question.info}</p>
                        </div>
                    )
                    : <p>No has realizado ninguna pregunta de Directo</p>
                }
            </div>
        </div>
    )
}
