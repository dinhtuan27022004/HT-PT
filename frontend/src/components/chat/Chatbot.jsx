import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Avatar, Card, Space, Typography, Carousel, Tag } from 'antd';
import { MessageFilled, CloseOutlined, SendOutlined, FullscreenOutlined, FullscreenExitOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';


const SliderPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            style={{
                ...style,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%',
                width: '30px', height: '30px', zIndex: 10,
                position: 'absolute', top: '50%', left: '-10px',
                transform: 'translateY(-50%)', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onClick={onClick}
        >
            <LeftOutlined style={{ color: '#fff', fontSize: '14px' }} />
        </div>
    );
};

const SliderNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            style={{
                ...style,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%',
                width: '30px', height: '30px', zIndex: 10,
                position: 'absolute', top: '50%', right: '-10px',
                transform: 'translateY(-50%)', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onClick={onClick}
        >
            <RightOutlined style={{ color: '#fff', fontSize: '14px' }} />
        </div>
    );
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        let id = sessionStorage.getItem('chat_session_id');
        if (!id) {
            id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            sessionStorage.setItem('chat_session_id', id);
        }
        setSessionId(id);
        console.log("✅ Chatbot Session ID:", id); // Logs to inspector console
    }, []);
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('chat_history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.map(msg => ({
                    ...msg,
                    time: msg.time ? new Date(msg.time) : new Date()
                }));
            } catch (e) {
                console.error("Failed to parse chat history:", e);
            }
        }
        return [{ sender: 'bot', text: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?', time: new Date() }];
    });
    const [inputValue, setInputValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Save messages to sessionStorage to persist across navigation
    useEffect(() => {
        sessionStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { sender: 'user', text: inputValue, time: new Date() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputValue('');

        try {
            const response = await fetch('http://localhost:8000/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: sessionId, message: inputValue.trim() })
            });
            
            const data = await response.json();
            if (data.status === 'success') {
                setMessages(prev => [...prev, { 
                    sender: 'bot', 
                    text: data.reply, 
                    products: data.products,
                    time: new Date() 
                }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi gặp trục trặc khi xử lý câu hỏi.', time: new Date() }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Không thể kết nối đến hệ thống hỗ trợ.', time: new Date() }]);
        }
    };

    return (
        <div>
            {/* Floating Button */}
            <Button
                type="primary"
                shape="circle"
                icon={isOpen ? <CloseOutlined /> : <MessageFilled />}
                size="large"
                style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 1000, 
                    width: 50, height: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={() => setIsOpen(!isOpen)}
            />

            {/* Chat Frame */}
            {isOpen && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }}>B</Avatar>
                            <Typography.Text strong>Hỗ trợ trực tuyến</Typography.Text>
                        </div>
                    }
                    extra={
                        <Button 
                            type="text" 
                            size="small"
                            icon={isExpanded ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            style={{ padding: 4 }}
                        />
                    }
                    style={isExpanded ? {
                        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1000,
                        width: '50vw', height: '100vh', borderRadius: 0, overflow: 'hidden',
                        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
                        transition: 'all 0.3s ease'
                    } : {
                        position: 'fixed', bottom: 85, right: 24, zIndex: 1000,
                        width: 450, height: 600, borderRadius: 12, overflow: 'hidden',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column',
                        transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: '#f5f5f5' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: 12, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                <div style={{
                                    display: 'inline-block', padding: '8px 12px', borderRadius: 8,
                                    background: msg.sender === 'user' ? '#1890ff' : '#fff',
                                    color: msg.sender === 'user' ? '#fff' : '#000',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                                    maxWidth: msg.products && msg.products.length > 0 ? '100%' : '80%', 
                                    wordBreak: 'break-word',
                                    textAlign: 'left'
                                }}>
                                    <div>
                                        {msg.sender === 'bot' ? (
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]} 
                                                components={{
                                                    p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                                                    ul: ({ node, ...props }) => <ul style={{ paddingLeft: 20, marginBottom: 0 }} {...props} />,
                                                    ol: ({ node, ...props }) => <ol style={{ paddingLeft: 20, marginBottom: 0 }} {...props} />,
                                                    li: ({ node, ...props }) => <li style={{ marginBottom: 4 }} {...props} />
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>

                                     {msg.products && msg.products.length > 0 && (
                                          <div style={{ marginTop: 8, width: '100%', position: 'relative' }}>
                                             <Carousel 
                                                 dots={false} 
                                                 arrows 
                                                 prevArrow={<SliderPrevArrow />}
                                                 nextArrow={<SliderNextArrow />}
                                                 className="bot-carousel"
                                                 style={{ width: '100%' }}
                                             >
                                                 {msg.products.map((p, index) => {
                                                     const attrMap = {};
                                                     if (p.variants && Array.isArray(p.variants)) {
                                                         p.variants.forEach(v => {
                                                             if (v.attributes && typeof v.attributes === 'object') {
                                                                 Object.entries(v.attributes).forEach(([k, val]) => {
                                                                     if (!attrMap[k]) attrMap[k] = new Set();
                                                                     attrMap[k].add(val);
                                                                 });
                                                             }
                                                         });
                                                     }
                                                     const details = Object.entries(attrMap).map(([name, set]) => ({
                                                         name,
                                                         value: Array.from(set).join(', ')
                                                     }));
                                                    return (
                                                        <div key={`${p.id}-${index}-${p.price}`} style={{ padding: '2px' }}>
                                                             <a href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                                             <Card 
                                                                 size="small" 
                                                                 hoverable
                                                                 style={{ borderRadius: 8, background: '#fff' }}
                                                                 bodyStyle={{ padding: 8 }}
                                                             >
                                                                 <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                                     {p.image_url && (
                                                                         <div style={{ width: 110, height: 110, minWidth: 110, overflow: 'hidden', borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                             <img 
                                                                                 alt={p.name} 
                                                                                 src={p.image_url && p.image_url.startsWith('http') ? p.image_url : `http://localhost:3000${p.image_url}`} 
                                                                                 style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                                                             />
                                                                         </div>
                                                                     )}
                                                                     <div style={{ flex: 1, minWidth: 0 }}>
                                                                         <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 2, color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                                         <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '11px', marginBottom: 4 }}>
                                                                             {p.price ? Number(p.price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                                                                         </div>
                                                                         {details && details.length > 0 && (
                                                                             <div style={{ marginBottom: 4, maxHeight: '50px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                                                                                 {details.filter(d => d.name !== 'Price').map((d, i) => (
                                                                                     <Tag key={i} color="blue" style={{ fontSize: '9px', padding: '0 4px', marginBottom: 2, marginRight: 2 }}>
                                                                                         {d.name}: {d.value}
                                                                                     </Tag>
                                                                                 ))}
                                                                             </div>
                                                                         )}
                                                                     </div>
                                                                 </div>
                                                             </Card>
                                                             </a>
                                                        </div>
                                                    );
                                                })}
                                            </Carousel>
                                        </div>
                                    )}

                                    <div style={{ fontSize: '10px', marginTop: 4, color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#8c8c8c' }}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input 
                                placeholder="Nhập tin nhắn..." 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={handleSendMessage}
                            />
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} />
                        </Space.Compact>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Chatbot;
