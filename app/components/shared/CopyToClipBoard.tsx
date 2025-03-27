import { useOptimistic, useTransition } from 'react'
import { TbClipboardCheck, TbClipboard, TbClipboardX } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { Toaster } from '../framer-motion/Toaster';

export function CopyToClipBoard({ href }: { href: string }) {
    const [state, setState] = useOptimistic<"idle" | "copied" | "failed">("idle");
    let [, startTransition] = useTransition()


    return (
        <button
            onClick={() => {
                startTransition(async () => {
                    try {
                        await navigator.clipboard.writeText(href)
                        setState("copied"); // Set copied state to true
                        toast.success(<Toaster message={"Email copiado"} />)

                    } catch (e) {
                        setState("failed")
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Reset after 2 seconds
                })
            }}
            className="text-info/80 hover:text-info"
        >
            {state === "idle" ?
                <TbClipboard size={24} />
                : state === "copied" ? <TbClipboardCheck size={24} />
                    : <TbClipboardX className='text-error' size={24} />}
        </button>
    )
}
