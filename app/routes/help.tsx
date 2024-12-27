import { useActionState, useTransition } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/help";

async function search(_: any, formData: FormData) {
  let searchTerm = formData.get("search") as string
  console.log(searchTerm)
  await new Promise((res) => setTimeout(res, 250))
  if (!searchTerm) return questions;

  return questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );
}


export default function HelpPage({ }: Route.ComponentProps) {
  let [, startTransition] = useTransition()
  let [data, action, pending] = useActionState(search, questions)


  return (
    <div className="mx-2 mb-4">
      <h1 className="text-4xl text-center pt-4 text-primary mb-8 font-semibold">Página de ayuda</h1>
      <p className="mb-4 mx-auto text-center">A continuación están las preguntas y soluciones más frecuentes:</p>
      <form action={action}>
        <label htmlFor="search" className="input input-bordered input-sm mb-4 flex items-center gap-2 max-w-sm mx-auto">
          <input type="text" name="search" className="grow" id="search" placeholder="Search"
            onChange={(e) => {
              startTransition(() => {
                action(new FormData(e.currentTarget.form!, null))
              })
            }}
          />
          {pending && <span className="loading loading-spinner loading-xs"></span>}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
      </form>

      <div className="flex flex-col gap-3 md:w-2/3 mx-auto">
        {data && data.map((q, index) => (
          <div key={q.id} className="collapse collapse-arrow shadow-lg p-4">
            <input type="radio" name="my-accordion-2" className="grow text-base" />
            <div className="collapse-title text-xl font-medium">
              {index + 1}. {q.question}
            </div>
            <div className="collapse-content">
              <p>{q.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const questions = [
  {
    id: 1,
    question: "¿Porqué no puedo acceder a la sección Preguntas? 😔",
    answer: (
      <>
        No escogiste ninguno de los tres planes de suscripción aunque sea el gratuito que es el Plan Personalidad.
      </>
    )
  },
  {
    id: 2,
    question: "¿Porqué no consigo entrar en la Tienda? 😔",
    answer: (
      <>
        Necesitas ser miembro: registrarte en la página y escoger uno de los tres Planes (Personalidad, Alma o Espíritu) o iniciar sesión si ya te registraste con uno de los tres Planes para poder disfrutar de los descuentos y/o ofertas.
      </>
    )
  },
  {
    id: 3,
    question: "¿Porqué no consigo entrar en Rincón de Miembros? 😔",
    answer: (
      <>
        Necesitas suscribirte como mínimo al plan Personalidad, que es gratuito, para tener acceso a formular tus preguntas y al contenido.
        Comprueba los planes de subscripción <Link to={"/plans"} className="link link-primary">aquí</Link>.
      </>
    )
  },
  {
    id: 4,
    question: "¿Porqué no consigo entrar en la sección Tarot? 😞",
    answer: (
      <>
        La sección del Tarot está incluida sólo en los Planes de pago Alma y Espíritu. Si estás en el plan Personalidad o sólo eres miembro de la página no tendrás acceso a este servicio.
      </>
    )
  },
  {
    id: 5,
    question: "¿Porqué no consigo entrar en la Sesión en Directo? 😔",
    answer: (
      <>
        Necesitas estar suscrito al Plan Espíritu. Este servicio es exclusivo de este plan.
      </>
    )

  },
  {
    id: 6,
    question: "¿Porqué no consigo entrar en las secciones de Alma o Espíritu? 😔",
    answer: (
      <>
        Necesitas suscribirte a estos planes Alma o Espíritu, que son de pago, para acceder a los servicios y beneficios que te ofrecen.
      </>
    )
  },
  {
    id: 7,
    question: "¿Cómo cambio mi dirección y datos personales? 🤔",
    answer: (
      <>
        Debes ir a tu <Link to={"/profile"} className="link link-primary">perfil</Link>. En la sección de Datos Personales.
      </>
    )
  },
  {
    id: 8,
    question: "¿Qué significa que mi plan se cancela? 🤔",
    answer: (
      <>
        Qué se paraliza la renovación automática de tu plan en la fecha indicada. Qué se suspenden los pagos o la suscripción gratuita definitivamente y necesitarás suscribirte de nuevo a alguno de los tres planes."
      </>
    )
  },
  {
    id: 9,
    question: "¿Qué significa cero preguntas disponibles? 🤔",
    answer: (
      <>
        Que utilizaste el máximo permitido de preguntas para ese mes. Esto se renovará automáticamente el primer día de cada mes y volverás a disfrutar de nuevo de más preguntas.
      </>
    )
  },
  {
    id: 10,
    question: "¿Las preguntas no usadas durante un ciclo mensual se acumulan para el mes siguiente? 🤔",
    answer: (
      <>
        No. Si no usas las Preguntas disponibles en el mes en vigor se pierden. Pero se renuevan al mes siguiente, el primer día de cada mes.
      </>
    )
  },
  {
    id: 11,
    question: "¿Cuánto tiempo se tarda en recibir las respuestas? 😃",
    answer: (
      <>
        Depende de por cual via se responda: por escrito entre 24 y 48 horas. Por audio entre 48 y 72 horas, por video entre 3 a 5 días aproximadamente.

      </>
    )
  },
  {
    id: 12,
    question: "¿Dónde voy a recibir mi respuesta? 😃",
    answer: (
      <>
        Las respuestas serán integradas en el plan de dónde fueron recibidas. Por ejemplo, si formas parte del plan Personalidad tu respuesta será integrada en el plan Personalidad, lo mismo sucederá si formas parte del plan Alma o Espíritu; recibirás tus respuestas dentro de estos planes respectivamente. Deberás iniciar sesión para acceder a la respuesta. Las respuestas de Tarot son las únicas que serán enviadas de manera privada al email que se usó durante la suscripción.
      </>
    )
  },
  {
    id: 13,
    question: "¿Por qué no me llega mi pedido? 😣",
    answer: (
      <>
        Asegúrate que escogiste el método de envío adecuado. Puede que seleccionaste la opción gratuita mi producto no necesita ser entregado 'Free my product doesn't need a delivery'. En ese caso nada te será enviado. Revisa tu email donde habrás recibido un enlace de pago con la diferencia a abonar para tu entrega o ponte en contacto con nosotros por email: admin@thechicnoir.com. Hasta que no recibimos el pago completo correspondiente de tu compra, no recibirás tu pedido.
      </>
    )
  },
  {
    id: 14,
    question: "¿Por qué los pagos de mi Plan de suscripción varían de precio entre un mes y otro? 🤑",
    answer: (
      <>
        Probablemente hayas cambiado o actualizado tu Plan en medio de tu facturación mensual y hayas transicionado de uno más caro a otro más económico. Ejemplo: pasar del Plan Espíritu a otro más económico Alma o pasar de Alma a Personalidad. Como el cambio de planes es efectivo inmediatamente, la diferencia de precio entre un Plan y otro se te queda en el balance de tu cuenta puesto que no hay devolución. Lo mismo que si accedes a un plan superior, de Alma a Espíritu, de un plan más económico a uno más caro se te cobraría sólo la diferencia de precio entre los días restantes de tu plan anterior más económico (Alma) y el precio del nuevo Plan (Espíritu) inmediatamente. Este exceso de balance o crédito de cambiar a un plan más económico se usa como descuento en tu siguiente facturación de tu Plan actual.
      </>
    )
  },
  {
    id: 15,
    question: "¿Cómo funciona la facturación mensual? 🙄",
    answer: (
      <>
        Incluye desde el día que te registraste hasta el mismo día del mes siguiente. Si te registraste a un Plan el 3 de Enero, la facturación mensual sería del 3 de Enero al 3 de Febrero del mes siguiente. Si escogiste tu Plan el 28 de Febrero, la facturación mensual sería del 28 de Febrero al 28 de Marzo del mes siguiente etc., etc.
      </>
    )
  },
  {
    id: 16,
    question: "¿Qué pasa cuando cambio de Plan? 🤔",
    answer: (
      <>
        Cuando actualizas tu Plan de suscripción tu facturación mensual cambia y empieza el día en que escogiste tu Nuevo Plan de suscripción hasta el mismo día del mes siguiente. Ejemplo: si empece con un plan inicial Espíritu el 3 de Enero, mi facturación terminaría el 3 de Febrero del mes siguiente. Si el 15 de Enero decido cambiar del Plan Espíritu a Alma; mi nueva facturación ya no termina el 3 de Febrero sino el 15 de Febrero del mes siguiente con mi Nuevo Plan Alma. Te cambiaría el periodo de facturación. Y el plan anterior Espíritu sería cancelado y automáticamente el crédito restante de tu Plan Espíritu pasaría a ser usado como descuento para tu nueva facturación mensual en Alma.
      </>
    )
  },
  {
    id: 17,
    question: "¿Por qué veo el mensaje 'nombre de usuario o email ya está registrado' al registrarme en la página? 😓",
    answer: (
      <>
        Primero, el email que usaste en el registro de la página ya está registrado por algún usuario o por ti mismo. Si ya te registraste debes ir a iniciar sesión y usar tu nuevo email y contraseña. Si olvidaste tu contraseña debes resetearla yendo a esa misma sección en Ayuda. Segundo, el nombre de usuario que usaste ya lo tiene otro usuario. Debes usar uno diferente para registrarte.
      </>
    )
  },
  {
    id: 18,
    question: "¿Cómo puedo ver el contenido de la página? 🙄",
    answer: (
      <>
        Debes registrarte en la página usando un nuevo nombre de usuario, email y contraseña. Después debes iniciar sesión usando tu email y contraseña que usaste en tu registro. Por último, debes escoger uno de los Planes Personalidad, Alma o Espíritu y estás dentro.
      </>
    )
  },
  {
    id: 19,
    question: "¿Cómo puedo dar mi opinión sobre algún contenido de la página o preguntar algo que no está en Ayuda? 🤔",
    answer: (
      <>
      </>
    )
  },
  {
    id: 20,
    question: "¿Por qué no recibo descuentos, ofertas, mis respuestas de Tarot o ningún tipo de comunicación? 😞",
    answer: (
      <>
        Posiblemente hayas cometido un error y te hayas registrado con un email que no existe, falso o que no corresponde a nadie. En este caso no podrás recibir ningún tipo de comunicación importante por parte de nosotros o de tus compras.
      </>
    )
  },
  {
    id: 21,
    question: "¿Cada cuanto tiempo recibiré emails o notificaciones? 😒",
    answer: (
      <>
        Lo menos posible y sólo si es estrictamente necesario. No molestaremos si no es para ofrecerte alguna ayuda. Recibirás emails una vez al mes si estás en el plan Alma o Espíritu y usas tu servicio de Tarot. Utilizaremos tu email de registro para responderte de una manera privada. También te notificaremos ocasionalmente si tenemos algún descuento que ofrecerte (y no serán muchos). Y si nos contactas por alguna razón educadamente te responderemos. No vas a sentir que existimos, incluso nos echarás de menos.
      </>
    )
  },
  {
    id: 22,
    question: "¿Cómo funciona la Bonificación o Bonus? 😃",
    answer: (
      <>
        Si el compartir es tu don serás recompensado por tu dedicación obteniendo una de las tres opciones: una pregunta de Tarot gratuita, acceso a un Directo gratuito o acceso a un episodio gratuito de tu interés de los disponibles en la Tienda por cada miembro que se suscriba por tu parte a los Planes de Alma o Espíritu. Si consigues un miembro para el plan Espíritu la bonificación o bonus es libre albedrío. Puedes escoger una opción cualquiera de entre las tres opciones gratuitas: una Pregunta de Tarot, acceso a un Directo o acceso a un episodio de tu interés en la Tienda. Hay trailers de los episodios en Lista de Podcast. Si consigues un miembro para el plan Alma la bonificación o el bonus sería: una pregunta de Tarot gratuita o acceso a un episodio gratuito de tu interés en la Tienda. Hay trailers de los episodios en Lista de Podcast. Si consigues tres miembros para el Plan Espíritu, tu bonificación sería acceso a un episodio gratuito de tu interés, más una pregunta de Tarot gratuita, más acceso a un Directo (si ya tienes acceso al directo se te puede canjear por dos episodios gratuitos de tu interés de la Tienda; que harían un total de tres episodios gratuitos más una pregunta de Tarot gratuita de bonificación o bonus). Hay trailers de los episodios en Lista de Podcast. Si consigues tres miembros para el Plan Alma tu bonificación o bonus lo puedes canjear por acceso a una session en Directo gratuita.
      </>
    )
  }
];
