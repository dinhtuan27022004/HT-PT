import React from 'react';
import { Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DraggableImageGallery from '../../../../components/common/DraggableImageGallery';

const ImageManagementArea = ({ isGeneral, images, onUpload, onChange }) => (
    <div style={{ padding: '16px', background: isGeneral ? 'transparent' : '#fafafa', borderRadius: '8px' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Upload multiple beforeUpload={onUpload} fileList={[]} showUploadList={false}>
                <Button icon={<PlusOutlined />} type="primary" size="large">Upload Ảnh</Button>
            </Upload>
        </div>
        <DraggableImageGallery images={images} onImagesChange={onChange} />
    </div>
);

export default ImageManagementArea;
