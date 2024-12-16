function bookingType(booking: any) {
    if (booking.training === 1) {
        return <span className="bg-[#1a475f] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Training</span>
    } else if (booking.event === 1) {
        return <span className="bg-[#41826e] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Event</span>
    } else if (booking.exam === 1) {
        return <span className="bg-[#b63f3f] text-xs text-white px-2 py-[2px] rounded-md flex items-center justify-center">Exam</span>
    } else {
        return ""
    }
}

export default bookingType