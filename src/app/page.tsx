
import { Navbar } from "@/components/site/Navbar";
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
      |
      <Navbar />
      <Hero />
      <Services />
      <Features />
      <Projects />
      <Equipment />
      <Experience />
      <Contact />
      <Footer />

  
    </div>
  );
}
