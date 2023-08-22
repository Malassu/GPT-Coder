import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Select, List, Card, Checkbox, Popover } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { RepositoriesState, TypePrRef } from './types';
import { BACKEND_URL, CREATE_TICKET_PATH } from './config';
const { Option } = Select;

import './App.css';
import { submitButtonStyle } from './styles';

const popoverContent = (
  <div>
    <p>
      Check this if you want to use the GitHub API instead of "git clone".
      Needed for private repositories.
      NOTE: This might not work for large repositories due to GitHub API rate limitations.
    </p>
  </div>
);

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
    var cli = 'true';
    if(values.checked) cli = 'false';
    const data = {
      description: values.description,
      repository: repository,
      cli: cli
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
            <Form.Item name="agreement" valuePropName="checked">
              <Checkbox>
              Use GitHub API
                <Popover content={popoverContent} title="Use GitHub API">
                  <Button type="link" size="small">
                    <QuestionCircleOutlined />
                  </Button>
                </Popover>
              </Checkbox>
            </Form.Item>
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
