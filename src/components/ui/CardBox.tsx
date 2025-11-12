import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface CardBoxProps {
    title: string;
    padding?: string;
    minHeight?: number;
    link?: string;
    clock?: boolean;
    children: React.ReactNode;
    className?: string;
}

export default function CardBox({ 
    title, 
    padding = "4", 
    minHeight, 
    link, 
    clock = false,
    children,
    className 
}: CardBoxProps) {
    useEffect(() => {
        if (clock) {
            function updateZuluTime() {
                const element = document.getElementById('zuluTime');
                if (element) {
                    const now = new Date();
                    const options = { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' };
                    const zuluTime = now.toLocaleTimeString('en-UK', options);
                    element.textContent = zuluTime + "z";
                }
            }

            // Initial call to display the time immediately
            updateZuluTime();

            // Update the time every minute
            const interval = setInterval(updateZuluTime, 60000);
            return () => clearInterval(interval);
        }
    }, [clock]);

    const paddingClass = padding ? `p-${padding}` : "";

    return (
        <Card className={cn("flex flex-col col-span-6 xl:col-span-4 overflow-hidden", className)}>
            <CardHeader className="bg-secondary text-white p-4 h-12 flex flex-row items-center justify-between rounded-t-lg">
                {link ? (
                    <CardTitle className="text-lg font-bold m-0">
                        <a 
                            href={link} 
                            className="text-white no-underline hover:underline w-full flex justify-between items-center gap-2" 
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>{title}</span>
                            {clock && <span className="text-sm font-normal" id="zuluTime"></span>}
                            <ExternalLink className="h-4 w-4 opacity-70" />
                        </a>
                    </CardTitle>
                ) : (
                    <CardTitle className="text-lg font-bold m-0">
                        {title}
                        {clock && <span className="text-sm font-normal ml-2" id="zuluTime"></span>}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent 
                className={cn(
                    "text-sm bg-white dark:bg-tertiary rounded-b-lg flex-1",
                    paddingClass
                )}
                style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
            >
                {children}
            </CardContent>
        </Card>
    );
}

