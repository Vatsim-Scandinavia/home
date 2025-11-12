"use client"

import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Filter } from "lucide-react";
import { Badge } from "./ui/badge";

// Country filter: ICAO prefixes + flag SVG icons
type CountryOption = { prefixes: string[]; label: string; icon: string };
const COUNTRIES: CountryOption[] = [
    { prefixes: ['EK'], label: 'Denmark', icon: '/img/icons/DK.svg' },
    { prefixes: ['ES'], label: 'Sweden',  icon: '/img/icons/SE.svg' },
    { prefixes: ['EN'], label: 'Norway',  icon: '/img/icons/NO.svg' },
    { prefixes: ['EF'], label: 'Finland', icon: '/img/icons/FI.svg' },
    // Iceland FIR also covers BG (Greenland)
    { prefixes: ['BI', 'BG'], label: 'Iceland', icon: '/img/icons/IS.svg' },
];

const POSITIONS = [
    { key: 'GND', label: 'GND' },
    { key: 'TWR', label: 'TWR' },
    { key: 'APP', label: 'APP' },
    { key: 'CTR', label: 'CTR' },
] as const;

const EVENT_TYPES = [
    { key: 'training', label: 'Training' },
    { key: 'event', label: 'Event' },
    { key: 'exam', label: 'Exam' },
] as const;

interface BookingFiltersProps {
    selectedPrefixes: string[];
    selectedPositions: string[];
    selectedEventTypes: string[];
    onCountryToggle: (prefixes: string[]) => void;
    onPositionToggle: (pos: string) => void;
    onEventTypeToggle: (type: string) => void;
    onClearFilters: () => void;
    isCountrySelected: (prefixes: string[]) => boolean;
    isPositionSelected: (pos: string) => boolean;
    isEventTypeSelected: (type: string) => boolean;
}

export default function BookingFilters({
    selectedPrefixes,
    selectedPositions,
    selectedEventTypes,
    onCountryToggle,
    onPositionToggle,
    onEventTypeToggle,
    onClearFilters,
    isCountrySelected,
    isPositionSelected,
    isEventTypeSelected,
}: BookingFiltersProps) {
    const totalFilters = selectedPrefixes.length + selectedPositions.length + selectedEventTypes.length;
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                    <Filter className="h-4 w-4" />
                    {totalFilters > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-xs">
                            {totalFilters}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto p-1.5">
                <div className="space-y-2">
                    <div>
                        <DropdownMenuLabel className="px-1.5 py-1 text-xs">Country</DropdownMenuLabel>
                        <div className="flex flex-wrap gap-1 p-1">
                            {COUNTRIES.map(c => (
                                <button
                                    key={`country-${c.label}`}
                                    type="button"
                                    onClick={() => onCountryToggle(c.prefixes)}
                                    className={`relative p-1 rounded transition-all ${
                                        isCountrySelected(c.prefixes)
                                            ? 'bg-primary/10'
                                            : 'bg-muted hover:bg-accent'
                                    }`}
                                    title={c.label}
                                >
                                    <img 
                                        src={c.icon} 
                                        alt={c.label} 
                                        className={`h-6 w-8 rounded-sm transition-all ${
                                            isCountrySelected(c.prefixes) 
                                                ? 'border-primary shadow-sm' 
                                                : 'border-gray-300 dark:border-gray-700'
                                        }`} 
                                    />
                                    {isCountrySelected(c.prefixes) && (
                                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[8px] text-white font-bold">✓</span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DropdownMenuSeparator className="my-1" />
                    <div>
                        <DropdownMenuLabel className="px-1.5 py-1 text-xs">Position</DropdownMenuLabel>
                        <div className="flex flex-wrap gap-1 p-1">
                            {POSITIONS.map(p => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => onPositionToggle(p.key)}
                                    className={`relative px-2 py-1 rounded text-[10px] font-medium transition-all ${
                                        isPositionSelected(p.key)
                                            ? 'bg-primary/10'
                                            : 'bg-muted hover:bg-accent'
                                    }`}
                                >
                                    {p.label}
                                    {isPositionSelected(p.key) && (
                                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[8px] text-white font-bold">✓</span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DropdownMenuSeparator className="my-1" />
                    <div>
                        <DropdownMenuLabel className="px-1.5 py-1 text-xs">Event Type</DropdownMenuLabel>
                        <div className="flex flex-wrap gap-1 p-1">
                            {EVENT_TYPES.map(et => {
                                const getEventTypeBgColor = (key: string) => {
                                    if (key === 'training') return 'bg-[#1a475f]';
                                    if (key === 'event') return 'bg-[#41826e]';
                                    if (key === 'exam') return 'bg-[#b63f3f]';
                                    return '';
                                };
                                
                                const bgColor = getEventTypeBgColor(et.key);
                                
                                return (
                                    <button
                                        key={et.key}
                                        type="button"
                                        onClick={() => onEventTypeToggle(et.key)}
                                        className={`relative px-2 py-1 rounded text-[10px] font-medium transition-all ${
                                            isEventTypeSelected(et.key)
                                                ? `${bgColor} text-white`
                                                : `${bgColor} text-white `
                                        }`}
                                    >
                                        {et.label}
                                        {isEventTypeSelected(et.key) && (
                                            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-[8px] text-white font-bold">✓</span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {totalFilters > 0 && (
                    <>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="w-full text-[10px] h-7"
                            >
                                Clear filters
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

