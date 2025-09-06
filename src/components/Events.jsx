import { useEffect, useState } from 'react';
import { useKeenSlider } from "keen-slider/react";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

const Events = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sliderRef, instanceRef] = useKeenSlider({
        initial: 0,
        mode: "snap",
        slides: {
            spacing: 5,
            perView: 4,
        },
        breakpoints: {
            "(max-width: 768px)": {
                slides: {
                    perView: 1, // Set perView to 1 for smaller devices
                    spacing: 5,
                },
            },
        },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('https://events.vatsim-scandinavia.org/api/calendars/1/events');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setEvents(data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to fetch events...');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && events.length > 0) {
            const skeleton = document.getElementById('live-stats-skeleton');
            const skeletonlive = document.getElementById('live-stats');
            if (skeleton) {
                skeleton.style.display = 'none';
            }
            if (skeletonlive) {
                skeletonlive.style.display = 'flex';
            }
            if (instanceRef.current) {
                instanceRef.current.update(); // Reapply Keen Slider settings
            }
        }
    }, [loading, events]);

    function dateConverter(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate.getDate() === endDate.getDate()) {
            return startDate.toLocaleString('en-uk', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) + " - " + endDate.toLocaleString('en-uk', { hour: 'numeric', minute: 'numeric' });
        } else {
            return startDate.toLocaleString('en-uk', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) + " - " + endDate.toLocaleString('en-uk', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        }
    }

    return (
        <div className="flex flex-col w-full h-fit" id="live-stats" style={{ display: loading ? 'none' : 'flex' }}>
            <div className="flex h-full flex-col gap-2" >
                {events.slice(0, 2).map((item, index) => (
                    <div key={index} className='aspect-video h-1/3 md:h-60 flex'>
                        <a target='_blank' href={item.link} aria-label={`View event: ${item.title}`} className='h-full aspect-video bg-center bg-cover rounded' style={{ backgroundImage: `url(${item.image})` }}>
                        </a>
                        <div className='w-full h-full px-2 hidden md:flex flex-col gap-2 relative'>
                            <h2 className='font-bold text-xl md:text-2xl text-secondary dark:text-white'>{item.title}</h2>
                            <p className='text-grey font-bold dark:text-gray-300 -mt-2 mb-2'>{events.length !== 0 ? dateConverter(item.start_date, item.end_date) : ""}z</p>
                            <p className={`line-clamp-6 mb-1`}>{item.short_description}</p>
                            <a href={item.link} className={`bg-snow p-3 text-center text-black dark:text-white hover:brightness-[95%] d-block inline-block mt-2 text-sm rounded-sm bottom-0 absolute w-full`} target='_blank'>
                                Read more
                            </a>
                        </div>
                    </div>
                ))}
                <div className="navigation-wrapper h-1/3">
                    <div ref={sliderRef} className="keen-slider">
                        {events.slice(2, 9).map((item, index) => (
                            <a key={index} style={{ '--image-url': `url(${item.image})` }} aria-label={`View event: ${item.title}`} className={`keen-slider__slide bg-gray-800 bg-[image:var(--image-url)] bg-cover inline-block number-slide${index} rounded aspect-video`} target='_blank' href={item.link} />
                        ))}
                        <a
                            href="https://events.vatsim-scandinavia.org"
                            target="_blank"
                            className="keen-slider__slide w-12 h-auto aspect-video bg-secondary text-white text-xl flex items-center justify-center text-center font-semibold"
                        >
                            More Events <ExternalLinkIcon width="0.75rem" marginLeft="0.3rem" />
                        </a>
                    </div>
                    {
                        <>
                            <Arrow
                                left
                                onClick={(e) =>
                                    e.stopPropagation() || instanceRef.current?.prev()
                                }
                                disabled={currentSlide === 0}
                            />

                            <Arrow
                                onClick={(e) =>
                                    e.stopPropagation() || instanceRef.current?.next()
                                }
                                disabled={
                                    currentSlide ===
                                    instanceRef.current?.track?.details?.slides?.length - 1
                                }
                            />
                        </>
                    }
                </div>
            </div>
        </div>
    );
};

function Arrow(props) {
    const disabled = props.disabled ? " arrow--disabled" : "";
    return (
        <svg
            onClick={props.onClick}
            className={`arrow ${props.left ? "arrow--left" : "arrow--right"
                } ${disabled}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            {props.left && (
                <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
            )}
            {!props.left && (
                <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
            )}
        </svg>
    );
}

export default Events;
