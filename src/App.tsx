import React, { useState } from 'react';
import GptForm from './GptForm';
import GhModal from './GhModal';
import { Button } from 'antd';

import './App.css';

function App(): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [repository, setRepository] = useState<string>('');

  const showModal = (): void => {
    setModalVisible(true);
  };

  const hideModal = (): void => {
    setModalVisible(false);
  };

  const handleCreate = (values: any): void => {
    setRepository(values.repository);
    hideModal();
  };
  return (
    <div className="form-container">
      <h1>CoderGPT</h1>
      <Button type="primary" onClick={showModal}>
        Connect to GitHub Repository
      </Button>
      <GhModal visible={modalVisible} onCreate={handleCreate} onCancel={hideModal} />
      <GptForm repository={repository} />
    </div>
  );
}

export default App;
