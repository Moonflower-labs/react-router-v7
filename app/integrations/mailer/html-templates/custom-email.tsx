import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Section,
    Text,
    Tailwind,
    render,
    Link,
} from "@react-email/components";
import ShiningLogo from "./components/logo";


interface CustomEmailProps {
    username?: string;
    text: string;
    subject: string;
    links?: { name: string, url: string }[];
}

const baseUrl = process.env.RENDER_URL
    ? process.env.RENDER_URL : `https://laflorblanca-ysjl.onrender.com`

const CustomEmail = ({ username, text, subject, links }: CustomEmailProps) => {

    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] px-4 mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] flex justify-center mx-auto">
                            <ShiningLogo />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            {subject}
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hola {username},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] whitespace-pre-wrap">
                            {text}
                        </Text>
                        <Section>
                            {links && links?.length > 0 && (
                                <ul className="flex flex-col gap-3">
                                    {links?.map((link, i) => (
                                        <li key={i}>
                                            <Link href={link.url} className="text-[#9d67e9] rounded underline text-center px-4 py-3">{link.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This invitation was intended for{" "}
                            <span className="text-black">{username}</span>.
                            If you are concerned about your account's safety, please reply to
                            this email to get in touch with us.
                        </Text>
                        <Img
                            src={`${baseUrl}/logo.svg`}
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


export default CustomEmail;



export function renderCustomEmail({ username, text, subject, links }: CustomEmailProps) {
    return render(<CustomEmail username={username} text={text} subject={subject} links={links} />)
}
