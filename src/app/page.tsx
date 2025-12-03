import Image from "next/image";

export default function Home() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* TopNavBar */}
                <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                    <div className="px-4 lg:px-10 flex justify-center">
                        <div className="flex items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 dark:border-white/10 w-full max-w-7xl py-3">
                            <div className="flex items-center gap-4 text-secondary dark:text-white">
                                <div className="size-8 text-primary">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"></path>
                                        <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="text-secondary dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Federal Gaz</h2>
                            </div>
                            <nav className="hidden lg:flex flex-1 justify-center items-center gap-9">
                                <a className="text-secondary dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Ana Sayfa</a>
                                <a className="text-secondary dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Hakkımızda</a>
                                <a className="text-secondary dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Hizmetlerimiz</a>
                                <a className="text-secondary dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Ürünler</a>
                                <a className="text-secondary dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">İletişim</a>
                            </nav>
                            <div className="flex items-center gap-4">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-secondary/10 dark:bg-white/10 text-secondary dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-secondary/20 dark:hover:bg-white/20 transition-colors">
                                    <span className="truncate">TR/EN</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    {/* Announcement Ticker */}
                    <div className="bg-accent text-secondary dark:text-secondary py-2 overflow-hidden">
                        <div className="animate-marquee whitespace-nowrap">
                            <span className="text-sm font-medium mx-4">Önemli duyuru: Yeni tesisimiz hizmete açılmıştır.</span>
                            <span className="text-sm font-medium mx-4">Önemli duyuru: Yeni tesisimiz hizmete açılmıştır.</span>
                            <span className="text-sm font-medium mx-4">Önemli duyuru: Yeni tesisimiz hizmete açılmıştır.</span>
                            <span className="text-sm font-medium mx-4">Önemli duyuru: Yeni tesisimiz hizmete açılmıştır.</span>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <section>
                        <div
                            className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center"
                            style={{ backgroundImage: 'linear-gradient(rgba(41, 40, 40, 0.4) 0%, rgba(41, 40, 40, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHTFQAhg8XwnT_IDFEVnZkRcVWTupO0NdTNlfcmI5FQ8eenjUjUu-ghYA-ZtAjGwCwbOE158wsxzgImQxmEZML5Kn8KVMP086Ir2WRqaJBwWmYpeegYE7c3FnHO6szGYgKgjkHN1f6WptSV1HgRYft9upTZVlTrp7d9Ic7B0eyh-Z77aSDs025bvwp3vNFfsf0_q6PeGgilOs7aFtyU686VOfz62hlNBpSlALd2w7DM4zRaDh6U8rRkg6woYzA_icb4IGIBgefyaAZ")' }}
                        >
                            <div className="flex flex-col gap-4 max-w-3xl">
                                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl">
                                    Güvenilir Enerji Çözümleri
                                </h1>
                                <h2 className="text-white text-base font-normal leading-normal md:text-lg">
                                    Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.
                                </h2>
                            </div>
                            <div className="flex-wrap gap-4 flex justify-center mt-4">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-transform hover:scale-105">
                                    <span className="truncate">Talep Formu</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-background-light text-secondary text-base font-bold leading-normal tracking-[0.015em] hover:bg-background-light/90 transition-transform hover:scale-105">
                                    <span className="truncate">Sipariş Ver</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* About Us Section */}
                    <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
                        <div className="px-4 mx-auto max-w-7xl">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-secondary dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl">Federal Gaz Hakkında</h2>
                                <p className="mt-6 text-secondary/80 dark:text-white/70 text-lg font-normal leading-relaxed">
                                    Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamak, vizyonumuz ise sektörde lider bir marka olmaktır.
                                </p>
                                <div className="mt-8">
                                    <a className="text-primary font-bold hover:underline" href="#">Daha Fazla Bilgi →</a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="py-16 sm:py-24 bg-secondary/5 dark:bg-white/5">
                        <div className="px-4 mx-auto max-w-7xl">
                            <div className="text-center max-w-3xl mx-auto mb-12">
                                <h2 className="text-secondary dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] sm:text-4xl">Öne Çıkan Hizmetlerimiz</h2>
                                <p className="mt-4 text-secondary/80 dark:text-white/70 text-lg font-normal leading-relaxed">
                                    Geniş hizmet yelpazemizle endüstrinizin tüm gaz ihtiyaçlarına profesyonel çözümler sunuyoruz.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center text-center p-8 bg-background-light dark:bg-background-dark rounded-xl shadow-md">
                                    <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
                                        <span className="material-symbols-outlined text-primary text-4xl">science</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">Medikal Gazlar</h3>
                                    <p className="text-secondary/70 dark:text-white/60">Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki ve sistemleri.</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-8 bg-background-light dark:bg-background-dark rounded-xl shadow-md">
                                    <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
                                        <span className="material-symbols-outlined text-primary text-4xl">local_fire_department</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">Endüstriyel Gaz Dolumu</h3>
                                    <p className="text-secondary/70 dark:text-white/60">Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-8 bg-background-light dark:bg-background-dark rounded-xl shadow-md">
                                    <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
                                        <span className="material-symbols-outlined text-primary text-4xl">ac_unit</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">Kriyojenik Tank Hizmetleri</h3>
                                    <p className="text-secondary/70 dark:text-white/60">Kriyojenik tankların kurulumu, bakımı ve periyodik kontrolleri için uzman teknik destek.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-secondary dark:bg-secondary text-white/80">
                    <div className="px-4 py-12 mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-bold text-white mb-4">Federal Gaz</h3>
                                <p className="text-sm">Endüstriyel gaz çözümlerinde güvenilir ortağınız.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">İletişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><p>Sanayi Mah. Teknoloji Cad. No:123, 34000, İstanbul, Türkiye</p></li>
                                    <li><a className="hover:text-primary transition-colors" href="tel:+902120000000">+90 (212) 000 00 00</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="mailto:info@federalgaz.com">info@federalgaz.com</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Hızlı Erişim</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a className="hover:text-primary transition-colors" href="#">Hakkımızda</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">Hizmetlerimiz</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">Kariyer</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">İletişim</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Sosyal Medya</h4>
                                <div className="flex space-x-4">
                                    <a className="hover:text-primary transition-colors" href="#">
                                        <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path></svg>
                                    </a>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm">
                            <p>© 2024 Federal Gaz. Tüm hakları saklıdır. <a className="font-semibold hover:text-primary transition-colors" href="https://www.federalgaz.com">www.federalgaz.com</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
