import { Link } from "react-router";
import InfoAlert from "~/components/shared/info";

export default function Admin() {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center gap-12 mb-4">
      <h1 className="text-3xl font-bold text-primary my-4">Bienvenida a tu Admin Panel</h1>
      <p>A continuación las instrucciones básicas de las acciones/operaciones disponibles en el panel.</p>
      <div className="card card-bordered max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title mx-auto">Contenido</div>
          <p>Administra el contenido de las secciones de Personalidad, Alma y espíritu.</p>
          <p>En cada sección podrás crear,editar o eliminar posts, videos ...</p>
          <h3 className="text-2xl font-bold mb-3">Borrador y Publicación</h3>
          <InfoAlert>
            Esta opción solo está disponible para posts o videos.
            <div>No es aplicable a categorias</div>
          </InfoAlert>

          <p>A la hora de crear tienes dos opciones.</p>
          <ul className="list-disc list-inside font-semibold">
            <li>Borrador</li>
            <li>Público</li>
          </ul>
          <p>
            A la hora de crear un post or video, pincha en "borrador" si no quieres que el contenido esté disponible en la página. O usa la opción de "publicar"
            y el contenido estará disponible para los usuarios inmediatamente.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Link to={"post"} className="btn  btn-primary btn-outline btn-sm shadow-md" viewTransition>
              Personalidad
            </Link>
            <Link to={"post"} className="btn  btn-primary btn-outline btn-sm shadow-md" viewTransition>
              Alma
            </Link>
            <Link to={"post"} className="btn  btn-primary btn-outline btn-sm shadow-md" viewTransition>
              Espíritu
            </Link>
            <Link to={"post"} className="btn  btn-primary btn-outline btn-sm shadow-md" viewTransition>
              Tarot
            </Link>
            <Link to={"post"} className="btn  btn-primary btn-outline btn-sm shadow-md" viewTransition>
              Sesiones en directo
            </Link>
          </div>
        </div>
      </div>
      <div className="card card-bordered max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title mx-auto">Productos</div>
          <h3 className="text-2xl font-bold mb-3">Edita tus productos</h3>
          <InfoAlert className="alert-warning">
            Estos cambios solo se aplicarán en <span className="font-bold">La Flor Blanca</span> y serán visibles en tu tienda online. Ningún cambio será
            applicado en <span className="font-bold">Stripe</span>.
          </InfoAlert>
          <p>Ahora en cada producto puedes editar lo siguiente:</p>
          <ul className="list-disc list-inside font-semibold">
            <li>Precio</li>
            <li>Descripción</li>
            <li>Info</li>
          </ul>
          <h3 className="text-xl font-bold mb-3">Precio</h3>
          <p className="mb-4">El precio seleccionado debe de ser en céntimos. Por ejemplo, para £10 deber de poner 1000.</p>
          <h3 className="text-xl font-bold mb-3">Descripción</h3>
          <p className="mb-4">La descripción del producto.</p>
          <Link to={"products"} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Productos
          </Link>
        </div>
      </div>
      <div className="card card-bordered max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title mx-auto">Pedidos</div>
          <h3 className="text-xl font-bold mb-3">Cambia el status de un pedido</h3>
          <InfoAlert>
            Estos cambios solo se aplicarán en <span className="font-bold">La Flor Blanca</span>. Ningún cambio será applicado en{" "}
            <span className="font-bold">Stripe</span>.
          </InfoAlert>
          <p>Marca un pedido como "Completado":</p>
          <p className="mb-4">En la sección de pedidos pincha en el botón con el icono ✔️.</p>
          <Link to={"orders"} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
