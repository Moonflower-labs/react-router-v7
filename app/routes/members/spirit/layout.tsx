import { Link, Outlet, useLocation } from 'react-router'

const links = [{ to: "/members/spirit#videos", name: "Videos" }, { to: "/members/spirit#podcasts", name: "Podcasts" }, { to: "/members/spirit/question", name: "Pregunta" }, { to: "/members/spirit/live", name: "Sesión en directo" }]


export default function Layout() {
    const { hash, pathname } = useLocation();

    return (
        <>
            <div className='flex flex-wrap gap-1.5 justify-center items-center sticky top-[125px] z-50 py-2 px-2 bg-base-200/90 w-fit rounded-lg mx-auto'>
                {links.map((link: any, index) => (
                    <Link key={link.to} to={link.to}
                        className={`hover:scale-110 transition-all ease-in-out duration-300 badge badge-${link.to === pathname + hash ? "primary" : "ghost"}`}
                        viewTransition
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
            <div className='min-h-screen'>
                <Outlet />
            </div>
        </>

    )
}
