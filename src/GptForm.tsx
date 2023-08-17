import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Select, List, Card } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { RepositoriesState, TypePrRef } from './types';
import { BACKEND_URL, CREATE_TICKET_PATH } from './config';
const { Option } = Select;

import './App.css';
import { submitButtonStyle } from './styles';

function GptForm(): JSX.Element {
  const formRef = React.useRef<FormInstance>(null);
  const repositories = useSelector((state: RepositoriesState) => state.repositories);
  const loading = useSelector((state: RepositoriesState) => state.repositories.length === 0 );
  const [repository, setRepository] = useState('');
  const [resLoading, setResLoading] = useState(false);
  const [prRefs, setPrRefs] = useState<TypePrRef[]>([]);
  const handleSelectChange = (value: string): void => {
    setRepository(value);
  };
  async function onFinish(values: any): Promise<void> {
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
    setResLoading(true);
    await axios.post(`${BACKEND_URL}${CREATE_TICKET_PATH}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization-OpenAI': `Bearer ${apiToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        let prRef = {repository: repository, prUrl: response.data.pullRequest};
        console.log('PR created:', prRef.prUrl);
        setPrRefs([...prRefs, prRef]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    setResLoading(false);
    formRef.current?.resetFields();
  }

  return (
    <div className='app-container'>
      <div className="form-container">
        <Card title="Create task" className='card'>
          <Form onFinish={onFinish} ref={formRef} className="form" title="Create task">
            <Form.Item label="Repository" name="repository" rules={[{ required: true, message: 'Please select a repository' }]}>
              <Select disabled={resLoading} loading={loading} placeholder="Select a repository" onChange={handleSelectChange}>
                {repositories.map((repo) => (
                  <Option key={repo.id} value={repo.full_name}>
                    {repo.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a coding task description' }]}>
              <Input.TextArea disabled={resLoading} rows={4} placeholder="Enter a description for the coding task" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={submitButtonStyle}>
                  Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <div className='result-container'>
        <Card title="PR URLs" className='card'>
          <List
            loading={resLoading}
            dataSource={prRefs}
            renderItem={(item) => (
              <List.Item>
                <a href={item.prUrl} target="_blank" rel="noopener noreferrer">
                  {`${item.repository}: #${item.prUrl.split('/').at(-1)}`}
                </a>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

export default GptForm;
