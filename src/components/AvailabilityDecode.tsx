interface AvailabilityInfo {
    color: string;
    tooltip: string;
    label: string;
}

function getAvailabilityInfo(status: string): AvailabilityInfo {
    switch (status) {
        case "AVL":
            return {
                color: "bg-green-500",
                tooltip: "Available and can be reached on a daily basis",
                label: "Available"
            };
        case "OOO":
            return {
                color: "bg-yellow-500",
                tooltip: "Out of Office (longer vacation, 3-6 weeks)",
                label: "Out of Office"
            };
        case "DEP":
            return {
                color: "bg-red-500",
                tooltip: "Away for more than 2 months",
                label: "Departed"
            };
        case "VAC":
            return {
                color: "bg-gray-400",
                tooltip: "Vacant Position",
                label: "Vacant"
            };
        default:
            return {
                color: "bg-gray-400",
                tooltip: "Unknown status",
                label: "Unknown"
            };
    }
}

const AvailabilityDecode = (props: {Availability: string; variant?: "badge" | "text"}) => {
    const info = getAvailabilityInfo(props.Availability);
    const variant = props.variant || "text";
    
    if (variant === "badge") {
        // Badge mode: returns a colored dot with tooltip
        return (
            <span 
                className={`block w-3 h-3 rounded-full ${info.color}`}
                title={info.tooltip}
                aria-label={`Availability: ${info.label}`}
            ></span>
        );
    }
    
    // Text mode: returns the full text version (original behavior)
    return (
        <span 
            title={info.tooltip} 
            data-tooltip-placement="top" 
            className={`${info.color} text-sm text-white px-2 py-1 rounded-md`}
        >
            {props.Availability}
        </span>
    );
}

export default AvailabilityDecode;