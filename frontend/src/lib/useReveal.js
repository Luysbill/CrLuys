import { useEffect, useRef, useState } from "react";

/**
 * Adds the `.is-visible` class once the target enters the viewport.
 * Usage:
 *   const ref = useReveal();
 *   <div ref={ref} className="reveal">…</div>
 */
export default function useReveal(options = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (visible) return;
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            el.classList.add("is-visible");
            return;
        }
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        el.classList.add("is-visible");
                        obs.disconnect();
                    }
                });
            },
            { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? "0px 0px -40px 0px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [visible, options.threshold, options.rootMargin]);

    return ref;
}
