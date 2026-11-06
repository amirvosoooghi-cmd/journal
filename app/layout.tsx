import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'I-Journal | Trading Performance',description:'A private trading journal and performance analytics workspace.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
