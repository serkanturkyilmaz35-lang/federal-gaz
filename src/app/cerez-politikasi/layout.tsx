import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Çerez Politikası - Federal Gaz",
    description: "Federal Gaz çerez politikası. Web sitemizde kullanılan çerezler ve bunların nasıl yönetileceği hakkında bilgi edinin.",
    alternates: {
        canonical: 'https://federalgaz.com/cerez-politikasi',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function CerezPolitikasiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
