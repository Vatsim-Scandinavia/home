import { useEffect, useState, type CSSProperties, type MouseEventHandler } from 'react';
import { useKeenSlider } from "keen-slider/react";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import type { VatscaEvent } from '@/interfaces/Event';

const LONG_DATE_TIME: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
const SHORT_DATE_TIME: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
const TIME_ONLY: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric' };

/** "Saturday, Aug 30, 15:00 - 18:00", dropping the end date when it matches the start. */
function formatEventPeriod(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.getDate() === endDate.getDate();

    return `${startDate.toLocaleString('en-uk', LONG_DATE_TIME)} - ${endDate.toLocaleString('en-uk', sameDay ? TIME_ONLY : SHORT_DATE_TIME)}`;
}

const Events = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [events, setEvents] = useState<VatscaEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        initial: 0,
        mode: "snap",
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
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://events.vatsim-scandinavia.org/api/events');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                setEvents(await response.json() as VatscaEvent[]);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
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

    const lastSlide = (instanceRef.current?.track?.details?.slides?.length ?? 0) - 1;

    return (
        <div className="flex flex-col w-full h-full" id="live-stats" style={{ display: loading ? 'none' : 'flex' }}>
            <div className="flex h-full flex-col gap-2" >
                {events.slice(0, 2).map((item) => (
                    <a href={item.url} target='_blank' rel='noopener noreferrer' aria-label={`View event: ${item.name}`} key={item.id} className='aspect-video h-1/3 md:h-60 flex dark:hover:!text-primary text-secondary dark:text-white hover:bg-snow transition-all p-2 rounded'>

                        <img alt={`Event banner for ${item.name}`} className='h-full aspect-video bg-center bg-cover rounded' src={item.banner}/>

                        <div className='w-full h-full px-2 hidden md:flex flex-col gap-2 relative'>
                            <h2 className='font-bold text-xl md:text-2xl'>{item.name}</h2>
                            <p className='text-grey font-bold dark:text-gray-300 -mt-2 mb-2'>{formatEventPeriod(item.start_datetime, item.end_datetime)}</p>
                            <p className='line-clamp-6 mb-1 text-black dark:text-white'>{item.short_description}</p>
                        </div>
                    </a>
                ))}
                <div className="navigation-wrapper h-1/3 m-2">
                    <div ref={sliderRef} className="keen-slider">
                        {events.slice(2, 9).map((item, index) => (
                            <a key={item.id} style={{ '--image-url': `url(${item.banner})` } as CSSProperties} aria-label={`View event: ${item.name}`} className={`keen-slider__slide bg-gray-800 bg-[image:var(--image-url)] bg-cover inline-block number-slide${index} rounded aspect-video`} target='_blank' rel='noopener noreferrer' href={item.url} />
                        ))}
                        <a
                            href="https://events.vatsim-scandinavia.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="keen-slider__slide w-12 h-auto aspect-video bg-secondary text-white hover:brightness-[95%] rounded flex items-center justify-center text-center font-semibold"
                        >
                            More Events <ExternalLinkIcon width="0.75rem" marginLeft="0.3rem" />
                        </a>
                    </div>
                    <Arrow
                        left
                        onClick={(e) => {
                            e.stopPropagation();
                            instanceRef.current?.prev();
                        }}
                        disabled={currentSlide === 0}
                    />
                    <Arrow
                        onClick={(e) => {
                            e.stopPropagation();
                            instanceRef.current?.next();
                        }}
                        disabled={currentSlide === lastSlide}
                    />
                </div>
            </div>
        </div>
    );
};

type ArrowProps = {
    left?: boolean;
    disabled?: boolean;
    onClick: MouseEventHandler<SVGSVGElement>;
};

function Arrow({ left = false, disabled = false, onClick }: ArrowProps) {
    return (
        <svg
            onClick={onClick}
            className={`arrow ${left ? "arrow--left" : "arrow--right"}${disabled ? " arrow--disabled" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            <path d={left
                ? "M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"
                : "M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"} />
        </svg>
    );
}

export default Events;
