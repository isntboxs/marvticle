import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface PasswordResetEmailProps {
  appUrl: string
  resetUrl: string
  userEmail: string
  userName: string
}

export const PasswordResetEmail = (props: PasswordResetEmailProps) => {
  const { appUrl, resetUrl, userEmail, userName } = props

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Reset your Marvticle password</Preview>
        <Body className="bg-[#F6F8FA] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[12px] border border-solid border-[#E5E7EB] bg-[#FFFFFF]">
            {/* Header */}
            <Section className="px-[48px] pt-[48px] pb-[32px] text-center">
              <Img
                src="https://article.marvagency.net/marv-logo.svg"
                width="56"
                height="56"
                alt="Marvticle"
                className="mx-auto mb-[24px]"
              />
              <Heading className="m-0 mb-[8px] text-[28px] leading-[36px] font-bold text-[#020304]">
                Reset Your Password
              </Heading>
              <Text className="m-0 text-[16px] leading-[24px] text-[#6B7280]">
                Secure access to your Marvticle account
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[48px] pb-[48px]">
              <Text className="m-0 mb-[20px] text-[16px] leading-[26px] text-[#020304]">
                Hello, {userName}
              </Text>

              <Text className="m-0 mb-[20px] text-[16px] leading-[26px] text-[#020304]">
                We received a request to reset the password for your Marvticle
                account associated with <strong>{userEmail}</strong>.
              </Text>

              <Text className="m-0 mb-[36px] text-[16px] leading-[26px] text-[#020304]">
                Click the button below to create a new password. This link will
                expire in 1 hour for security reasons.
              </Text>

              {/* Reset Button */}
              <Section className="my-[36px] text-center">
                <Button
                  href={resetUrl}
                  className="box-border inline-block rounded-[8px] bg-[#020304] px-[40px] py-[16px] text-[16px] font-semibold text-white no-underline transition-colors hover:bg-[#1a1a1a]"
                >
                  Reset Password
                </Button>
              </Section>

              {/* Security Notice */}
              <Section className="mb-[32px]">
                <Text className="m-0 rounded-[8px] border border-solid border-[#E5E7EB] bg-[#F6F8FA] p-[20px] text-[14px] leading-[22px] text-[#020304]">
                  <strong>Alternative access:</strong> If the button doesn't
                  work, copy and paste this link into your browser:
                  <br />
                  <Link
                    href={resetUrl}
                    className="mt-[8px] inline-block break-all text-[#020304] underline"
                  >
                    {resetUrl}
                  </Link>
                </Text>
              </Section>

              <Text className="m-0 mb-[24px] text-[16px] leading-[26px] text-[#020304]">
                If you didn't request this password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </Text>

              <Text className="m-0 text-[16px] leading-[26px] text-[#020304]">
                Keep writing what matters,
                <br />
                <strong>The Marvticle Team</strong>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-solid border-[#E5E7EB] bg-[#F9FAFB] px-[48px] py-[32px]">
              <Text className="m-0 mb-[20px] text-center text-[14px] leading-[22px] text-[#6B7280]">
                This email was sent to <strong>{userEmail}</strong> because you
                requested a password reset for your Marvticle account.
              </Text>

              <Text className="m-0 mb-[20px] text-center text-[14px] leading-[22px] text-[#6B7280]">
                <Link
                  href={appUrl}
                  className="text-[#020304] no-underline hover:underline"
                >
                  Visit Marvticle
                </Link>
                <span className="mx-[8px]">•</span>
                <Link
                  href={`${appUrl}/support`}
                  className="text-[#020304] no-underline hover:underline"
                >
                  Get Help
                </Link>
                <span className="mx-[8px]">•</span>
                <Link
                  href={`${appUrl}/privacy`}
                  className="text-[#020304] no-underline hover:underline"
                >
                  Privacy Policy
                </Link>
              </Text>

              <Text className="m-0 text-center text-[12px] leading-[18px] text-[#9CA3AF]">
                &copy; {new Date().getFullYear()} Marvticle • Write Anything
                That Matters
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
