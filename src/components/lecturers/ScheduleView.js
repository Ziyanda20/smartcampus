import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Spin, Alert } from 'antd';
import api from '../../api';
import { useParams } from 'react-router-dom';

const ScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/lecturers/${id}/schedule`);
        setSchedule(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      render: (day) => <Tag color="blue">{day}</Tag>,
    },
    {
      title: 'Time',
      key: 'time',
      render: (record) => (
        `${record.formatted_start_time} - ${record.formatted_end_time}`
      ),
    },
    {
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class',
    },
    {
      title: 'Location',
      key: 'location',
      render: (record) => (
        `${record.room_name} (${record.building})`
      ),
    },
  ];

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <Card title="Teaching Schedule" bordered={false}>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={schedule}
          rowKey="class_id"
          pagination={false}
          bordered
        />
      </Spin>
    </Card>
  );
};

export default ScheduleView;