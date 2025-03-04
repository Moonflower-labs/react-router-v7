import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Tailwind,
    Text,
    render
} from "@react-email/components";
import ShiningLogo from "./components/logo";

interface ResetPasswordLinkEmailProps {
    resetPasswordLink?: string;
    email: string
}

const baseUrl = process.env.RENDER_URL
    ? process.env.RENDER_URL : `https://laflorblanca-ysjl.onrender.com`


export const ResetPasswordLinkEmail = ({
    resetPasswordLink, email
}: ResetPasswordLinkEmailProps) => (
    <Html>
        <Head />
        <Tailwind>
            <Preview>Log in with this magic link</Preview>
            <Body >
                <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                        <ShiningLogo />
                    </Heading>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Has recibido este email para resetar tu contraseña.
                    </Text>
                    <Link href={resetPasswordLink} target="_blank" >
                        Pincha aquí para resetear tu contraseña.
                    </Link>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Si el link no funciona, copialo y pégalo en tu navegador:
                    </Text>
                    <code className="rounded-md inline-block p-6 bg-neutral-100 text-gray-400">{resetPasswordLink}</code>
                    <Text className="text-black text-[14px] leading-[24px]">
                        If you didn&apos;t try to login, you can safely ignore this email.
                    </Text>

                    <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                    <Text className="text-[#666666] text-[12px] leading-[24px]">
                        This email was intended for{" "}
                        <span className="text-black">{email}</span>.
                        If you are concerned about your account's safety, please reply to
                        this email to get in touch with us.
                    </Text>
                    <Img
                        src={`/static/logo.svg`}
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




export function renderResetPasswordEmail({ resetPasswordLink, email }: ResetPasswordLinkEmailProps) {
    return render(<ResetPasswordLinkEmail resetPasswordLink={resetPasswordLink} email={email} />)
}
