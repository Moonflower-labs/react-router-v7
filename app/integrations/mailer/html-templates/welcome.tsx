import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Row,
  Section,
  Text,
  Tailwind,
  render,
  Link,
} from "@react-email/components";
import ShiningLogo from "./components/logo";
import { href } from "react-router";


interface WelcomeUserEmailProps {
  username?: string;
}

const baseUrl = process.env.RENDER_URL
  ? process.env.RENDER_URL : `https://laflorblanca-ysjl.onrender.com`

const WelcomeUserEmail = ({ username }: WelcomeUserEmailProps) => {

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
              Bienvenido a <strong className="text-purple-500">La Flor Blanca</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hola {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              gracias por registrarte en nuestra plataforma. El siguiente paso es elegir tu plan de suscripción para poder empezar a disfrutar del contenido.
            </Text>
            <Section>
              <Row>
                <Column align="center" width={200}>
                  <Img
                    className="rounded-md"
                    src={`${baseUrl}/icons/plan-personality.svg`}
                    width="64"
                    height="64"
                  />
                  <Text><strong>Personalidad</strong></Text>
                </Column>
                <Column align="center" width={200}>
                  <Img
                    className="rounded-md aspect-video object-cover"
                    src={`${baseUrl}/icons/plan-soul.svg`}
                    width="64"
                    height="64"
                  />
                  <Text><strong>Alma</strong></Text>
                </Column>
                <Column align="center" width={200}>
                  <Img
                    className="rounded-md"
                    src={`${baseUrl}/icons/plan-spirit.svg`}
                    width="64"
                    height="64"
                  />
                  <Text><strong>Espíritu</strong></Text>
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#9d67e9] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`${baseUrl}${href("/plans")}`}
              >
                Suscríbete
              </Button>
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



export function renderWelcomeEmail({ username }: WelcomeUserEmailProps) {
  return render(<WelcomeUserEmail username={username} />)
}
