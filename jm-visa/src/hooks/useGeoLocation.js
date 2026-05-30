import { useState, useEffect } from 'react';

const useGeoLocation = () => {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const fetchGeo = async () => {
            try {
                // ipapi.co provides HTTPS and doesn't require a key for small volumes
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) return;
                const data = await response.json();
                setLocation({
                    city: data.city,
                    region: data.region,
                    pincode: data.postal,
                    country: data.country_name,
                    ip: data.ip
                });
            } catch (err) {
                console.error("Geo fetch failed:", err);
            }
        };
        fetchGeo();
    }, []);

    return location;
};

export default useGeoLocation;
