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
        slides: {
            spacing: 5,
            perView: 3,
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
        },
        created() {
            setLoaded(true);
        },
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
        if (instanceRef.current) {
            instanceRef.current.update(); // Reapply Keen Slider settings
        }
    }, [events]);

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
        <div className="flex flex-col gap-2 w-full h-fit">
            {loading ? (
                <>
                    {/* Skeleton for main events - matches actual layout */}
                    <div className="animate-pulse">
                        <div className="flex col-span-3 gap-2 md:gap-4 relative w-full flex-col md:flex-row mb-4 md:mb-0">
                            <div className="h-fit aspect-video">
                                <div className="w-full md:w-96 h-fit aspect-video bg-gray-300 dark:bg-secondary rounded-sm"></div>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="w-fit">
                                    <div className="h-6 bg-gray-300 dark:bg-secondary rounded w-80 mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-tertiary rounded w-64 mb-4"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-secondary rounded w-24 mt-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="flex col-span-3 gap-2 md:gap-4 relative w-full flex-col md:flex-row mb-4 md:mb-0">
                            <div className="h-fit aspect-video">
                                <div className="w-full md:w-96 h-fit aspect-video bg-gray-300 dark:bg-secondary rounded-sm"></div>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="w-fit">
                                    <div className="h-6 bg-gray-300 dark:bg-secondary rounded w-80 mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-tertiary rounded w-64 mb-4"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-tertiary rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-secondary rounded w-24 mt-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Skeleton for slider - matches navigation-wrapper */}
                    <div className="animate-pulse">
                        <div className="navigation-wrapper">
                            <div className="flex gap-2">
                                <div className="w-64 aspect-video bg-gray-300 dark:bg-secondary rounded-sm"></div>
                                <div className="w-64 aspect-video bg-gray-300 dark:bg-secondary rounded-sm"></div>
                                <div className="w-64 aspect-video bg-gray-300 dark:bg-secondary rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="font-semibold text-lg">Error!</p>
                    <p className="text-red-500 mt-2">{error}</p>
                </div>
            ) : (
                <>
                    {events.slice(0, 2).map((item, index) => (
                        <div key={index}>
                            {index < 2 ?
                                <div key={index} className='flex col-span-3 gap-2 md:gap-4 relative w-full flex-col md:flex-row mb-4 md:mb-0'>
                                    <a target='_blank' href={item.link} className='h-fit aspect-video'>
                                        <img src={item.image} className={`w-full md:w-96 h-fit aspect-video rounded-sm absolute'}`} />
                                    </a>
                                    <div className='flex flex-col justify-between'>
                                        <div className='w-fit'>
                                            <h2 className='font-semibold text-lg md:text-xl text-secondary dark:text-white'>{item.title}</h2>
                                            <p className='text-grey font-bold pb-4 dark:text-gray-300'>{events.length !== 0 ? dateConverter(item.start_date, item.end_date) : ""}z</p>
                                            <p className={`line-clamp-6 mb-1`}>{item.short_description}</p>
                                            <a href={item.link} className={`bg-snow p-3 text-center text-black dark:text-white hover:brightness-[95%] d-block inline-block mt-2 text-sm rounded-sm`} target='_blank'>
                                                Read more
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="animate-pulse flex">
                                    <div className="aspect-video w-full md:w-96 bg-gray-300 dark:bg-secondary"></div>
                                    <div className="w-fit bg-gray-100 dark:bg-secondary rounded  mb-1"></div>
                                </div>
                            }
                        </div>
                    ))}
                    <>
                        <div className="navigation-wrapper">
                            <div ref={sliderRef} className="keen-slider">
                                {events.slice(2, 9).map((item, index) => (
                                    <a key={index} style={{ '--image-url': `url(${item.image})` }} className={`keen-slider__slide w-64 aspect-video bg-cover bg-[image:var(--image-url)] inline-block mr-2 before:block number-slide${index}`} target='_blank' href={item.link} />
                                ))}
                            <a
                                href="https://events.vatsim-scandinavia.org"
                                target="_blank"
                                className="keen-slider__slide w-64 aspect-video bg-secondary text-white text-xl flex items-center justify-center text-center font-semibold"
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
                    </>
                </>
            )}
        </div>
    );
};

function Arrow(props) {
    const disabled = props.disabled ? " arrow--disabled" : "";
    return (
        <svg
            onClick={props.onClick}
            className={`arrow ${
                props.left ? "arrow--left" : "arrow--right"
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
