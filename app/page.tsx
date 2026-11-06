/* Page order. To reorder sections, move the lines below. Content lives in site.config.ts. */
import { Header } from "@/components/Header";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Announcement, Hero, Stats } from "@/components/sections/Hero";
import { About, Services, Team } from "@/components/sections/Services";
import { Cta, Faq, Memberships, Testimonials } from "@/components/sections/Offers";
import { Contact, Footer } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Announcement />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Services />
        <About />
        <Team />
        <Memberships />
        <Testimonials />
        <Faq />
        <Cta />
        <Contact />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  );
}
