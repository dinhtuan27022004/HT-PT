import React, { useEffect, useState } from 'react';
import { Tabs, Button, Card, Table, Space, Image, Tag, Modal, Form, Input, InputNumber, Switch, Upload, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import bannerService from '../../../services/banner.service';

const { TabPane } = Tabs;

const BannerManagement = () => {
    const { message } = App.useApp();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPosition, setCurrentPosition] = useState('main');
    const [editingBanner, setEditingBanner] = useState(null);
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const positions = {
        main: 'Main Slide (Home)',
        left: 'Left Banner (Product Detail)',
        right: 'Right Banner (Product Detail)'
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await bannerService.getAllBanners();
            if (response.status === 'success') {
                setBanners(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBanner(null);
        form.resetFields();
        form.setFieldsValue({
            position: currentPosition,
            display_order: 0,
            is_active: true
        });
        setFileList([]);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingBanner(record);
        form.setFieldsValue({
            ...record,
            image: undefined // Don't set image file
        });
        setFileList([{
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: record.image_url,
        }]);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await bannerService.deleteBanner(id);
            message.success('Banner deleted successfully');
            fetchBanners();
        } catch (error) {
            message.error('Failed to delete banner');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            let imageUrl = editingBanner?.image_url;

            if (fileList.length > 0 && fileList[0].originFileObj) {
                setUploading(true);
                const uploadRes = await bannerService.uploadImage(fileList[0].originFileObj);
                imageUrl = uploadRes.url;
                setUploading(false);
            } else if (!imageUrl) {
                message.error('Please upload an image');
                return;
            }

            const bannerData = {
                ...values,
                image_url: imageUrl,
                position: currentPosition
            };

            if (editingBanner) {
                await bannerService.updateBanner(editingBanner.id, bannerData);
                message.success('Banner updated successfully');
            } else {
                await bannerService.createBanner(bannerData);
                message.success('Banner created successfully');
            }

            setIsModalVisible(false);
            fetchBanners();
        } catch (error) {
            setUploading(false);
            console.error(error);
            message.error('Operation failed');
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1));
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (url) => <Image src={url} width={100} height={60} style={{ objectFit: 'cover' }} />,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Link URL',
            dataIndex: 'link_url',
            key: 'link_url',
            render: (text) => <a href={text} target="_blank" rel="noreferrer" style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</a>
        },
        {
            title: 'Order',
            dataIndex: 'display_order',
            key: 'display_order',
            sorter: (a, b) => a.display_order - b.display_order,
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getBannersByPosition = (pos) => banners.filter(b => b.position === pos);

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title="Banner Management" 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAdd}>
                        Add Banner
                    </Button>
                }
            >
                <Tabs 
                    activeKey={currentPosition} 
                    onChange={setCurrentPosition}
                >
                    {Object.entries(positions).map(([key, label]) => (
                        <TabPane tab={label} key={key}>
                            <Table
                                dataSource={getBannersByPosition(key)}
                                columns={columns}
                                rowKey="id"
                                loading={loading}
                                pagination={false}
                            />
                        </TabPane>
                    ))}
                </Tabs>
            </Card>

            <Modal
                title={editingBanner ? "Edit Banner" : "Add Banner"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={uploading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Banner Image" required>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                        </Upload>
                    </Form.Item>
                    <Form.Item name="title" label="Title">
                        <Input placeholder="Optional banner title" />
                    </Form.Item>
                    <Form.Item name="link_url" label="Link URL" rules={[{ type: 'url', warningOnly: true }]}>
                        <Input placeholder="https://..." />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Optional description" />
                    </Form.Item>
                    <Form.Item name="display_order" label="Display Order">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="is_active" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BannerManagement;
