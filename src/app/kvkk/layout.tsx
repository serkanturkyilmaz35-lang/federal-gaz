import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "KVKK Aydınlatma Metni - Federal Gaz",
    description: "Federal Gaz KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aydınlatma metni. Kişisel verilerinizin nasıl işlendiğini öğrenin.",
    alternates: {
        canonical: 'https://federalgaz.com/kvkk',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function KvkkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
