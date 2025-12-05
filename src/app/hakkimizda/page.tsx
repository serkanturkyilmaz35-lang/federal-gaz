import Link from "next/link";

export default function HakkimizdaPage() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                {/* TopNavBar */}
                <header className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
                    <div className="flex justify-center px-4 lg:px-10">
                        <div className="flex w-full max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 py-3 dark:border-white/10">
                            <div className="flex items-center gap-4 text-secondary dark:text-white">
                                <div className="size-8 text-primary">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"></path>
                                        <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-secondary dark:text-white">
                                    Federal Gaz
                                </h2>
                            </div>
                            <nav className="hidden flex-1 items-center justify-center gap-9 lg:flex">
                                <Link href="/" className="text-sm font-medium leading-normal text-secondary transition-colors hover:text-primary dark:text-white">
                                    Ana Sayfa
                                </Link>
                                <Link href="/hakkimizda" className="text-sm font-medium leading-normal text-primary dark:text-primary">
                                    Hakkımızda
                                </Link>
                                <Link href="/hizmetler" className="text-sm font-medium leading-normal text-secondary transition-colors hover:text-primary dark:text-white">
                                    Hizmetlerimiz
                                </Link>
                                <Link href="/urunler" className="text-sm font-medium leading-normal text-secondary transition-colors hover:text-primary dark:text-white">
                                    Ürünler
                                </Link>
                                <Link href="/iletisim" className="text-sm font-medium leading-normal text-secondary transition-colors hover:text-primary dark:text-white">
                                    İletişim
                                </Link>
                            </nav>
                            <div className="flex items-center gap-4">
                                <button className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-secondary/10 px-4 text-sm font-bold leading-normal tracking-[0.015em] text-secondary transition-colors hover:bg-secondary/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                                    <span className="truncate">TR/EN</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    {/* Page Header */}
                    <section className="bg-secondary py-16 text-white">
                        <div className="mx-auto max-w-7xl px-4">
                            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                                Hakkımızda
                            </h1>
                            <p className="mt-4 text-lg text-white/80">
                                Federal Gaz olarak endüstriyel gaz sektöründe güvenilir çözümler sunuyoruz.
                            </p>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                        <div className="mx-auto max-w-7xl px-4">
                            <div className="grid gap-12 md:grid-cols-2">
                                <div>
                                    <h2 className="text-3xl font-bold text-secondary dark:text-white">
                                        Misyonumuz
                                    </h2>
                                    <p className="mt-4 text-lg leading-relaxed text-secondary/80 dark:text-white/70">
                                        Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamaktır.
                                    </p>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-secondary dark:text-white">
                                        Vizyonumuz
                                    </h2>
                                    <p className="mt-4 text-lg leading-relaxed text-secondary/80 dark:text-white/70">
                                        Vizyonumuz, endüstriyel gaz sektöründe lider bir marka olmak ve müşterilerimize en iyi hizmeti sunarak sektörde fark yaratmaktır. Sürekli gelişim ve yenilikçilik ilkelerimizle hareket ediyoruz.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-16">
                                <h2 className="text-3xl font-bold text-secondary dark:text-white">
                                    Değerlerimiz
                                </h2>
                                <div className="mt-8 grid gap-8 md:grid-cols-3">
                                    <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                        <h3 className="text-xl font-bold text-primary">Kalite</h3>
                                        <p className="mt-2 text-secondary/70 dark:text-white/60">
                                            En yüksek kalite standartlarında ürün ve hizmet sunuyoruz.
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                        <h3 className="text-xl font-bold text-primary">Güvenilirlik</h3>
                                        <p className="mt-2 text-secondary/70 dark:text-white/60">
                                            Müşterilerimizin güvenini kazanmak ve korumak önceliğimizdir.
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                        <h3 className="text-xl font-bold text-primary">Yenilikçilik</h3>
                                        <p className="mt-2 text-secondary/70 dark:text-white/60">
                                            Sürekli gelişim ve yenilikçi çözümlerle sektöre öncülük ediyoruz.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-secondary text-white/80 dark:bg-secondary">
                    <div className="mx-auto max-w-7xl px-4 py-12">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <h3 className="mb-4 text-lg font-bold text-white">Federal Gaz</h3>
                                <p className="text-sm">Endüstriyel gaz çözümlerinde güvenilir ortağınız.</p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">İletişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <p>Sanayi Mah. Teknoloji Cad. No:123, 34000, İstanbul, Türkiye</p>
                                    </li>
                                    <li>
                                        <a href="tel:+902120000000" className="transition-colors hover:text-primary">
                                            +90 (212) 000 00 00
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:info@federalgaz.com" className="transition-colors hover:text-primary">
                                            info@federalgaz.com
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">Hızlı Erişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link href="/hakkimizda" className="transition-colors hover:text-primary">
                                            Hakkımızda
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/hizmetler" className="transition-colors hover:text-primary">
                                            Hizmetlerimiz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/kariyer" className="transition-colors hover:text-primary">
                                            Kariyer
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/iletisim" className="transition-colors hover:text-primary">
                                            İletişim
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">Sosyal Medya</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="transition-colors hover:text-primary">
                                        <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                clipRule="evenodd"
                                                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                                                fillRule="evenodd"
                                            ></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="transition-colors hover:text-primary">
                                        <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm">
                            <p>
                                © 2024 Federal Gaz. Tüm hakları saklıdır.{" "}
                                <a href="https://www.federalgaz.com" className="font-semibold transition-colors hover:text-primary">
                                    www.federalgaz.com
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
