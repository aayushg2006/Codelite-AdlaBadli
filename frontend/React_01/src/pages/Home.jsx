import { useEffect, useState } from "react";
import LocalFeed from "../components/feed/LocalFeed";

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const res = await fetch(`http://localhost:3000/api/items/nearby?lat=${latitude}&lon=${longitude}`);
        if(res.ok) {
           const data = await res.json();
           setListings(data);
        }
      } catch (err) {
        console.error("Failed to fetch nearby items", err);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.warn("Location not provided. Loading empty feed.");
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center flex h-full items-center justify-center">Locating nearby items...</div>;

  return <LocalFeed listings={listings} />;
}

export default Home;