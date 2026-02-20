import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
    title: "TalentScout – AI-Powered Hiring Assistant",
    description: "Conduct adaptive, conversational AI interviews that feel real. Automate your technical screening with precision.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <Navbar />
                <main style={{ paddingTop: 80 }}>
                    {children}
                </main>
                {/* Extra animated background blobs */}
                <div className="bg-blob bg-blob-1" />
                <div className="bg-blob bg-blob-2" />
            </body>
        </html>
    );
}
