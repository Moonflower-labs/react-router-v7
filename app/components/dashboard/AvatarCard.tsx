import { use, useState, type Dispatch, type SetStateAction } from "react";
import { useSubmit, type SubmitFunction } from "react-router";
import { AnimatePresence, motion } from "motion/react";

export function AvatarCard({ userAvatar, avatars }: { userAvatar: string | null | undefined, avatars: Promise<any> }) {
    const avatarsList = use(avatars)

    const [selectedAvatar, setSelectedAvatar] = useState(userAvatar || "/avatars/girl.jpg");
    const submit = useSubmit();

    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <h2 className="text-xl text-center text-primary font-semibold py-3">Avatar</h2>
            <div className="flex-grow flex flex-col items-center">
                <div className="avatar mx-auto mb-4">
                    <div className="w-24 rounded-full">
                        <img src={selectedAvatar} className="object-top" />
                    </div>
                </div>
            </div>
            <AvatarSelector
                avatars={avatarsList}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                submit={submit}
            />
        </div>
    )
}


export function AvatarSkeleton() {
    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <div className="flex flex-col justify-between items-center gap-4 mt-3">
                <div className="skeleton h-5 w-24"></div>
                <div className="flex items-center gap-4">
                    <div className="skeleton h-24 w-24 shrink-0 rounded-full"></div>
                </div>
                <div className="skeleton h-8 w-full mt-10"></div>
            </div>
        </div>
    )
}

interface AvatarSelectorPops {
    avatars: any[],
    setSelectedAvatar: Dispatch<SetStateAction<string>>,
    selectedAvatar: string,
    submit: SubmitFunction,
}

export function AvatarSelector({ avatars, setSelectedAvatar, submit, selectedAvatar }: AvatarSelectorPops) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button
                className="btn btn-sm btn-outline w-full mb-2 flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{isOpen ? 'Esconder Avatars' : 'Ver Avatars'}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="avatar-selector grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-base-100 rounded-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {avatars.length > 0 ? (
                            avatars.map((avatar) => {
                                const thumbnailUrl = avatar.secure_url.replace(
                                    '/upload/',
                                    '/upload/w_100,h_100,c_fill,g_auto,q_auto/'
                                );
                                return (
                                    <motion.div
                                        key={avatar.asset_id}
                                        className={`cursor-pointer overflow-hidden transition-all`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedAvatar(avatar.secure_url);
                                            submit(
                                                { avatar: avatar.secure_url },
                                                { method: 'POST', navigate: false }
                                            );
                                        }}
                                    >
                                        <div className="avatar mx-auto mb-4">
                                            <div
                                                className={`w-24 rounded-full ${avatar.secure_url === selectedAvatar ? 'border-4 border-primary' : ''
                                                    }`}
                                            >
                                                <img src={thumbnailUrl} className="object-top" alt={avatar.public_id.split('/').pop()} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="col-span-full text-center">No avatars disponibles</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}