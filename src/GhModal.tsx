import React from 'react';
import { Form, Input, Modal } from 'antd';

interface ModalFormProps {
    visible: boolean;
    onCreate: (values: any) => void;
    onCancel: () => void;
  }

function GhModal({ visible, onCreate, onCancel }: ModalFormProps): JSX.Element {
  const [form] = Form.useForm();

  const onFinish = (values: any): void => {
    onCreate(values);
    form.resetFields();
  };

  return (
    <Modal visible={visible} title="Connect to GitHub Repository" okText="Submit" onCancel={onCancel} onOk={(): void => form.submit()}>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="repository" label="Repository" rules={[{ required: true, message: 'Please enter a repository' }]}>
          <Input placeholder="Enter repository name" />
        </Form.Item>

        <Form.Item name="token" label="Access Token" rules={[{ required: true, message: 'Please enter an access token' }]}>
          <Input.Password placeholder="Enter access token" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default GhModal;
