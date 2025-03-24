import { href, Link } from "react-router";
import { CustomAlert } from "~/components/shared/info";

export default function Admin() {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center gap-12 pt-8 mb-4">
      <h1 className="text-4xl font-bold text-primary my-4">Bienvenida a tu Admin Panel</h1>
      <CustomAlert level="warning" className="alert-warning">
        <span>Este documento no está terminado. Alguna de la información puede ser incorrecta!</span>
      </CustomAlert>
      <p>A continuación el sumario de acciones/operaciones disponibles en el panel.</p>
      <div className="card w-full max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title text-2xl mm-2">Contenido</div>
          <p>Administra el contenido de las secciones de Personalidad, Alma y espíritu.</p>
          <p>En cada sección podrás crear,editar o eliminar posts, videos ...</p>
          <h3 className="text-lg font-bold mb-3">Borrador y Publicación</h3>
          <CustomAlert level="info">
            Esta opción solo está disponible para posts o videos.
            <div>No es aplicable a categorias o sesiones.</div>
          </CustomAlert>

          <p>A la hora de crear tienes dos opciones.</p>
          <ul className="list-disc list-inside font-semibold">
            <li>Borrador</li>
            <li>Público</li>
          </ul>
          <p>
            A la hora de crear un post or video, pincha en "borrador" si no quieres que el contenido esté disponible en la página. O usa la opción de "publicar"
            y el contenido estará disponible para los usuarios inmediatamente.
          </p>
        </div>
      </div>
      <div className="card w-full max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title text-2xl mb-2">Productos</div>
          <h3 className="font-bold mb-3">Crea y Edita tus productos</h3>
          <CustomAlert level="warning">
            Estos cambios solo se aplicarán en <span className="font-bold">La Flor Blanca</span> y serán visibles en tu tienda online. Ningún cambio será
            applicado en <span className="font-bold">Stripe</span>.
          </CustomAlert>
          <p>Para crear producto necesitas lo siguiente:</p>
          <ul className="list-disc list-inside font-semibold px-4">
            <li>Nombre</li>
            <li>Descripción</li>
            <li>Imagen (sube tu imagen o elige una imagen existente)</li>
            <li>Activo (si no es activo no saldrá en la tienda)</li>
          </ul>
          <p>Ahora en cada producto puedes editar lo siguiente:</p>
          <ul className="list-disc list-inside font-semibold px-4">
            <li>
              Precios (ańade y/o edita):
              <ul className="list-decimal list-inside ms-4 font-semibold">
                <li>Cantidad: debe de ser en céntimos. Por ejemplo, para £10 debes de poner 1000.</li>
                <li>Info: la información sobre ese precio, color, tamño...</li>
              </ul>
            </li>
            <li>Descripción: La descripción del producto.</li>
            <li>Info</li>
            <li>Imagen</li>
          </ul>
          <h3 className="text-xl font-bold mb-3">Precio</h3>
          <p className="mb-4">Añade precios en la página del producto.</p>
          <CustomAlert>
            Productos y Precios No activos no saldran en la tienda.
          </CustomAlert>

          <Link to={href("/admin/products")} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Productos
          </Link>
        </div>
      </div>
      <div className="card w-full max-w-screen-md shadow">
        <div className="card-body">
          <div className="card-title text-2xl mb-2">Pedidos</div>
          <h3 className="text-xl font-bold mb-3">Cambia el status de un pedido</h3>
          <CustomAlert>
            Estos cambios solo se aplicarán en <span className="font-bold">La Flor Blanca</span>. Ningún cambio será applicado en{" "}
            <span className="font-bold">Stripe</span>.
          </CustomAlert>
          <p>Marca un pedido como "Procesado":</p>
          <p>En la sección de pedidos pincha en el botón con el icono ✔️.</p>
          <p className="mb-4">El usuario podrá ver el estado.</p>
          <Link to={href("/admin/orders")} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Pedidos
          </Link>
        </div>
      </div>
      <div className="card w-full max-w-screen-md shadow">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-2">Imágenes</h2>
          <p className="font-bold mb-3">Sube fotos a la sección de Susurros o Avatars.</p>
          <CustomAlert>
            <p>También puedes eliminar imágenes de cada sección, también de Productos.</p>
          </CustomAlert>
          <Link to={href("/admin/gallery/upload")} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Subir Imagen
          </Link>
        </div>
      </div>
      {/* Emails */}
      <div className="card w-full max-w-screen-md shadow">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-2">Emails</h2>
          <p className="font-bold mb-3">Envía un email de grupo a todos los usuarios de un plan determinado.</p>
          <p className="font-bold">1. Proporciona lo siguiente:</p>
          <ul className="list-disc list-inside px-4">
            <li>Asunto: el asunto del email.</li>
            <li>Texto: el mensaje</li>
            <li>Links (opcional): genera links proporcionando la url y un nombre que verá el usuario.</li>
            <li>Plan (elige el Plan al que quieres enviar el email)</li>
          </ul>
          <p className="font-bold">2. Pincha en "Generar Preview" y verás una preview del email</p>
          <p className="font-bold">3. Pincha "confirmar y enviar".</p>
          <CustomAlert>
            <p>Todos los emails comienzan con: "Hola [nombre de usuario],".
              <br />
              No necesitas escribirlo 😎.</p>
          </CustomAlert>

          <Link to={href("/admin/emails/group-send")} className="btn  btn-primary btn-outline btn-sm shadow-md m-auto" viewTransition>
            Eviar email de grupo
          </Link>
        </div>
      </div>
    </div>
  );
}
