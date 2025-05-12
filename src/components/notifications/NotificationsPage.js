import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Divider, Spin, Alert } from 'antd';
import api from '../../api'; // your API client configured with auth headers

const { Title, Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotificationsAndAnnouncements = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data.notifications);
        setAnnouncements(res.data.data.announcements);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationsAndAnnouncements();
  }, []);

  if (loading) return <Spin size="large" style={{ marginTop: 50 }} />;
  if (error) return <Alert message={error} type="error" showIcon style={{ marginTop: 50 }} />;

  return (
    <Card title="Notifications and Announcements" style={{ margin: 20 }}>
      <Title level={4}>Notifications</Title>
      {notifications.length === 0 ? (
        <Text>No new notifications.</Text>
      ) : (
        <List
          bordered
          dataSource={notifications}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.message}
              />
              <div>{new Date(item.created_at).toLocaleString()}</div>
            </List.Item>
          )}
        />
      )}

      <Divider />

      <Title level={4}>Announcements</Title>
      {announcements.length === 0 ? (
        <Text>No announcements available.</Text>
      ) : (
        <List
          bordered
          dataSource={announcements}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.message}
              />
              <div>
                {item.first_name && item.last_name
                  ? `By ${item.first_name} ${item.last_name} - `
                  : ''}
                {new Date(item.created_at).toLocaleString()}
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default NotificationsPage;
