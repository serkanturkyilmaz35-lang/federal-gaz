import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Galeri - Federal Gaz | Ürün ve Hizmet Görselleri",
    description: "Federal Gaz ürün ve hizmet galerimiz. Endüstriyel gaz tüpleri, medikal oksijen, argon, azot ve diğer gaz ürünlerimizin görselleri.",
    keywords: [
        "federal gaz galeri",
        "gaz tüpü görselleri",
        "endüstriyel gaz resimleri",
        "medikal oksijen tüpü",
        "federal gaz ürün görselleri"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/galeri',
    },
    openGraph: {
        title: "Galeri - Federal Gaz",
        description: "Federal Gaz ürün ve hizmet galerimiz.",
        url: 'https://federalgaz.com/galeri',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function GaleriLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
