"use client"

import React from "react";
import BookingComponent from "./BookingComponent";
import BookingFilters from "./BookingFilters";

export default function BookingsWithFilter() {
    const [selectedPrefixes, setSelectedPrefixes] = React.useState<string[]>([]);
    const [selectedPositions, setSelectedPositions] = React.useState<string[]>([]);
    const [selectedEventTypes, setSelectedEventTypes] = React.useState<string[]>([]);

    const toggleCountry = (prefixes: string[]) => {
        setSelectedPrefixes(prev => {
            const allSelected = prefixes.every(pref => prev.includes(pref));
            if (allSelected) {
                return prev.filter(p => !prefixes.includes(p));
            }
            const toAdd = prefixes.filter(pref => !prev.includes(pref));
            return [...prev, ...toAdd];
        });
    };

    const isCountrySelected = (prefixes: string[]) => prefixes.every(pref => selectedPrefixes.includes(pref));
    
    const togglePosition = (pos: string) => {
        setSelectedPositions(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
        );
    };
    
    const isPositionSelected = (pos: string) => selectedPositions.includes(pos);
    
    const toggleEventType = (type: string) => {
        setSelectedEventTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };
    
    const isEventTypeSelected = (type: string) => selectedEventTypes.includes(type);

    const clearFilters = () => {
        setSelectedPrefixes([]);
        setSelectedPositions([]);
        setSelectedEventTypes([]);
    };

    const filterComponent = (
        <BookingFilters
            selectedPrefixes={selectedPrefixes}
            selectedPositions={selectedPositions}
            selectedEventTypes={selectedEventTypes}
            onCountryToggle={toggleCountry}
            onPositionToggle={togglePosition}
            onEventTypeToggle={toggleEventType}
            onClearFilters={clearFilters}
            isCountrySelected={isCountrySelected}
            isPositionSelected={isPositionSelected}
            isEventTypeSelected={isEventTypeSelected}
        />
    );

    return (
        <BookingComponent
            selectedPrefixes={selectedPrefixes}
            selectedPositions={selectedPositions}
            selectedEventTypes={selectedEventTypes}
            headerAction={filterComponent}
        />
    );
}

