import { useEffect, useRef, useState, type MouseEventHandler } from 'react';
import { useKeenSlider } from "keen-slider/react";
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import type { EventCard } from '@/interfaces/Event';
import { formatEventPeriod } from '@/lib/events';

type EventsProps = {
    events: EventCard[];
};

const Events = ({ events }: EventsProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Event banners are full-size uploads (often several MB each), so hold off fetching them
    // until the events panel is close to the screen; loading="lazy" alone starts them far too early.
    const rootRef = useRef<HTMLDivElement>(null);
    const [showBanners, setShowBanners] = useState(false);
    useEffect(() => {
        const root = rootRef.current;
        if (!root || !("IntersectionObserver" in window)) return setShowBanners(true);
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setShowBanners(true);
            observer.disconnect();
        }, { rootMargin: "300px" });
        observer.observe(root);
        return () => observer.disconnect();
    }, []);

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

    // Null on the server and on the first client render, which keeps hydration in step.
    const lastSlide = (instanceRef.current?.track?.details?.slides?.length ?? 0) - 1;

    return (
        <div ref={rootRef} className="flex flex-col w-full h-full">
            <div className="flex h-full flex-col gap-2" >
                {events.slice(0, 2).map((item) => (
                    <a href={item.url} target='_blank' rel='noopener noreferrer' aria-label={`View event: ${item.name}`} key={item.id} className='event-preview'>

                        {item.banner ? (
                            <img alt={`Event banner for ${item.name}`} className='event-preview-image' src={showBanners ? item.banner : undefined} decoding='async'/>
                        ) : <div className='event-preview-image bg-gray-800' aria-hidden='true' />}

                        <div className='event-preview-copy'>
                            <h3>{item.name}</h3>
                            <p className='event-period'>{formatEventPeriod(item.start_datetime, item.end_datetime)}</p>
                            {item.short_description && <p className='event-excerpt line-clamp-4'>{item.short_description}</p>}
                        </div>
                    </a>
                ))}
                <div className="navigation-wrapper event-carousel">
                    <div ref={sliderRef} className="keen-slider">
                        {events.slice(2, 9).map((item, index) => (
                            <a key={item.id} aria-label={`View event: ${item.name}`} className={`keen-slider__slide bg-gray-800 inline-block number-slide${index} rounded aspect-video`} target='_blank' rel='noopener noreferrer' href={item.url}>
                                {item.banner ? (
                                    <img src={showBanners ? item.banner : undefined} alt="" decoding="async" className="w-full h-full object-cover" />
                                ) : <span className="flex items-center justify-center w-full h-full p-4 text-center">{item.name}</span>}
                            </a>
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
