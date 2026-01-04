import { TopInfoBar } from "@/components/site/TopInfoBar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Features } from "@/components/site/Features";
import { Projects } from "@/components/site/Projects";
import { Experience } from "@/components/site/Experience";
import { Equipment } from "@/components/site/Equipment";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  return (
    <div>
      <TopInfoBar />
      <Hero />
      <Services />
      <Features />
      <Projects />
      <Experience />
      <Equipment />
      <Contact />
      <Footer />

  
    </div>
  );
}
