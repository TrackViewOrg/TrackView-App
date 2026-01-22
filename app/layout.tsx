import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import {SubscriptionOverlay} from "@/components/subscription-overlay";

// 👇 THIS LINE FIXES THE CACHING ISSUE
export const dynamic = "force-dynamic";

const geistSans = Space_Grotesk({
    variable: "--font-space",
    subsets: ["latin"],
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "700"],
});

// Fix 1: Added weight property (Instrument Serif usually only supports 400)
const instrumentSerif = Instrument_Serif({
    variable: "--font-serif",
    subsets: ["latin"],
    weight: "400",
});

const archivo = localFont({
    src: [
        {
            path: "../public/fonts/Archivo-SemiExpanded-Medium.ttf",
            weight: "500",
            style: "normal",
        },
        {
            path: "../public/fonts/Archivo-SemiExpanded-Bold.ttf",
            weight: "700",
            style: "normal",
        },
        {
            path: "../public/fonts/Archivo-SemiExpanded-Black.ttf",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-archivo",
});

export const metadata: Metadata = {
    title: "TrackView",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile = null;

    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        profile = data;
    }

    return (
        <html lang="en" suppressHydrationWarning>
        {/* Fix 2: Added instrumentSerif.variable to the class list */}
        <body
            className={`${geistSans.variable} ${spaceMono.variable} ${archivo.variable} ${instrumentSerif.variable} antialiased font-archivo selection:bg-[#dff976] selection:text-background`}
        >
        <UserProvider initialUser={user} initialProfile={profile}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SubscriptionOverlay />
                <main className={"h-screen"}>{children}</main>
                <Toaster />
            </ThemeProvider>
        </UserProvider>
        </body>
        </html>
    );
}