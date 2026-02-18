import React, { useEffect, useState } from 'react';
import { Col, Spin } from 'antd';
import bannerService from '../../services/banner.service';

const useSideBanner = (position) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await bannerService.getPublicBanners(position);
                if (res.status === 'success') {
                    setBanners(res.data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${position} banners`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, [position]);

    return { banners, loading };
};

export const LeftBanner = () => {
    const { banners, loading } = useSideBanner('left');

    if (loading) return <Col xs={0} xxl={3} className="side-banner-container"><Spin /></Col>;

    if (banners.length === 0) {
        return (
            <Col xs={0} xxl={3} className="side-banner-container">
                <div className="side-banner left-banner">
                    <div className="banner-mock-content">ADVERTISEMENT</div>
                </div>
            </Col>
        );
    }

    return (
        <Col xs={0} xxl={3} className="side-banner-container">
            <div className="side-banner left-banner" style={{ background: 'transparent', boxShadow: 'none' }}>
                {banners.map(banner => (
                    <a key={banner.id} href={banner.link_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: '16px' }}>
                        <img src={banner.image_url} alt={banner.title} style={{ width: '100%', borderRadius: '8px' }} />
                    </a>
                ))}
            </div>
        </Col>
    );
};

export const RightBanner = () => {
    const { banners, loading } = useSideBanner('right');

    if (loading) return <Col xs={0} xxl={3} className="side-banner-container"><Spin /></Col>;

    if (banners.length === 0) {
        return (
            <Col xs={0} xxl={3} className="side-banner-container">
                <div className="side-banner right-banner">
                    <div className="banner-mock-content">SPECIAL OFFERS</div>
                </div>
            </Col>
        );
    }

    return (
        <Col xs={0} xxl={3} className="side-banner-container">
            <div className="side-banner right-banner" style={{ background: 'transparent', boxShadow: 'none' }}>
                {banners.map(banner => (
                    <a key={banner.id} href={banner.link_url} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: '16px' }}>
                        <img src={banner.image_url} alt={banner.title} style={{ width: '100%', borderRadius: '8px' }} />
                    </a>
                ))}
            </div>
        </Col>
    );
};
