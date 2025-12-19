import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Gizlilik Politikası - Federal Gaz",
    description: "Federal Gaz gizlilik politikası. Kişisel bilgilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi edinin.",
    alternates: {
        canonical: 'https://federalgaz.com/gizlilik-politikasi',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function GizlilikPolitikasiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
