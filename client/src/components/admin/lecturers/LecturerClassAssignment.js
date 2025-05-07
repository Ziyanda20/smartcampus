import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Card, Row, Col, Spin } from 'antd';
import api from '../../api';

const { Option } = Select;

const LecturerClassAssignment = () => {
  const [form] = Form.useForm();
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lecturerClasses, setLecturerClasses] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturersRes, classesRes] = await Promise.all([
          api.get('/admin/lecturers'),
          api.get('/classes')
        ]);
        setLecturers(lecturersRes.data.data);
        setClasses(classesRes.data.data);
      } catch (error) {
        message.error('Failed to fetch initial data');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const fetchLecturerClasses = async (lecturerId) => {
    try {
      const response = await api.get(`/lecturers/${lecturerId}/classes`);
      setLecturerClasses(response.data.data);
    } catch (error) {
      message.error('Failed to fetch current assignments');
    }
  };

  const onLecturerChange = (value) => {
    if (value) {
      fetchLecturerClasses(value);
    } else {
      setLecturerClasses([]);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post(`/admin/lecturers/${values.lecturer_id}/assign-class`, {
        class_id: values.class_id
      });
      message.success('Lecturer assigned to class successfully');
      form.resetFields();
      fetchLecturerClasses(values.lecturer_id);
    } catch (error) {
      message.error(error.response?.data?.error || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter out already assigned classes
  const getAvailableClasses = () => {
    const assignedClassIds = lecturerClasses.map(c => c.id);
    return classes.filter(c => !assignedClassIds.includes(c.id));
  };

  return (
    <Card 
      title="Lecturer-Class Assignment"
      bordered={false}
      style={{ margin: '20px' }}
    >
      {fetching ? (
        <Spin size="large" />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lecturer_id"
                label="Select Lecturer"
                rules={[{ required: true, message: 'Please select a lecturer' }]}
              >
                <Select
                  placeholder="Choose lecturer"
                  onChange={onLecturerChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {lecturers.map(lecturer => (
                    <Option 
                      key={lecturer.id} 
                      value={lecturer.id}
                    >
                      {lecturer.first_name} {lecturer.last_name} ({lecturer.employee_id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="class_id"
                label="Select Class"
                rules={[{ required: true, message: 'Please select a class' }]}
              >
                <Select
                  placeholder="Choose class"
                  disabled={!form.getFieldValue('lecturer_id')}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {getAvailableClasses().map(classItem => (
                    <Option 
                      key={classItem.id} 
                      value={classItem.id}
                    >
                      {classItem.name} ({classItem.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={!form.getFieldValue('lecturer_id') || !form.getFieldValue('class_id')}
            >
              Assign Lecturer to Class
            </Button>
          </Form.Item>

          {lecturerClasses.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Current Assignments</h3>
              <ul>
                {lecturerClasses.map(c => (
                  <li key={c.id}>
                    <strong>{c.name}</strong> ({c.code}) - {c.day} {c.start_time}-{c.end_time}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Form>
      )}
    </Card>
  );
};

export default LecturerClassAssignment;