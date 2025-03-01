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
} from "@react-email/components";
import ShiningLogo from "./components/logo";
import type { ExtendedOrder } from "~/models/order.server";
import { href } from "react-router";


interface NewOrderEmailProps {
    order: ExtendedOrder;
    username?: string;
}

const baseUrl = process.env.RENDER_URL
    ? `https://laflorblanca-ysjl.onrender.com`
    : "";

const NewOrderEmail = ({ order, username }: NewOrderEmailProps) => {

    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] text-center">
                            <ShiningLogo />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            <strong className="text-purple-500">La Flor Blanca</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hola {username},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            gracias por tu pedido. Hemos recibido el pago y está en proceso.
                        </Text>
                        <Section>
                            {order.orderItems.map((item, index) =>
                                <Text key={item.id} className="text-black text-[14px] leading-[24px]">
                                    {index + 1}. {item.product.name} {item.price.info} {item.quantity} x £{item.price.amount / 100}
                                </Text>
                            )}

                        </Section>
                        <Section>
                            <Text className="text-black text-[14px] leading-[24px]">
                                Gastos Postales
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px]">
                                £{order?.shippingRate?.amount}
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px]">
                                {order?.shippingRate?.displayName}
                            </Text>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#9d67e9] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${baseUrl}/${href("/profile/orders/:orderId", { orderId: order.id })}`}
                            >
                                Ver pedido
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
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};


export default NewOrderEmail;



export function renderNewOrderEmail({ order, username }: NewOrderEmailProps) {
    return render(<NewOrderEmail order={order} username={username} />)
}
