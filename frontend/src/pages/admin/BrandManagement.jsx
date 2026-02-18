import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Image,
    Typography,
    Card,
    Select,
    Tag
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined
} from '@ant-design/icons';
import brandService from '../../services/brand.service';
import categoryService from '../../services/category.service';
import config from '../../config';

const { Title } = Typography;
const { Option } = Select;

const BrandManagement = () => {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(null);
    const [form] = Form.useForm();
    const logoValue = Form.useWatch('logo', form);
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [brandsData, categoriesData] = await Promise.all([
                brandService.getAllBrands(),
                categoryService.getAllCategories()
            ]);
            setBrands(Array.isArray(brandsData) ? brandsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Effect to populate form when modal opens
    useEffect(() => {
        if (modalVisible) {
            if (currentBrand) {
                form.setFieldsValue({
                    name: currentBrand.name,
                    logo: currentBrand.logo,
                    categoryIds: currentBrand.category_ids || []
                });
            } else {
                form.resetFields();
            }
        }
    }, [modalVisible, currentBrand, form]);

    const handleOpenModal = (brand = null) => {
        setCurrentBrand(brand);
        if (brand) {
            if (brand.logo) {
                setFileList([{
                    uid: '-1',
                    name: 'logo.png',
                    status: 'done',
                    url: brand.logo,
                }]);
            } else {
                setFileList([]);
            }
        } else {
            setFileList([]);
        }
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setCurrentBrand(null);
        setFileList([]);
    };

    const handleUpload = async (options) => {
        const { onSuccess, onError, file } = options;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // Using fetch directly as we did before, or could use axios from api.js if exported
            // config.API_BASE_URL should be correct now
            const response = await fetch(`${config.API_BASE_URL}/upload/single`, {
                method: 'POST',
                body: uploadData,
            });
            const result = await response.json();

            if (result.status === 'success') {
                onSuccess(result.data.url);
                message.success(`${file.name} uploaded successfully`);
                // Update form logo field
                form.setFieldsValue({ logo: result.data.url });
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onError({ error });
            message.error(`${file.name} upload failed.`);
        }
    };

    const handleChanges = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        // If file is removed, clear the logo field
        if (newFileList.length === 0) {
            form.setFieldsValue({ logo: '' });
        } else if (newFileList[0]?.status === 'done' && newFileList[0]?.response) {
            // This case (response) usually handled by onChange if action default is used, 
            // but we use customRequest, so onSuccess handles it.
            // However, we might want to ensure the url is set in form if not already
            if (typeof newFileList[0].response === 'string') {
                form.setFieldsValue({ logo: newFileList[0].response });
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // If we have a file uploaded via customRequest, the URL should be in values.logo 
            // set by handleUpload -> onSuccess -> or manually
            // Let's ensure we get the URL from the fileList if available and not yet in form
            if (fileList.length > 0 && fileList[0].status === 'done') {
                // If it was a pre-existing file or newly uploaded
                // For newly uploaded, handleUpload `onSuccess` passes the URL as the response argument? 
                // Antd Upload behavior is a bit complex. 
                // Let's trust handleUpload set the form value.
            }

            // Fallback: if logo is empty but fileList has a url (from initial load)
            if (!values.logo && fileList.length > 0 && fileList[0].url) {
                values.logo = fileList[0].url;
            }

            if (currentBrand) {
                await brandService.updateBrand(currentBrand.id, values);
                message.success('Cập nhật thương hiệu thành công');
            } else {
                await brandService.createBrand(values);
                message.success('Tạo thương hiệu mới thành công');
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving brand:', error);
            message.error('Lỗi khi lưu thương hiệu: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xóa thương hiệu',
            content: 'Bạn có chắc chắn muốn xóa thương hiệu này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await brandService.deleteBrand(id);
                    message.success('Xóa thương hiệu thành công');
                    fetchData();
                } catch (error) {
                    console.error('Error deleting brand:', error);
                    message.error('Lỗi khi xóa thương hiệu');
                }
            }
        });
    };

    const getCategoryNames = (ids) => {
        if (!ids || !Array.isArray(ids)) return [];
        return ids.map(id => {
            const cat = categories.find(c => c.id === id);
            return cat ? cat.name : null;
        }).filter(Boolean);
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo) => (
                logo ? (
                    <Image
                        width={50}
                        src={logo}
                        alt="Logo"
                        fallback="https://via.placeholder.com/50?text=No+Img"
                    />
                ) : <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
            ),
        },
        {
            title: 'Tên thương hiệu',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Danh mục liên kết',
            key: 'categories',
            render: (_, record) => (
                <>
                    {getCategoryNames(record.category_ids).map(name => (
                        <Tag color="blue" key={name} style={{ margin: '2px' }}>{name}</Tag>
                    ))}
                </>
            )
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        style={{
                            backgroundColor: 'var(--color-primary)', 
                            borderColor: 'var(--color-primary)', 
                            color: '#fff' 
                        }}
                        onClick={() => handleOpenModal(record)}
                        size="small"
                    />
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            borderColor: 'var(--color-primary)', 
                            color: '#fff' 
                        }}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Thương hiệu</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                    size='large'
                    style={{ height: '45px', borderRadius: '8px' }}
                >
                    Thêm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={brands}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />


            <Modal
                title={currentBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ name: '', logo: '', categoryIds: [] }}
                >
                    <Form.Item
                        name="name"
                        label="Tên thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
                    >
                        <Input placeholder="Nhập tên thương hiệu" />
                    </Form.Item>

                    <Form.Item
                        name="categoryIds"
                        label="Danh mục liên kết"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn danh mục"
                            optionFilterProp="children"
                        >
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="logo"
                        label="Logo"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Hình ảnh logo">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={(file) => {
                                setPreviewImage(file.url || file.thumbUrl);
                                setPreviewOpen(true);
                            }}
                            onChange={handleChanges}
                            customRequest={handleUpload}
                            maxCount={1}
                            accept="image/*"
                        >
                            {fileList.length >= 1 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="URL Logo (Tùy chọn)">
                        <Input
                            placeholder="Hoặc nhập URL logo trực tiếp"
                            value={logoValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                form.setFieldsValue({ logo: val });
                                if (val) {
                                    setFileList([{
                                        uid: '-1',
                                        name: 'url-image',
                                        status: 'done',
                                        url: val,
                                    }]);
                                } else {
                                    setFileList([]);
                                }
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Image
                width={200}
                style={{ display: 'none' }}
                src={previewImage || null}
                preview={{
                    visible: undefined,
                    onVisibleChange: undefined,
                    open: previewOpen,
                    onOpenChange: (visible) => setPreviewOpen(visible),
                    src: previewImage || null,
                }}
            />
        </div>
    );
};

export default BrandManagement;
