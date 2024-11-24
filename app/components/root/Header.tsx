import { AiOutlineUser } from "react-icons/ai";
import { Form, Link, useFetcher, useRouteLoaderData, useSubmit } from "react-router";
import { IoColorPalette } from "react-icons/io5";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { CgShoppingCart } from "react-icons/cg";
import { User } from "~/models/user.server";
import { LogoutBtn } from "./LogoutBtn";
import { Navbar } from "./Navbar";

export function Header() {
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

  return (
    <header className="sticky top-0 z-[200] w-screen bg-base-100">
      <div className="navbar bg-gradient-to-r from-primary/80 via-primary/70 to-secondary/80 text-primary-content/75">
        <div className="navbar-start">
          {/* User navigation */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <AiOutlineUser size={26} />
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 bg-primary/90 rounded-box w-52">
              {user ? (
                <>
                  <li>
                    <LogoutBtn />
                  </li>
                  <li>
                    <Link to={"/profile"} onClick={handleDropdown} className={"min-w-40"} viewTransition>
                      Perfil
                    </Link>
                  </li>
                  <li>
                    <Link to={"/settings"} onClick={handleDropdown} className={"min-w-40"} viewTransition>
                      Ajustes
                    </Link>
                  </li>
                  <li>
                    <Link to={"/admin"} onClick={handleDropdown} className={"min-w-40 font-bold"} viewTransition>
                      Admin
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to={"/login"} onClick={handleDropdown} className={"min-w-40"} viewTransition>
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link to={"/register"} onClick={handleDropdown} className={"min-w-40"} viewTransition>
                      Registro
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="navbar-center md:flex-row gap-2">
          <Link to={"/"} onClick={handleDropdown} className="btn btn-ghost text-2xl" viewTransition>
            <span className="hidden md:block me-2">La Flor Blanca</span>
            <div className="avatar">
              <div className="w-8 rounded-full">
                <img src="/logo.jpeg" alt="logo" className="avatart" />
              </div>
            </div>
          </Link>
          <div className="text-2xl flex">
            <span data-testid="username">{user?.username}</span>
          </div>
          <ShoppingCartIcon count={optimisticCount} />
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end dropdown-bottom">
            <div tabIndex={0} className="m-1 btn btn-ghost flex flex-col">
              <IoColorPalette size={24} />
              <span className="hidden md:block">Theme</span>
            </div>
            <Form method="post" action="/" onChange={e => submit(e.currentTarget, { preventScrollReset: true, navigate: false })}>
              <div tabIndex={0} className="menu dropdown-content z-[1] p-0 m-0 justify-end rounded-full">
                <div className="flex flex-col gap-1  bg-neutral/10 p-1 rounded-md">
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "default"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Default"
                    value="default"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "light"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Light"
                    value="light"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "garden"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Garden"
                    value="garden"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "dracula"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Dracula"
                    value="dracula"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "emerald"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Emerald"
                    value="emerald"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "cupcake"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Cupcake"
                    value="cupcake"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "coffee"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Coffee"
                    value="coffee"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "aqua"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Aqua"
                    value="aqua"
                  />
                  <input
                    type="radio"
                    name="theme-buttons"
                    defaultChecked={theme === "dark"}
                    className="btn btn-sm theme-controller bg-base-100"
                    aria-label="Dark"
                    value="dark"
                  />
                </div>
              </div>
            </Form>
          </div>
          <Navbar />
        </div>
      </div>
    </header>
  );
}

function ShoppingCartIcon({ count }: { count: number }) {
  return (
    <Link to={"./cart"} className="btn btn-ghost btn-circle" viewTransition>
      <div className="indicator cursor-pointer">
        <CgShoppingCart className="h-8 w-8 ms-2 text-primary cursor-pointer" />
        {count > 0 && (
          <motion.div key={count} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
            <span className="badge badge-sm badge-primary border-primary-content/40 indicator-item">{count}</span>
          </motion.div>
        )}
      </div>
    </Link>
  );
}
