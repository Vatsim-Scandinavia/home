"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet"
import { Button } from "./ui/button"
import { Menu, ChevronDown, ExternalLink } from "lucide-react"
import ThemeToggle from "./ThemeToggle"
import { cn } from "../lib/utils"

type NavigationItem = {
    title: string
    href: string
    description: string
    external?: boolean
}

const gettingstarted: NavigationItem[] = [
    {
        title: "New to VATSIM",
        href: "https://vatsim.net/docs/basics/getting-started",
        description: "VATSIM 101",
        external: true,
    },
    {
        title: "Joining VATSCA",
        href: "https://wiki.vatsim-scandinavia.org/books/getting-started-AVr/chapter/joining-vatsim-scandinavia",
        description: "Transferring to Scandinavia",
        external: true,
    },
    {
        title: "ATC Training",
        href: "https://cc.vatsim-scandinavia.org/",
        description: "Apply to become a controller",
        external: true,
    },
    {
        title: "Pilot Training",
        href: "https://wiki.vatsim-scandinavia.org/shelves/pilot-training",
        description: "Information and applications",
        external: true,
    },
]

const pilots: NavigationItem[] = [
    {
        title: "Airports & Charts",
        href: "https://wiki.vatsim-scandinavia.org/shelves/pilots",
        description: "Our airports with charts and procedures",
        external: true,
    },
    {
        title: "Available Stands",
        href: "https://stands.vatsim-scandinavia.org/",
        description: "Live map for unoccupied stands",
        external: true,
    },
    {
        title: "Events",
        href: "https://events.vatsim-scandinavia.org/",
        description: "Overview of our upcoming events",
        external: true,
    },
    {
        title: "Event Booking",
        href: "https://booking.vatsim-scandinavia.org/",
        description: "Book slots for our larger events here",
        external: true,
    },
]

const controllers: NavigationItem[] = [
    {
        title: "Wiki",
        href: "https://wiki.vatsim-scandinavia.org/",
        description: "Documents and procedures",
        external: true,
    },
    {
        title: "Control Center",
        href: "https://cc.vatsim-scandinavia.org/",
        description: "Rosters, bookings and applications",
        external: true,
    },
    {
        title: "Training Department",
        href: "https://wiki.vatsim-scandinavia.org/books/training-documents",
        description: "FAQ and training-related policies",
        external: true,
    },
    {
        title: "Visiting Controllers",
        href: "https://wiki.vatsim-scandinavia.org/books/training-documents/page/transfer-and-visiting-policy-in-vatsim-scandinavia",
        description: "Information regarding visiting ratings",
        external: true,
    },
]

const about: NavigationItem[] = [
    {
        title: "Staff",
        href: "/about/staff",
        description: "Roles and contact information",
    },
    {
        title: "Contact Us",
        href: "/about/contact",
        description: "Get in touch with us",
    },
    {
        title: "Constitution & Policies",
        href: "https://wiki.vatsim-scandinavia.org/shelves/vacc-documents",
        description: "Privacy, graphical profile & more",
        external: true,
    },
    {
        title: "Donations",
        href: "/about/donations",
        description: "Help us keep VATSCA running!",
    },
]

function MobileNavSection({ 
    title, 
    items, 
    onLinkClick 
}: { 
    title: string
    items: NavigationItem[]
    onLinkClick: () => void
}) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className="border-b border-white/10 pb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-3 text-base font-medium transition-colors hover:text-primary"
            >
                {title}
                <ChevronDown 
                    className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
            {isOpen && (
                <div className="space-y-2 pl-4 pt-2 pb-2">
                    {items.map((item) => (
                        <a
                            key={item.title}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            onClick={onLinkClick}
                            className="block rounded-md p-3 transition-colors hover:bg-white/5"
                        >
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {item.title}
                                {item.external && <ExternalLink className="h-3 w-3" />}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {item.description}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function MobileMenu() {
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-secondary/80">
                    <Menu className="h-6 w-6 text-black dark:text-white" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-secondary text-white overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-6">
                    <MobileNavSection 
                        title="Getting Started" 
                        items={gettingstarted} 
                        onLinkClick={() => setOpen(false)} 
                    />
                    <MobileNavSection 
                        title="Pilots" 
                        items={pilots} 
                        onLinkClick={() => setOpen(false)} 
                    />
                    <MobileNavSection 
                        title="Controllers" 
                        items={controllers} 
                        onLinkClick={() => setOpen(false)} 
                    />
                    <MobileNavSection 
                        title="About" 
                        items={about} 
                        onLinkClick={() => setOpen(false)} 
                    />
                    <div className="border-b border-white/10 pb-3">
                        <a
                            href="https://forum.vatsim-scandinavia.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 py-3 text-base font-medium transition-colors hover:text-primary"
                        >
                            Community
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                    <div className="pt-4 mt-2">
                        <ThemeToggle />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

