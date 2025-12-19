import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "İletişim - Federal Gaz | Ankara Gaz Tedarik İletişim",
    description: "Federal Gaz ile iletişime geçin. Ankara ve çevresinde endüstriyel gaz, medikal oksijen, argon, azot tüp satış ve dolum hizmetleri için bize ulaşın.",
    keywords: [
        "federal gaz iletişim",
        "ankara gaz iletişim",
        "gaz tüp satış ankara",
        "federal gaz telefon",
        "endüstriyel gaz sipariş"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/iletisim',
    },
    openGraph: {
        title: "İletişim - Federal Gaz",
        description: "Ankara ve çevresinde endüstriyel gaz hizmetleri için Federal Gaz ile iletişime geçin.",
        url: 'https://federalgaz.com/iletisim',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function IletisimLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
