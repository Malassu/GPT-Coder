import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GptForm from './GptForm';
import GhModal from './GhModal';
import { Button } from 'antd';
import axios from 'axios';
import { BACKEND_URL, LIST_REPOSITORIES_PATH } from './config';
import { Repository, SetRepositoriesAction } from './types';

import './App.css';

function App(): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (): void => {
    setModalVisible(true);
  };

  const dispatch = useDispatch();

  const hideModal = (): void => {
    setModalVisible(false);
  };

  const handleCreate = (values: any): void => {
    console.log(values)
    hideModal();
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async (): Promise<any> => {
    const accessToken = localStorage.getItem('githubAccessToken');
    try {
      const response = await axios.get<Repository[]>(`${BACKEND_URL}${LIST_REPOSITORIES_PATH}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      dispatch<SetRepositoriesAction>({ type: 'SET_REPOSITORIES', payload: response.data });
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  return (
    <div className="form-container">
      <h1>CoderGPT</h1>
      <Button type="primary" onClick={showModal}>
        Connect to GitHub
      </Button>
      <GhModal visible={modalVisible} onCreate={handleCreate} onCancel={hideModal} />
      <GptForm />
    </div>
  );
}

export default App;
