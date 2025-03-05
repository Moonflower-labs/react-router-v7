import { href, Link } from "react-router";
import type { Route } from "./+types/index";
import { getUserId } from "~/utils/session.server";
import { createReview, getReviews } from "~/models/review.server";
import { motion } from "motion/react";
import logo from "./logo.svg"
import ShiningLogo from "./logo";
import { IoMdArrowDroprightCircle } from "react-icons/io";
import { getMembersCount, getUsersCount } from "~/models/user.server";


export const meta: Route.MetaFunction = () => {
    return [{ title: "La Flor Blanca: Home" }, { name: "description", content: "Health and wellbeing" }];
};

export async function loader({ }: Route.LoaderArgs) {
    const userCount = await getUsersCount()
    const membersCount = await getMembersCount()
    // Retutn the reviews promise
    const reviews = getReviews()
    return { reviews, userCount, membersCount };
}


export async function action({ request }: Route.ActionArgs) {
    // Handle review creation
    const userId = await getUserId(request);
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const score = Number(formData.get("score"));

    if (text?.trim() === "" || !text) {
        return { error: "Debes de escribir algo en tu review 😁" };
    }
    if (!userId) {
        return { error: "Parece que no has iniciado sessión 🤔" };
    }
    await createReview({ userId, text, score });

    return { message: "Gracias por tu opinión.", success: true };
}



export default function Welcome({ loaderData }: Route.ComponentProps) {
    const { userCount, membersCount } = loaderData
    // Container variants for staggered children animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    // Child variants for individual elements
    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                type: "spring",
                bounce: 0.2,
                damping: 20
            }
        }
    };



    return (
        <motion.div
            className="w-screen min-h-screen flex flex-col justify-center items-center gap-16 pb-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="p-2 pt-8"
                variants={itemVariants}
            >
                <div className="flex flex-col gap-4 justify-center items-center py-4">
                    <h1 className="text-4xl font-bold text-primary mb-4 md:flex-row gap-5 justify-center items-center"><span>Bienvenidos</span></h1>
                    <div className="avatar">
                        <div className="w-36 rounded">
                            <img src={logo} alt="logo" className="aspect-video transform scale-150" />
                        </div>
                    </div>
                    <ShiningLogo />
                </div>
            </motion.div>
            <motion.div
                className="text-lg font-semibold text-center"
                variants={itemVariants}
            >
                <div
                    className="px-5 text-xl font-semibold text-center"
                >
                    Comunidad anónima de espiritualidad y bienestar.
                </div>
            </motion.div>
            <div className="flex flex-row text-center justify-center items-stretch gap-2 w-[96%] md:w-[55%] font-bold text-primary">
                {/* Link containers */}
                <motion.div
                    className="w-1/3"
                    whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300
                    }}
                >
                    <Link to={href("/about")} className="w-full h-full flex justify-center items-center border border-primary/40 rounded p-4 shadow" viewTransition>
                        Sobre La Flor Blanca
                    </Link>
                </motion.div>

                <motion.div
                    className="w-1/3"
                    whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300
                    }}
                >
                    <Link to={href("/members/personality")} className="w-full h-full flex justify-center items-center border border-primary/40 rounded p-4 shadow" viewTransition>
                        Miembros
                    </Link>
                </motion.div>
                <motion.div
                    className="w-1/3"
                    whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300
                    }}
                >
                    <Link to={href("/store")} className="w-full h-full flex justify-center items-center border border-primary/40 rounded p-4 shadow" viewTransition>
                        Productos
                    </Link>
                </motion.div>
            </div>

            <motion.h2
                className="text-2xl font-bold text-primary"
                variants={itemVariants}
            >
                Elige tu camino:
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-4 pb-3 px-3 justify-items-center">
                <motion.div
                    className="flex flex-col gap-4 p-8 w-full shadow-xl"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-semibold">Soy nuevo</h2>
                    <p className="">
                        Conoce la historia de La Flor Blanca, explora vídeos gratuitos y conoce las distintas secciones.
                    </p>
                    <Link to={href("/about")} viewTransition className="flex justify-between items-center link-primary">
                        <span>Qué es La Flor Blanca?</span>
                        <IoMdArrowDroprightCircle size={24} />
                    </Link>
                </motion.div>
                <motion.div
                    className="flex flex-col gap-4 p-8 w-full shadow-xl"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-semibold">Soy Vergozoso</h2>
                    <p className="">
                        Conoce la historia de La Flor Blanca y explora vídeos
                    </p>
                    <Link to={href("/about")} viewTransition className="flex justify-between items-center link-primary">
                        <span>  Es completamente anónima?</span>
                        <IoMdArrowDroprightCircle size={24} />
                    </Link>
                </motion.div>
                <motion.div
                    className="flex flex-col gap-4 p-8 w-full shadow-xl"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-semibold">Quiero colaborar</h2>
                    <p className="">
                        Conoce la historia de La Flor Blanca y explora vídeos
                    </p>
                    <Link to={href("/about")} viewTransition className="flex justify-between items-center link-primary">
                        <span>Colabora con La Flor Blanca</span>
                        <IoMdArrowDroprightCircle size={24} />
                    </Link>
                </motion.div>
                <motion.div
                    className="flex flex-col gap-4 p-8 w-full shadow-xl"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-semibold">Tengo dudas sobre..</h2>
                    <p className="">
                        Visita la sección de ayuda, donde encontrarás la solución a las dudas mâs comunes.
                    </p>
                    <Link to={href("/help")} viewTransition className="flex justify-between items-center link-primary">
                        <span>Página de ayuda</span>
                        <IoMdArrowDroprightCircle size={24} />
                    </Link>
                </motion.div>
            </div>
            <div className="stats shadow mb-3">
                <div className="stat">
                    <div className="stat-title">Downloads</div>
                    <div className="stat-value">31K</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Usuarios</div>
                    <div className="stat-value">{userCount}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Miembros</div>
                    <div className="stat-value">{membersCount}</div>
                </div>
            </div>
        </motion.div>
    );
}
