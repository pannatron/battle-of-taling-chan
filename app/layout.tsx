import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai"
})

export const metadata: Metadata = {
  title: "Battle of Taling Chan - TCG Deck Builder & Marketplace",
  description: "Thailand's premier trading card game community. Build decks, compete in tournaments, and trade cards.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#9d7ff7",
          colorBackground: "#0f0f14",
          colorInputBackground: "#1a1a23",
          colorInputText: "#f8f8f9",
          colorText: "#f8f8f9",
          colorTextSecondary: "#a1a1aa",
          colorSuccess: "#5dc5b6",
          colorDanger: "#f15959",
          colorWarning: "#dd7aeb",
          borderRadius: "1rem",
          fontFamily: '"Geist", sans-serif',
        },
        elements: {
          formButtonPrimary: 
            "bg-gradient-to-r from-[#9d7ff7] to-[#dd7aeb] hover:opacity-90 text-white font-semibold shadow-lg",
          card: "bg-[#1a1a23] border border-[#2a2a33] shadow-2xl backdrop-blur-xl",
          headerTitle: "text-[#f8f8f9] font-bold",
          headerSubtitle: "text-[#a1a1aa]",
          socialButtonsBlockButton: 
            "border border-[#2a2a33] hover:bg-[#dd7aeb]/10 text-[#f8f8f9] transition-all",
          socialButtonsBlockButtonText: "font-medium",
          formFieldLabel: "text-[#f8f8f9] font-medium",
          formFieldInput: 
            "bg-[#1a1a23] border border-[#2a2a33] text-[#f8f8f9] focus:border-[#9d7ff7] focus:ring-2 focus:ring-[#9d7ff7]/20",
          footerActionLink: "text-[#9d7ff7] hover:text-[#dd7aeb] font-medium",
          identityPreviewText: "text-[#f8f8f9]",
          identityPreviewEditButton: "text-[#9d7ff7] hover:text-[#dd7aeb]",
          dividerLine: "bg-[#2a2a33]",
          dividerText: "text-[#a1a1aa]",
          formHeaderTitle: "text-[#f8f8f9] font-bold",
          formHeaderSubtitle: "text-[#a1a1aa]",
          otpCodeFieldInput: "border-[#2a2a33] text-[#f8f8f9]",
          formResendCodeLink: "text-[#9d7ff7] hover:text-[#dd7aeb]",
          footer: "bg-transparent",
          // UserButton styling - comprehensive text color fixes
          userButtonPopoverCard: "bg-[#1a1a23] border border-[#2a2a33] shadow-2xl",
          userButtonPopoverActionButton: "text-[#f8f8f9] hover:bg-[#dd7aeb]/10",
          userButtonPopoverActionButtonText: "text-[#f8f8f9] !important",
          userButtonPopoverActionButtonIcon: "text-[#f8f8f9]",
          userButtonPopoverFooter: "bg-transparent border-t border-[#2a2a33]",
          userPreviewMainIdentifier: "text-[#f8f8f9] !important",
          userPreviewSecondaryIdentifier: "text-[#a1a1aa] !important",
          userButtonPopoverMain: "text-[#f8f8f9]",
          userButtonPopoverText: "text-[#f8f8f9]",
          profileSectionPrimaryButton: "text-[#f8f8f9]",
          menuItem: "text-[#f8f8f9] hover:bg-[#dd7aeb]/10",
          menuItemText: "text-[#f8f8f9]",
        },
      }}
    >
      <html lang="th" suppressHydrationWarning>
        <body className={`${notoSansThai.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            storageKey="theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
