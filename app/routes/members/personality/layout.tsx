import { href, Link, Outlet, redirect, useLocation } from 'react-router'
import { getUserSubscription } from '~/models/subscription.server';
import { getUserIdWithRole } from '~/utils/session.server';
import type { Route } from './+types';

const links = [{ to: "/members/personality#blogs", name: "Blogs" }, { to: "/members/personality#podcasts", name: "Podcasts" }, { to: "/members/personality/question", name: "Pregunta" }]

const membersAuth: Route.unstable_MiddlewareFunction = async ({ request }) => {
    console.log("Personality middleware")
    const { isAdmin, userId } = await getUserIdWithRole(request)
    if (isAdmin) {
        console.log("user is ADMIN")
        return;
    }

    if (!userId || userId.startsWith("guest-")) {
        console.log("Please Log in")
        throw redirect(href("/login"), 302);
    }
    const userSubscription = await getUserSubscription(userId)
    const allowedPlans = ["Personalidad", "Alma", "Espíritu"]
    const planName = userSubscription?.plan.name

    if (!planName || !allowedPlans.includes(planName)) {
        console.log("You don't have a subscription plan!")
        throw redirect(href("/plans"), 302);
    }
};

export const unstable_middleware = [membersAuth]

export default function Layout() {
    const { hash, pathname } = useLocation();

    return (
        <>
            <div className='flex flex-wrap gap-1.5 justify-center items-center sticky top-[125px] z-50 py-2 px-2 bg-base-200/90 w-fit mx-auto rounded-lg'>
                {links.map((link: any, index) => (
                    <Link key={link.to} to={link.to}
                        className={`hover:scale-110 transition-all ease-in-out duration-300 badge badge-${link.to === pathname + hash ? "primary" : "ghost"}`}
                        viewTransition
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
            <Outlet />
        </>

    )
}
