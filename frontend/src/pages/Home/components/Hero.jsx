import React, { useEffect, useState } from 'react';
import { Carousel, Spin } from 'antd';

import bannerService from '../../../services/banner.service';
import './Hero.css';

const Hero = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // DIRECT FETCH FOR DEBUGGING
                const res = await bannerService.getPublicBanners('main');
                if (res.status === 'success') {
                    setBanners(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch banners', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading) return <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>;

    if (banners.length === 0) return null;

    return (
        <Carousel autoplay className="hero-carousel" arrows dots infinite draggable>
            {banners.map(banner => (
                <div key={banner.id} className="hero-slide">
                    <div className="hero-section">
                        {banner.link_url ? (
                            <a href={banner.link_url} className="hero-link">
                                <img
                                    src={banner.image_url}
                                    alt={banner.title || "Banner"}
                                    className="hero-image"
                                />
                            </a>
                        ) : (
                            <img
                                src={banner.image_url}
                                alt={banner.title || "Banner"}
                                className="hero-image"
                            />
                        )}
                    </div>
                </div>
            ))}
        </Carousel>
    );
};

export default Hero;
