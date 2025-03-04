import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Section,
    Text,
    Tailwind,
    render,
    Link,
    Img,
} from "@react-email/components";
import ShiningLogo from "./components/logo";
import { href } from "react-router";
import type { SubscriptionPlan } from "~/integrations/stripe";


interface NewSubscriptionEmailProps {
    planData: SubscriptionPlan;
    username?: string;
}

const baseUrl = process.env.RENDER_URL
    ? process.env.RENDER_URL : `https://laflorblanca-ysjl.onrender.com`

const NewSubscriptionEmail = ({ planData, username }: NewSubscriptionEmailProps) => {

    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] text-center mb-8">
                            <ShiningLogo />
                            <Text className="text-center text-black text-2xl leading-[24px]">
                                Bienvenido a <strong>{planData.name}</strong>
                            </Text>
                            <Img
                                className="rounded-md object-cover mx-auto"
                                src={planData.img}
                                width="64"
                                height="64"
                            />
                        </Section>

                        <Text></Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hola {username},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            gracias por tu suscripción, ya eres un miembro más 🎉.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Cominza a disfrutar de nuestro contenido cuanto antes..
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#9d67e9] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-2 shadow"
                                href={`${baseUrl}/${href("/members")}`}
                            >
                                Visita el Rincón de Miembros
                            </Link>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This email was intended for{" "}
                            <span className="text-black">{username}</span>.
                            If you were not expecting this invitation, you can ignore this email. If
                            you are concerned about your account's safety, please reply to
                            this email to get in touch with us.
                        </Text>
                        <Img
                            src={`${baseUrl}/static/logo.svg`}
                            width="32"
                            height="32"
                            className="rounded object-cover aspect-square"
                            alt="Logo"
                        />
                        <Text >
                            <Link
                                href="https://laflorblanca.com"
                                target="_blank"
                            >
                                laflorblanca.com
                            </Link>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};




export function renderNewSubscriptionEmail({ planData, username }: NewSubscriptionEmailProps) {
    return render(<NewSubscriptionEmail planData={planData} username={username} />)
}
