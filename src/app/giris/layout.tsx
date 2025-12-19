import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Giriş Yap - Federal Gaz",
    description: "Federal Gaz müşteri girişi. Hesabınıza giriş yaparak siparişlerinizi takip edin ve yeni sipariş verin.",
    alternates: {
        canonical: 'https://federalgaz.com/giris',
    },
    robots: {
        index: false, // Login pages typically shouldn't be indexed
        follow: true,
    },
};

export default function GirisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
