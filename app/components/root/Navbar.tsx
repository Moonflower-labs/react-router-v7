import { useState, useRef } from "react";
import { Link } from "react-router";

import { AnimatePresence, motion } from "framer-motion";
import { CgMenuBoxed } from "react-icons/cg";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const handleNav = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <CgMenuBoxed onClick={handleNav} size={35} className="text-primary my-auto pe-2 cursor-pointer" />
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            key="nav"
            ref={navRef}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 w-screen h-full z-100"
            onClick={handleNav}>
            <div className="w-full md:w-[40%] h-full fixed right-0 backdrop-blur-sm flex flex-col gap-3 items-center justify-center">
              <Link to="/" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Inicio
              </Link>

              <Link to="/plans" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Planes de subscripción
              </Link>
              <Link to="personality" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Rincón de miembros
              </Link>
              <Link to="questions" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Pregúntale a La Flor Blanca
              </Link>
              <Link to="store" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Tienda
              </Link>
              <Link to="help" className="btn btn-primary w-[80%] scale-hover group overflow-hidden" viewTransition>
                Ayuda
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
