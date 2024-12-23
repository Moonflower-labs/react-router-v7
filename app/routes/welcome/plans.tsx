import { Form } from "react-router";
import type { Route } from "./+types/plans";

export default function SubscriptionPlans({ }: Route.ComponentProps) {
    return (
        <main className="text-center mb-8" id="plans">
            <h1 className="text-4xl py-8 text-primary font-bold">Planes de Suscripción</h1>
            <p className="text-xl max-w-screen-sm py-8 px-3 mx-auto">La Flor Blanca consiste en tres planes de subscripción. Cada uno te dará acceso a contenido diferente y podrás realizar distintos tipos de preguntas.</p>
            <div className="grid md:grid-cols-2 gap-4 mx-auto pb-3 justify-items-center">
                <div className="card bg-neutral-content/10 w-[95%] max-w-[30rem] shadow-xl">
                    <figure className="px-10 pt-10">
                        <img src={"/plan-personality.jpeg"} alt="" className="rounded-xl" />
                    </figure>
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">PERSONALIDAD</h2>
                        <hr className="border border-purple-600/40 mt-3 w-[80%] mx-auto" />
                        <ul className="text-start p-3">
                            <li>👁 Precio Gratis</li>
                            <li>👁 Puedes cancelar o cambiar de Plan en cualquier momento</li>
                            <li>👁 Renovación automática</li>
                            <li>👁 Respuesta a tus Preguntas por escrito o audio sin incluir ningún dato personal</li>
                            <li>👁 Acceso desde cualquier lugar, dispositivo y en todo momento</li>
                        </ul>
                        <div className="card-actions">
                            <Form method="get" action={"/payments/subscribe"}>
                                <button className="btn btn-primary" type="submit" name="plan" value={"Personalidad"}>
                                    Comprar por £0
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>

                <div className="card bg-neutral-content/10 w-[95%] max-w-[30rem] shadow-xl">
                    <figure className="px-10 pt-10">
                        <img src={"/plan-soul.jpeg"} alt="" className="rounded-xl" />
                    </figure>
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">ALMA</h2>
                        <hr className="border border-purple-600/40 mt-3  w-[80%] mx-auto" />
                        <ul className="text-base text-start p-3">
                            <li>👁 Precio £9.95</li>
                            <li>👁 Puedes cancelar o cambiar de Plan en cualquier momento</li>
                            <li>👁 Renovación automática</li>
                            <li>👁 Respuesta a tus Preguntas por audio o video sin incluir ningún dato personal</li>
                            <li>👁 Contenido sorpresa</li>
                            <li>👁 Una pregunta al mes de tarot</li>

                            <li>👁 Acceso a contenido especial por escrito, en audio o video desde cualquier lugar, dispositivo y en cualquier momento</li>
                        </ul>
                        <div className="card-actions">
                            <Form method="get" action={"/payments/subscribe"}>
                                <button className="btn btn-primary" type="submit" name="plan" value={"Alma"}>
                                    Comprar por £9,95/mes
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>

                <div className="col-span-full">
                    <div className="card bg-neutral-content/10 w-[95%] max-w-[30rem] shadow-xl mx-auto">
                        <figure className="px-10 pt-10">
                            <img src={"/plan-spirit.jpeg"} alt="" className="rounded-xl" />
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">ESPÍRITU</h2>
                            <hr className="border border-purple-600/40 mt-3  w-[80%] mx-auto" />
                            <ul className="text-base text-start p-3">
                                <li>👁 Precio £14.95</li>
                                <li>👁 Puedes cancelar o cambiar de Plan en cualquier momento</li>
                                <li>👁 Renovación automática</li>
                                <li>👁 Respuesta a tus Preguntas por audio, video o en directo sin incluir ningún dato personal</li>

                                <li>👁 Contenido sorpresa</li>
                                <li>👁 Sesiones en directo</li>
                                <li>👁 Acceso a contenido especial por escrito, en audio, video o en directo desde cualquier lugar, dispositivo y en cualquier momento</li>
                            </ul>
                            <div className="card-actions">
                                <Form method="get" action={"/payments/subscribe"}>
                                    <button className="btn btn-primary" type="submit" name="plan" value={"Espíritu"}>
                                        Comprar por £14,95/mes
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
