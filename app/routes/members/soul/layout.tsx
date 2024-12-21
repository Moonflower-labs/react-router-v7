import { Link, Outlet, useLocation } from 'react-router'

const links = [{ to: "/members/soul#videos", name: "Videos" }, { to: "/members/soul#podcasts", name: "Podcasts" }, { to: "/members/soul/question", name: "Pregunta" }]


export default function Layout() {
    const { hash, pathname } = useLocation();

    return (
        <>
            <div className='flex gap-2 justify-center items-center sticky top-[120px]  pt-3'>
                {links.map((link: any, index) => (
                    <div key={index} className="flex flex-wrap gap-4 justify-center items-center">
                        <Link key={link.to} to={link.to}
                            className={`hover:scale-110 transition-all ease-in-out duration-300 badge badge-${link.to === pathname + hash ? "primary" : "ghost"}`}
                            viewTransition
                        >
                            {link.name}
                        </Link>
                    </div>
                ))}
            </div>
            <Outlet />
        </>

    )
}
