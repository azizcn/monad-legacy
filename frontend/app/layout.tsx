import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "Monad Testament - Digital Mirasınızı Koruyun",
    description: "Monad blockchain üzerinde dijital vasiyet oluşturun ve mirasınızı güvence altına alın.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className="antialiased">
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#0A0A0A",
                                color: "#fff",
                                border: "1px solid #DC2626",
                            },
                            success: {
                                iconTheme: {
                                    primary: "#DC2626",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: "#991B1B",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
