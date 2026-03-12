import CategoriesSection from "./_sections/categories/CategoriesSection";
import CategoryGrid from "../components/cards/CategoryGrid";
import EventsSection from "./_sections/eventSection/EventSection";
import FeatureBooks from "./_sections/featuredBooks/FeatureBooks";
import Hero from "./_sections/Hero/Hero";
import LatestBook from "./_sections/latestBooks/LatestBook";
import NewsletterSection from "./_sections/newsletter/NewsLetterSection";




export  default function Home() {

  return (
    <>
    <Hero/>
    <FeatureBooks/>
    <LatestBook/>
    <EventsSection/>
    <NewsletterSection/>
  
    
    </>
  );
}
