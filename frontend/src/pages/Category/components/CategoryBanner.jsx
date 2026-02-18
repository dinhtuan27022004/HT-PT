import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const CategoryBanner = ({ category }) => {
    // Determine image URL
    // If category has an image, use it. Otherwise use a placeholder or generic banner.
    // For now, let's assume we might have a specific banner image or just use a color/pattern.

    // Placeholder logic for banner image
    const bannerImage = category?.image || 'https://via.placeholder.com/1200x300?text=Category+Banner';

    return (
        <div style={{
            width: '100%',
            aspectRatio: '4/1',
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px',
            position: 'relative',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)', // Overlay
            }} />

            <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center' }}>
                <Title level={1} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {category?.name || 'Category'}
                </Title>
                {/* Optional description */}
                {category?.description && (
                    <p style={{ marginTop: '10px', fontSize: '16px', maxWidth: '800px', margin: '10px auto 0' }}>
                        {category.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CategoryBanner;
