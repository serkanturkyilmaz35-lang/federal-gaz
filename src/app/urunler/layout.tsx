import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Ürünlerimiz - Federal Gaz | Endüstriyel Gaz Ürünleri",
    description: "Federal Gaz endüstriyel gaz ürünleri: Medikal gazlar, endüstriyel gazlar, kaynak gazları, gıda gazları, özel gazlar ve kriyojenik sıvılar. Oksijen, argon, azot, CO2 ve daha fazlası.",
    keywords: [
        "endüstriyel gaz ürünleri",
        "medikal oksijen",
        "argon gazı",
        "azot gazı",
        "karbondioksit",
        "federal gaz ürünler",
        "gaz tüpü ankara"
    ],
    alternates: {
        canonical: 'https://federalgaz.com/urunler',
    },
    openGraph: {
        title: "Ürünlerimiz - Federal Gaz",
        description: "Medikal gazlar, endüstriyel gazlar, kaynak gazları ve daha fazlası. Federal Gaz ürün yelpazesi.",
        url: 'https://federalgaz.com/urunler',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function UrunlerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
