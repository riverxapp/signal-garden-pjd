import { ThemeToggle } from "@/components/theme/theme-toggle";

const brandName = "Panda";

export const Navbar = () => {
  return (
    <header className="flex items-center justify-between px-10 pt-8">
      <span className="text-[22px] font-bold tracking-tight">{brandName}</span>
      <ThemeToggle />
    </header>
  );
};
