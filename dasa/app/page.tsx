import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { flags } from "@/config/site";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {flags.SHOW_EXTRA_SECTIONS && (
          <>
            <Services />
            <About />
            <Process />
            <Testimonials />
            <Faq />
          </>
        )}
      </main>
      <Footer />
      {flags.SHOW_FLOATING_WHATSAPP && <FloatingWhatsApp />}
    </>
  );
}
