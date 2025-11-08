import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#0ea5e9",
            colorText: "#f8fafc",
            colorTextSecondary: "#cbd5e1",
            colorBackground: "#1e293b",
            colorInputBackground: "#0f172a",
            colorInputText: "#f8fafc",
          },
          elements: {
            card: "shadow-lg",
            headerTitle: "!text-slate-100",
            headerSubtitle: "!text-slate-300",
            formButtonPrimary: "!bg-sky-500 hover:!bg-sky-600 !text-white",
            formFieldLabel: "!text-slate-100",
            formFieldInput: "!bg-slate-900 !text-slate-100 !border-slate-700",
            footerActionLink: "!text-sky-500 hover:!text-sky-400",
            socialButtonsBlockButton: "!bg-slate-700 !text-slate-100 !border-slate-600 hover:!bg-slate-600",
            dividerLine: "!bg-slate-600",
            dividerText: "!text-slate-400",
          }
        }}
      />
    </div>
  )
}
