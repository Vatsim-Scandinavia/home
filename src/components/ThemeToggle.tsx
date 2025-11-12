import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">(
        (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark")) ?? "dark"
    );
    
    const handleClick = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);
    
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            aria-label="Toggle between dark and light mode"
            className="h-9 w-9"
        >
            {theme === "light" ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </Button>
    );
}