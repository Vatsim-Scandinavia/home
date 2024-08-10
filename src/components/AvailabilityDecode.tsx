function AvailabilityDecodeFunc(status: any) {
    if (status === "AVL") {
        return <span title="Available and can be reached on a daily basis" data-tooltip-placement="top" className="bg-secondary text-sm text-white px-2 py-1 rounded-md">AVL</span>
    } else if (status === "OOO") {
        return <span title="Out of Office (longer vacation, 3-6 weeks)" data-tooltip-placement="top" className="bg-warning text-sm text-black px-2 py-1 rounded-md">OOO</span>
    } else if (status === "DEP") {
        return <span title="Away for more than 2 months" data-tooltip-placement="top" className="bg-danger text-sm text-white px-2 py-1 rounded-md">DEP</span>
    } else if (status === "VAC") {
        return <span title="Vacant Position" data-tooltip-placement="top" className="bg-snow text-sm text-vatsca3 px-2 py-1 rounded-md dark:bg-gray-800">VAC</span>
    }
}

const AvailabilityDecode = (props: {Availability: string}) => {  
    return (
        AvailabilityDecodeFunc(props.Availability)
    )
}
export default AvailabilityDecode;