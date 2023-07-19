import React from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Modal } from 'antd';
import { ModalFormProps } from './props/FormProps';
import { SetUserAction } from './types';

function GhModal({ visible, onCreate, onCancel }: ModalFormProps): JSX.Element {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = (values: any): void => {
    localStorage.setItem('githubAccessToken', values.token);
    dispatch<SetUserAction>({ type: 'SET_USER', payload: values.username });
    onCreate(values);
    form.resetFields();
  };

  return (
    <Modal visible={visible} title="Connect to GitHub Repository" okText="Submit" onCancel={onCancel} onOk={(): void => form.submit()}>
      <Form form={loginForm} onFinish={onFinish}>
        <Form.Item name="username" label="User name" rules={[{ required: true, message: 'Please enter your user name' }]}>
          <Input placeholder="Enter user name" />
        </Form.Item>
        <Form.Item name="token" label="Access Token" rules={[{ required: true, message: 'Please enter your access token' }]}>
          <Input.Password placeholder="Enter GH access token" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default GhModal;
