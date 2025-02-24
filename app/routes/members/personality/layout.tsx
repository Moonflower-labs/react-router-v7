import { Link, Outlet, useLocation } from 'react-router'

const links = [{ to: "/members/personality#blogs", name: "Blogs" }, { to: "/members/personality#podcasts", name: "Podcasts" }, { to: "/members/personality/question", name: "Pregunta" }]

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
