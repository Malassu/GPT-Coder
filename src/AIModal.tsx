import React from 'react';
import { Form, Input, Modal, Button } from 'antd';
import { ModalFormProps } from './props/FormProps';
import { submitButtonStyle } from './styles';

function AIModal({ visible, onCreate, onCancel }: ModalFormProps): JSX.Element {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const footer = (
    <div>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  );

  const onFinish = (values: any): void => {
    localStorage.setItem('openAIApiToken', values.token);
    onCreate(values);
    form.resetFields();
  };

  return (
    <Modal open={visible} title="Please enter your OpenAI API token" onCancel={onCancel} footer={footer}>
      <Form form={loginForm} onFinish={onFinish}>
        <Form.Item name="token" label="API Token" rules={[{ required: true, message: 'Please enter your API token' }]}>
          <Input.Password placeholder="Enter OpenAI API token" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={submitButtonStyle}>
              Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AIModal;
