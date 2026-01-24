import React from "react";
import Topbar from "@/components/dashboard/topbar/topbar";
import LeftBar from "@/components/dashboard/leftbar/LeftBar";

export default function RootLayout({
   children,
   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Topbar/>
            {/* flex-1 makes this div take up all REMAINING space */}
            <div className="flex flex-1 overflow-hidden">
                <div>
                    <LeftBar/>
                </div>
                <main className={"flex-1 overflow-hidden"}>
                    {children}
                </main>
            </div>
        </div>
    );
}