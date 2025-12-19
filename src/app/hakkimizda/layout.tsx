import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Hakkımızda - Federal Gaz | Ankara Gaz Tedarikçisi",
    description: "Federal Gaz olarak endüstriyel gaz sektöründe uzun yıllara dayanan tecrübemizle, müşterilerimize güvenilir ve yüksek kaliteli çözümler sunmaktadır. Ankara ve Türkiye genelinde gaz tedarik hizmeti.",
    keywords: [
        "federal gaz hakkında",
        "ankara gaz şirketi",
        "endüstriyel gaz tedarikçisi",
        "gaz firması ankara",
        "federal gaz tarihçe"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/hakkimizda',
    },
    openGraph: {
        title: "Hakkımızda - Federal Gaz",
        description: "Federal Gaz olarak endüstriyel gaz sektöründe uzun yıllara dayanan tecrübemizle güvenilir çözümler sunuyoruz.",
        url: 'https://federalgaz.com/hakkimizda',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function HakkimizdaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
