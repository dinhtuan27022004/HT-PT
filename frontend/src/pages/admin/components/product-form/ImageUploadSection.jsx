import React, { useState } from 'react';
import { Card, Divider, Typography, Tabs } from 'antd';
import AttributeImageFilter from './AttributeImageFilter';
import AttributeImageValues from './AttributeImageValues';
import ImageManagementArea from './ImageManagementArea';
import AttributeImageSummary from './AttributeImageSummary';

const { Text } = Typography;

const ImageUploadSection = ({
    attributes,
    attributeValues,
    generalImages,
    setGeneralImages,
    selectedImageAttributes,
    setSelectedImageAttributes,
    imageAttributeValues,
    setImageAttributeValues,
    attributeImages,
    setAttributeImages,
    onUploadImage,
    message
}) => {
    const [activeTab, setActiveTab] = useState('general');

    const isManagingGeneral = activeTab === 'general';
    const allValuesSelected = selectedImageAttributes.length > 0 && selectedImageAttributes.every(attr => imageAttributeValues[attr]);
    const currentAttrKey = !isManagingGeneral && allValuesSelected ? selectedImageAttributes.map(attr => imageAttributeValues[attr]).join('|') : null;

    // Determine which images to show based on active tab
    const currentImages = isManagingGeneral ? generalImages : (currentAttrKey ? (attributeImages[currentAttrKey] || []) : []);

    const handleUpload = async (file) => {
        try {
            console.log('Starting upload:', file.name, 'Tab:', activeTab);
            const res = await onUploadImage(file);
            console.log('Upload success:', res);

            if (isManagingGeneral) {
                setGeneralImages(p => [...p, res.url]);
            } else {
                if (!currentAttrKey) {
                    console.error('Upload Error: Missing currentAttrKey for attribute image upload');
                    message.error('Lỗi: Vui lòng chọn đầy đủ thuộc tính trước khi upload ảnh');
                    return false;
                }
                console.log('Updating attribute images for key:', currentAttrKey);
                setAttributeImages(p => {
                    const newImages = { ...p, [currentAttrKey]: [...(p[currentAttrKey] || []), res.url] };
                    console.log('New attribute images state:', newImages);
                    return newImages;
                });
            }
            message.success(`Đã thêm ảnh: ${file.name}`);
        } catch (e) {
            console.error('UPLOAD ERROR DETAILED:', e);
            message.error(`Lỗi upload: ${e.message || 'Unknown error'}`);
        }
        return false;
    };

    const handleImagesChange = (imgs) => {
        console.log('Images changed:', imgs, 'Tab:', activeTab);
        if (isManagingGeneral) {
            setGeneralImages(imgs);
        } else if (currentAttrKey) {
            setAttributeImages(p => ({ ...p, [currentAttrKey]: imgs }));
        } else {
            console.warn('Skipping image change: No currentAttrKey selected');
        }
    };

    const items = [
        {
            key: 'general',
            label: 'Ảnh chung',
            children: (
                <div>
                    <ImageManagementArea
                        isGeneral={true}
                        images={generalImages}
                        onUpload={handleUpload}
                        onChange={handleImagesChange}
                    />
                </div>
            )
        },
        {
            key: 'attribute',
            label: 'Ảnh theo thuộc tính',
            children: (
                <div>
                    <AttributeImageFilter
                        attrs={attributes.filter(a => a.type === 'option')}
                        selected={selectedImageAttributes}
                        onToggle={(name) => {
                            const next = selectedImageAttributes.includes(name) ? selectedImageAttributes.filter(a => a !== name) : [...selectedImageAttributes, name];
                            setSelectedImageAttributes(next);
                            if (!next.includes(name)) {
                                const vals = { ...imageAttributeValues };
                                delete vals[name];
                                setImageAttributeValues(vals);
                            }
                        }}
                    />

                    {selectedImageAttributes.length > 0 && (
                        <AttributeImageValues
                            selectedAttrs={selectedImageAttributes}
                            attrValues={attributeValues}
                            currentValues={imageAttributeValues}
                            onChange={(n, v) => setImageAttributeValues({ ...imageAttributeValues, [n]: v })}
                        />
                    )}

                    <Divider style={{ margin: '16px 0' }} />

                    {allValuesSelected ? (
                        <ImageManagementArea
                            isGeneral={false}
                            images={currentAttrKey ? (attributeImages[currentAttrKey] || []) : []}
                            onUpload={handleUpload}
                            onChange={handleImagesChange}
                        />
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fafafa', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
                            <Text type="secondary">
                                {selectedImageAttributes.length === 0
                                    ? "Vui lòng chọn thuộc tính phân loại ảnh (ví dụ: Màu sắc)"
                                    : `Vui lòng chọn giá trị cho ${selectedImageAttributes.join(', ')} để bắt đầu upload ảnh.`}
                            </Text>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 24, borderRadius: 12 }}>
            <Tabs defaultActiveKey="general" activeKey={activeTab} onChange={setActiveTab} items={items} />

            {Object.keys(attributeImages).length > 0 && <AttributeImageSummary attributeImages={attributeImages} />}
        </Card>
    );
};

export default ImageUploadSection;
