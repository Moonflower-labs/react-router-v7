import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

function ScrollToAnchor() {
    const location = useLocation();
    const lastHash = useRef('');
    const navbarOffset = 190; // Adjust based on your navbar height

    useEffect(() => {
        if (location.hash) {
            lastHash.current = location.hash.slice(1);

            const element = document.getElementById(lastHash.current);
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - navbarOffset,
                    behavior: 'smooth',
                });
                lastHash.current = '';
            }
        }
    }, [location]);

    return null;
}

export default ScrollToAnchor;
