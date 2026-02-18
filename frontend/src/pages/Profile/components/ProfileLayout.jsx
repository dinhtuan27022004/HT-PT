import React from 'react';
import { Row, Col } from 'antd';

const ProfileLayout = ({ sidebar, children }) => {
    return (
        <div className="profile-layout">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={7} lg={6}>
                    {sidebar}
                </Col>
                <Col xs={24} md={17} lg={18}>
                    {children}
                </Col>
            </Row>
        </div>
    );
};

export default ProfileLayout;
