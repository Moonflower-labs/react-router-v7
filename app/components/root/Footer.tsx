import { RiInstagramLine } from "react-icons/ri";
import { FaFacebook, FaTelegram } from "react-icons/fa";
import { GrYoutube } from "react-icons/gr";
import logo from "./logo.svg"

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer justify-center md:justify-normal p-10 bg-base-300">
      <aside>
        <div className="avatar">
          <div className="w-10 rounded">
            <img src={logo} alt="logo" className="transform scale-110" />
          </div>
        </div>
        <p className="text-primary-content">&copy; La Flor Blanca {year}</p>

        <a className="link link-primary" href="https://portfolio-42z.pages.dev/" target="_blank" rel="noreferrer">
          &copy; Moonflower Labs
        </a>
      </aside>
      <nav>
        <h6 className="footer-title">Redes Sociales</h6>
        <div className="grid grid-flow-col gap-4">
          <a href="https://www.instagram.com/the_chic_noir" target="_blank" rel="noreferrer">
            <RiInstagramLine size={25} />
          </a>
          <a href="https://t.me/VisioneslaFlorBlanca" target="_blank" rel="noreferrer">
            <FaTelegram size={25} />
          </a>
          <a href="https://www.youtube.com/@LaFlorBlanca" target="_blank" rel="noreferrer">
            <GrYoutube size={25} />
          </a>
          <a href="https://www.facebook.com/TheChicNoir1" target="_blank" rel="noreferrer">
            <FaFacebook size={25} />
          </a>
        </div>
      </nav>
    </footer>
  );
}
