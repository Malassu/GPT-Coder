import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { RepositoriesState } from './types';
import { BACKEND_URL, CREATE_TICKET_PATH } from './config';
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
    console.log('Description:', values.description);
    console.log('Repository:', repository);
    const accessToken = localStorage.getItem('githubAccessToken');
    if (accessToken === null) {
      console.log('No GH access token');
      return
    }
    const apiToken = localStorage.getItem('openAIApiToken');
    if (apiToken === null) {
      console.log('No OpenAI API token');
      return
    }
    const data = {
      description: values.description,
      repository: repository
    };
    axios.post(`${BACKEND_URL}${CREATE_TICKET_PATH}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization-OpenAI': `Bearer ${apiToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        console.log('GPT-3 Completion:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    formRef.current?.resetFields();
  };

  return (
    <div className="form-container">
      <Form onFinish={onFinish} ref={formRef} className="form">
        <Form.Item label="Repository" name="repository" rules={[{ required: true, message: 'Please select a repository' }]}>
          <Select loading={loading} placeholder="Select a repository" onChange={handleSelectChange}>
            {repositories.map((repo) => (
              <Option key={repo.id} value={repo.full_name}>
                {repo.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a coding task description' }]}>
          <Input.TextArea rows={4} placeholder="Enter a description for the coding task" />
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
