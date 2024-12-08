import { useEffect } from 'react';
import { useLocation } from 'react-router';

function ScrollToHash() {
    const location = useLocation();
    const offset = 190; // Adjust based on your navbar height
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1)
            const element = document.getElementById(id);
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: elementPosition,
                });
            }
        }
    }, [location]);

    return null;
}

export default ScrollToHash;
