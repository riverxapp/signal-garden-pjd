import { Button } from "@/components/ui/button";
import { Triangle } from "lucide-react";

const hero = {
  heading: "To get started, chat with AI.",
  description: "Looking for a starting point or more instructions?",
  hintBefore: "Head over to ",
  hintBold1: "Templates",
  hintBetween: " or the ",
  hintBold2: "Learning",
  hintAfter: " center.",
  primaryCta: "Deploy Now",
  secondaryCta: "Documentation",
};

export const HeroSection = () => {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-xl text-[28px] font-bold leading-[1.25] tracking-tight sm:text-[36px]">
        {hero.heading}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
        {hero.description}
      </p>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {hero.hintBefore}
        <span className="font-semibold text-foreground">{hero.hintBold1}</span>
        {hero.hintBetween}
        <span className="font-semibold text-foreground">{hero.hintBold2}</span>
        {hero.hintAfter}
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Button className="h-11 gap-2 rounded-lg px-5">
          <Triangle className="h-3.5 w-3.5 fill-current" />
          {hero.primaryCta}
        </Button>
        <Button variant="outline" className="h-11 rounded-lg px-5">
          {hero.secondaryCta}
        </Button>
      </div>
    </section>
  );
};
