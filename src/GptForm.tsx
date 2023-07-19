import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { RepositoriesState } from './types';
const { Option } = Select;

import './App.css';

function GptForm(): JSX.Element {
  const formRef = React.useRef<FormInstance>(null);
  const repositories = useSelector((state: RepositoriesState) => state.repositories);
  const loading = useSelector((state: RepositoriesState) => state.repositories.length === 0 );
  const [repository, setRepository] = useState('');
  const handleSelectChange = (value: string): void => {
    setRepository(value);
  };
  const onFinish = (values: any): void => {
    // Do something with the form data
    console.log('Name:', values.name);
    console.log('Description:', values.description);
    console.log('Repository:', repository);
    formRef.current?.resetFields();
  };

  return (
    <div className="form-container">
      <Form onFinish={onFinish} ref={formRef} className="form">
        <Form.Item label="Repository" name="repository" rules={[{ required: true, message: 'Please select a repository' }]}>
          <Select loading={loading} placeholder="Select or create a repository" onChange={handleSelectChange}>
            {repositories.map((repo) => (
              <Option key={repo.id} value={repo.full_name}>
                {repo.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description' }]}>
          <Input.TextArea rows={4} placeholder="Enter a description" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
              Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default GptForm;
