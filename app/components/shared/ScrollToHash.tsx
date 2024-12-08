import { useEffect } from 'react';
import { useLocation } from 'react-router';

function ScrollToHash() {
    const location = useLocation();
    const offset = 190; // Adjust based on your navbar height
    let timeoutId: NodeJS.Timeout | undefined;
    useEffect(() => {
        if (location.hash) {
            // Wait for view transition to complete and then scroll
            timeoutId = setTimeout(() => {
                const id = location.hash.substring(1)
                const element = document.getElementById(id);
                if (element) {
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth',
                    });
                }
            }, 100);
        }
        return () => clearTimeout(timeoutId);
    }, [location]);

    return null;
}

export default ScrollToHash;
