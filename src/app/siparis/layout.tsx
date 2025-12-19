import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Online Sipariş - Federal Gaz | Gaz Tüpü Sipariş",
    description: "Federal Gaz online sipariş sistemi. Oksijen, argon, azot, CO2 ve diğer endüstriyel gaz tüplerini kolayca sipariş edin. Ankara ve çevresine hızlı teslimat.",
    keywords: [
        "gaz tüpü sipariş",
        "online gaz sipariş",
        "oksijen tüpü sipariş",
        "federal gaz sipariş",
        "ankara gaz sipariş",
        "endüstriyel gaz satın al"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/siparis',
    },
    openGraph: {
        title: "Online Sipariş - Federal Gaz",
        description: "Endüstriyel gaz tüplerini online olarak kolayca sipariş edin.",
        url: 'https://federalgaz.com/siparis',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function SiparisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
