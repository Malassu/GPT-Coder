import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { FormInstance } from 'antd/lib/form';


const { Option } = Select;

function GptForm(): JSX.Element {
  const formRef = React.useRef<FormInstance>(null);

  const onFinish = (values: any): void => {
    console.log('Form values:', values);
    formRef.current?.resetFields();
  };

  const repositories = ['Repository 1', 'Repository 2', 'Repository 3'];

  return (
    <Form onFinish={onFinish} ref={formRef}>
      <Form.Item name="repository" label="Repository" rules={[{ required: true, message: 'Please select a repository' }]}>
        <Select placeholder="Select a repository">
          {repositories.map((repo) => (
            <Option key={repo} value={repo}>
              {repo}
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
  );
}

export default GptForm;
