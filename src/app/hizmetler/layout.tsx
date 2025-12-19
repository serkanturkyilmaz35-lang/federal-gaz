import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Hizmetlerimiz - Federal Gaz | Gaz Dolum ve Dağıtım",
    description: "Federal Gaz hizmetleri: Medikal gaz tedariki, endüstriyel gaz dolumu, kaynak gazları, gıda gazları ve özel gaz karışımları. Ankara ve Türkiye genelinde profesyonel hizmet.",
    keywords: [
        "gaz dolum hizmeti",
        "endüstriyel gaz dağıtım",
        "medikal gaz tedarik",
        "kaynak gazı hizmeti",
        "federal gaz hizmetler",
        "ankara gaz dolum"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/hizmetler',
    },
    openGraph: {
        title: "Hizmetlerimiz - Federal Gaz",
        description: "Medikal gaz tedariki, endüstriyel gaz dolumu ve profesyonel gaz çözümleri.",
        url: 'https://federalgaz.com/hizmetler',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function HizmetlerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
