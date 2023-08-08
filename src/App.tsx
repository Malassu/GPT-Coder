import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import GptForm from './GptForm';
import GhModal from './GhModal';
import { Button } from 'antd';
import axios from 'axios';
import { BACKEND_URL, LIST_REPOSITORIES_PATH } from './config';
import { Repository, SetRepositoriesAction } from './types';

import './App.css';
import AIModal from './AIModal';

function App(): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [githubTokenExists, setGithubTokenExists] = useState(false);
  const [openaiTokenExists, setOpenaiTokenExists] = useState(false);

  useEffect(() => {
    const githubAccessToken = localStorage.getItem('githubAccessToken');
    const openaiAccessToken = localStorage.getItem('openAIApiToken');
    setGithubTokenExists(!!githubAccessToken);
    setOpenaiTokenExists(!!openaiAccessToken);
  }, []);

  const showModal = (): void => {
    setModalVisible(true);
  };

  const dispatch = useDispatch();

  const hideModal = (): void => {
    setModalVisible(false);
  };

  const handleCreate = (values: any): void => {
    console.log(values);
    const githubAccessToken = localStorage.getItem('githubAccessToken');
    setGithubTokenExists(!!githubAccessToken);
    fetchRepositories();
    hideModal();
  };

  const [AIModalVisible, setAIModalVisible] = useState(false);

  const hideAIModal = (): void => {
    setAIModalVisible(false);
  };

  const handleCreateAI = (values: any): void => {
    console.log(values);
    const openaiAccessToken = localStorage.getItem('openAIApiToken');
    setOpenaiTokenExists(!!openaiAccessToken);
    hideAIModal();
  };

  const showAIModal = (): void => {
    setAIModalVisible(true);
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async (): Promise<any> => {
    const accessToken = localStorage.getItem('githubAccessToken');
    if (accessToken === null) {
      console.log('No GH access token');
      return
    }
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
      <h1>CodeGPT</h1>
      <div className='button-container'>
        <div className='connect-button'>
          <Button type="default" onClick={showModal}>
            Connect to GitHub {githubTokenExists && <span className="checkmark">&#10004;</span>}
          </Button>
        </div>
        <div className='connect-button'>
          <Button type="default" onClick={showAIModal}>
            Connect to OpenAI {openaiTokenExists && <span className="checkmark">&#10004;</span>}
          </Button>
        </div>
      </div>
      <GhModal visible={modalVisible} onCreate={handleCreate} onCancel={hideModal} />
      <AIModal visible={AIModalVisible} onCreate={handleCreateAI} onCancel={hideAIModal} />
      <GptForm />
    </div>
  );
}

export default App;
