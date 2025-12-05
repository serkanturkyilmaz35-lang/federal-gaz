import Link from "next/link";

export default function MedikalGazlarPage() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                <header className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
                    <div className="flex justify-center px-4 lg:px-10">
                        <div className="flex w-full max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 py-3 dark:border-white/10">
                            <Link href="/" className="flex items-center gap-4 text-secondary dark:text-white">
                                <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-16 w-auto object-contain" />
                            </Link>
                            <nav className="hidden flex-1 items-center justify-center gap-9 lg:flex">
                                <Link href="/" className="text-sm font-bold leading-normal text-secondary transition-colors hover:text-primary dark:text-white">Ana Sayfa</Link>
                                <Link href="/hakkimizda" className="text-sm font-bold leading-normal text-secondary transition-colors hover:text-primary dark:text-white">Hakkımızda</Link>
                                <Link href="/hizmetler" className="text-sm font-bold leading-normal text-primary dark:text-primary">Hizmetlerimiz</Link>
                                <Link href="/urunler" className="text-sm font-bold leading-normal text-secondary transition-colors hover:text-primary dark:text-white">Ürünler</Link>
                                <Link href="/iletisim" className="text-sm font-bold leading-normal text-secondary transition-colors hover:text-primary dark:text-white">İletişim</Link>
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    <section className="bg-secondary py-16 text-white">
                        <div className="mx-auto max-w-7xl px-4">
                            <nav className="mb-4 flex items-center gap-2 text-sm">
                                <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
                                <span>/</span>
                                <Link href="/hizmetler" className="hover:text-primary">Hizmetler</Link>
                                <span>/</span>
                                <span>Medikal Gazlar</span>
                            </nav>
                            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">Medikal Gazlar</h1>
                            <p className="mt-4 text-lg text-white/80">Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki</p>
                        </div>
                    </section>

                    <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                        <div className="mx-auto max-w-7xl px-4">
                            <div className="grid gap-12 lg:grid-cols-2">
                                <div>
                                    <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop" alt="Medikal Gazlar" className="h-96 w-full rounded-xl object-cover shadow-lg" />
                                </div>
                                <div>
                                    <h2 className="mb-6 text-3xl font-bold text-secondary dark:text-white">Hizmet Detayları</h2>
                                    <div className="space-y-4 text-secondary/80 dark:text-white/70">
                                        <p>Federal Gaz olarak, sağlık sektörünün en hassas ihtiyaçlarını karşılamak için yüksek saflıkta medikal gaz tedariki ve sistemleri sunuyoruz.</p>
                                        <h3 className="mt-6 text-xl font-bold text-secondary dark:text-white">Sunduğumuz Medikal Gazlar:</h3>
                                        <ul className="list-disc space-y-2 pl-6">
                                            <li>Medikal Oksijen (O₂)</li>
                                            <li>Medikal Azot (N₂)</li>
                                            <li>Medikal Hava</li>
                                            <li>Karbondioksit (CO₂)</li>
                                            <li>Azot Protoksit (N₂O)</li>
                                            <li>Özel Gaz Karışımları</li>
                                        </ul>
                                        <h3 className="mt-6 text-xl font-bold text-secondary dark:text-white">Özellikler:</h3>
                                        <ul className="list-disc space-y-2 pl-6">
                                            <li>Uluslararası standartlara uygun üretim</li>
                                            <li>Sürekli kalite kontrol</li>
                                            <li>Hızlı ve güvenli teslimat</li>
                                            <li>7/24 teknik destek</li>
                                            <li>Tüp ve tank kiralama seçenekleri</li>
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        <Link href="/siparis" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90">
                                            <span>Sipariş Ver</span>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-secondary text-white/80">
                    <div className="mx-auto max-w-7xl px-4 py-12">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div>
                                <h3 className="mb-4 text-lg font-bold text-white">Federal Gaz</h3>
                                <p className="text-sm">Endüstriyel gaz çözümlerinde güvenilir ortağınız.</p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">İletişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>Sanayi Mah. Teknoloji Cad. No:123</li>
                                    <li><a href="tel:+902120000000" className="hover:text-primary">+90 (212) 000 00 00</a></li>
                                    <li><a href="mailto:info@federalgaz.com" className="hover:text-primary">info@federalgaz.com</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">Hızlı Erişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/hakkimizda" className="hover:text-primary">Hakkımızda</Link></li>
                                    <li><Link href="/hizmetler" className="hover:text-primary">Hizmetlerimiz</Link></li>
                                    <li><Link href="/iletisim" className="hover:text-primary">İletişim</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm">
                            <p>© 2024 Federal Gaz. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
