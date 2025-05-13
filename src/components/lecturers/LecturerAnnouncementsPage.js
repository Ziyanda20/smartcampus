import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, List, message, Spin, Alert } from 'antd';
import api from '../../api';
import { useParams } from 'react-router-dom';

const LecturerAnnouncementsPage = () => {
  const { id } = useParams(); // lecturer id from URL
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true); // ensure loading state is reset on ID change
      try {
        const res = await api.get(`/lecturers/${id}/announcements`);
        setAnnouncements(res.data.data);
        setError(null); // clear previous error
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [id]);

  const onFinish = async (values) => {
    setPosting(true);
    try {
      await api.post(`/lecturers/${id}/announcements`, values);
      message.success('Announcement posted');
      form.resetFields();

      // Refresh the announcements list
      const res = await api.get(`/lecturers/${id}/announcements`);
      setAnnouncements(res.data.data);
      setError(null);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to post announcement');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card title="Post Announcements" bordered={false} style={{ margin: '20px' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter the announcement title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: 'Please enter the announcement message' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={posting}>
            Post Announcement
          </Button>
        </Form.Item>
      </Form>

      <h3>Previous Announcements</h3>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading ? (
        <Spin />
      ) : (
        <List
          bordered
          dataSource={announcements}
          locale={{ emptyText: 'No announcements yet' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.message} />
              <div>{new Date(item.created_at).toLocaleString()}</div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default LecturerAnnouncementsPage;
