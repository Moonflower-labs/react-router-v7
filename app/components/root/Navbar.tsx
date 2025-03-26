import { useState, useRef } from "react";
import { href, Link } from "react-router";

import { AnimatePresence, motion } from "motion/react";
import { CgMenuBoxed } from "react-icons/cg";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const handleNav = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <CgMenuBoxed onClick={handleNav} size={36} className="text-base-content/75 hover:text-base-content my-auto cursor-pointer" />
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
            <div className="w-full md:w-[40%] h-screen fixed right-0 bg-base-200/50 flex flex-col gap-3.5 items-center justify-center">
              {LINKS.map((link) => (
                <Link key={link.href} to={link.href} className="btn btn-primary w-[80%] scale-hover group overflow-hidden transition-all" viewTransition>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

const LINKS = [
  { href: href("/about"), label: "Sobre La Flor Blanca" },
  { href: href("/plans"), label: "Planes de subscripción" },
  { href: href("/members/personality"), label: "Rincón de miembros" },
  { href: href("/gallery"), label: "Susurros de La Flor Blanca" },
  { href: "/about#reviews", label: "Reviews" },
  { href: href("/store"), label: "Tienda" },
  { href: "/help", label: "Ayuda" },
]