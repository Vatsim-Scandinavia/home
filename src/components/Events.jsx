import { useEffect, useState, useRef } from 'react';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef(null);
  
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };
  
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://events.vatsim-scandinavia.org/api/calendars/1/events');
                const data = await response.json();
                setEvents(data.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
    
        fetchData();
    }, []);

    function dateConverter(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate.getDate() == endDate.getDate()) {
            return startDate.toLocaleString('en-uk', {  weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })+" - "+endDate.toLocaleString('en-uk', {  hour: 'numeric', minute: 'numeric' });
        } else {
            return startDate.toLocaleString('en-uk', {  weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })+" - "+endDate.toLocaleString('en-uk', {  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        }
    }
    
    return (
        <div className="flex flex-col gap-2 w-full h-fit"> 
            {events.slice(0,2).map((item, index) => (
                <div key={index}>
                {index < 2 ? 
                    <div key={index} className='flex col-span-3 gap-2 md:gap-4 relative w-full flex-col md:flex-row mb-4 md:mb-0 animate-entry'>
                        <a target='_blank'  href={item.link} className='h-fit aspect-video'>
                            <img src={item.image} className={`w-full md:w-96 h-fit aspect-video rounded-sm absolute'}`} />
                        </a>
                        <div className='flex flex-col justify-between'>
                            <div className='w-fit'>
                                <h2 className='font-semibold text-lg md:text-xl text-secondary dark:text-white'>{item.title}</h2>
                                <p className='text-grey font-bold pb-4 dark:text-gray-300'>{events.length != 0 ? dateConverter(item.start_date, item.end_date)  : ""}z</p>
                                <p className={`line-clamp-6 mb-1`}>{item.short_description}</p>
                                <a href={item.link} className={`bg-snow p-3 text-center text-black dark:text-white hover:brightness-[95%] d-block inline-block mt-2 text-sm rounded-sm`} target='_blank'>
                                    Read more
                                </a>
                            </div>

                        </div>
                    </div>
                    : 
                    <iframe src="https://lottie.host/embed/e516525c-74c1-4db5-b2b2-bb135366e103/W8AodEgALN.json" className="w-full h-full" />
                    }
                </div>
            ))}
            <div className='flex overflow-hidden overflow-x-auto'
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            >
                {events.slice(2,9).map((item, index) => (
                    <a key={index} className='flex flex-col rounded pr-1 pb-1 pt-1' target='_blank'  href={item.link} draggable="false">
                        <img src={item.image} className={`w-64 h-fit aspect-video rounded-sm absolute'}`} draggable="false" />
                    </a>
                ))}
            </div>

        </div>
    );
};

export default Events;
