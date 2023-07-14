import React from 'react';
import { Form, Input, Button } from 'antd';
import { FormInstance } from 'antd/lib/form';

import './App.css';

interface GptFormProps {
  repository: string;
}

function GptForm({ repository }: GptFormProps): JSX.Element {
  const formRef = React.useRef<FormInstance>(null);

  const onFinish = (values: any): void => {
    // Do something with the form data
    console.log('Name:', values.name);
    console.log('Description:', values.description);
    console.log('Repository:', repository);
    formRef.current?.resetFields();
  };

  return (
    <Form onFinish={onFinish} ref={formRef} className="form">

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
