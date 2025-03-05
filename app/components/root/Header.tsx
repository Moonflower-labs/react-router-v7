import { AiFillSetting, AiOutlineUser } from "react-icons/ai";
import { Form, href, Link, useFetcher, useLocation, useRouteLoaderData, useSubmit } from "react-router";
import { IoColorPalette } from "react-icons/io5";
import { useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CgShoppingCart } from "react-icons/cg";
import type { User } from "~/models/user.server";
import { LogoutBtn } from "./LogoutBtn";
import { Navbar } from "./Navbar";
import logo from "./logo.svg"
import { RiAdminFill } from "react-icons/ri";

export function Header() {
  const { pathname } = useLocation()
  const isHomePage = pathname === "/"
  const user = useRouteLoaderData("root")?.user as User;
  const theme = useRouteLoaderData("root")?.theme as string;
  const totalItemCount = useRouteLoaderData("root")?.totalItemCount;
  const fetcher = useFetcher({ key: "add-to-cart" });
  const inFlightCount = Number(fetcher.formData?.get("quantity") || 0);
  const optimisticCount = totalItemCount + inFlightCount;
  const submit = useSubmit();

  const handleDropdown = useCallback(() => {
    const elem = document.activeElement as HTMLInputElement;
    if (elem) {
      elem?.blur();
    }
  }, []);

  const truncateUsername = (username: string, limit: number = 15) => {
    if (!username) return "";
    if (username.length <= limit) return username;
    return `${username.slice(0, limit)}...`;
  };

  return (
    <header className="sticky top-0 z-[200] w-screen bg-base-200/90 backdrop-blur">
      <div className={`navbar shadow-md z-50 h-full`}>
        <div className="navbar-start">
          {/* User navigation */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className={"btn shadow"}>
              <AiOutlineUser size={26} />
            </div>
            <ul tabIndex={0} className={"menu menu-sm dropdown-content mt-3 z-[1] rounded-box w-52 p-2 bg-base-200/90"}>
              {user ? (
                <>

                  <li>
                    <Link to={href("/profile")} onClick={handleDropdown} className="flex-grow flex flex-col justify-center items-center w-full mx-auto" viewTransition>
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img src={user?.profile?.avatar || logo} className="object-top" />
                        </div>
                      </div>
                      {truncateUsername(user.username)}
                    </Link>
                  </li>
                  <li>
                    <Link to={href("/profile/settings")} onClick={handleDropdown} className={"min-w-40 flex justify-between items-center"} viewTransition>
                      Ajustes
                      <AiFillSetting size={18} />
                    </Link>
                  </li>
                  <li>
                    <Link to={href("/admin")} onClick={handleDropdown} className={"min-w-40 font-bold flex justify-between items-center"} viewTransition>
                      Admin
                      <RiAdminFill size={18} />
                    </Link>
                  </li>
                  <li onClick={handleDropdown}>
                    <LogoutBtn />
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to={href("/login")} onClick={handleDropdown} className="flex-grow flex flex-col justify-center items-center w-full mx-auto" viewTransition>
                      <div className="avatar">
                        <div className="w-10 rounded-lg">
                          <img src={logo} className="object-top" />
                        </div>
                      </div>
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to={href("/register")} onClick={handleDropdown} className={"min-w-40 flex justify-center text-center"} viewTransition>
                      Registro
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn m-1 shadow">
              <IoColorPalette size={24} />
              <span className="hidden md:block">Theme</span>
            </div>
            <Form method="post" action="/" onChange={e => submit(e.currentTarget, { preventScrollReset: true, navigate: false })}>
              <ul tabIndex={0} className="dropdown-content bg-base-200 rounded-box mt-2 z-1 w-32 p-2 shadow-2xl">
                {themes.map((themeOption) => (
                  <li key={themeOption.value}>
                    <input

                      type="radio"
                      name="theme-buttons"
                      defaultChecked={theme === themeOption.value}
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label={themeOption.label}
                      value={themeOption.value}
                    />
                  </li>
                ))}
              </ul>
            </Form>
          </div>
        </div>
        <div className="navbar-center md:flex-row gap-1.5 text-primary">
          {!isHomePage ?
            <>
              <Link to={"/"} onClick={handleDropdown} className="flex hover:bg-base-200 rounded px-2.5 py-1 text-2xl" viewTransition>
                <span className="hidden md:block me-2">La Flor Blanca</span>
                <div className="avatar">
                  <div className="w-10 rounded">
                    <img src={logo} alt="logo" className="transform scale-150" />
                  </div>
                </div>
              </Link>
              <ShoppingCartIcon count={optimisticCount} />
            </>
            : <span className="font-bold text-xl">
              {user?.username ? truncateUsername(user.username) : ""}
            </span>}
        </div>
        <div className="navbar-end">
          <Navbar />
        </div>
      </div>
    </header>
  );
}

const themes = [
  { value: 'florBlanca', label: 'Default' },
  { value: 'garden', label: 'Garden' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'cupcake', label: 'Cupcake' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'caramellatte', label: 'Caramellatte' },
  { value: 'abyss', label: 'Abyss' },
  { value: 'dark', label: 'Dark' },
];

function ShoppingCartIcon({ count }: { count: number }) {
  return (
    <Link to={href("/cart")} className="btn btn-ghost btn-circle" viewTransition>
      <div className="indicator cursor-pointer">
        <CgShoppingCart className="h-8 w-8 ms-2 text-primary cursor-pointer" />
        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.div
              key="liked"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }
              }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div key={count} animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 16, -16, 0]
              }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.5, 0.8],
                  repeat: 1,
                  repeatDelay: 0.3
                }}>
                <span className="badge badge-sm badge-primary indicator-item">{count}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
}