import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Dropdown, List, App as AntdApp } from 'antd';
import { DownOutlined, CopyOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useDropdown } from '../hooks/useDropdown';
import { inputItems, LS_ROLE_KEY, LS_TASK_KEY, LS_FORMAT_KEY } from '../constants/defaultOptions';
import OptionConfigModal from './OptionConfigModal';

const { TextArea } = Input;
const { Text } = Typography;

const PromptCraftDesigner: React.FC = () => {
  const [inputs, setInputs] = useState(inputItems.map(() => ''));
  const [configOpen, setConfigOpen] = useState(false);
  const [optionsVersion, setOptionsVersion] = useState(0);
  const { message } = AntdApp.useApp();

  const handleOptionsChange = () => {
    setOptionsVersion(v => v + 1);
  };

  const {
    roleOptionsState,
    taskOptionsState,
    outputFormatOptionsState,
    roleDropdownOpen,
    setRoleDropdownOpen,
    roleSearch,
    setRoleSearch,
    inputRef,
    taskDropdownOpen,
    setTaskDropdownOpen,
    taskSearch,
    setTaskSearch,
    taskInputRef,
    outputFormatDropdownOpen,
    setOutputFormatDropdownOpen,
    outputFormatSearch,
    setOutputFormatSearch,
    outputFormatInputRef,
    filteredRoles,
    filteredTasks,
    filteredOutputFormats,
    moveOptionToTop,
  } = useDropdown(optionsVersion);

  // 持久化保存
  useEffect(() => {
    localStorage.setItem(LS_ROLE_KEY, JSON.stringify(roleOptionsState));
  }, [roleOptionsState]);
  useEffect(() => {
    localStorage.setItem(LS_TASK_KEY, JSON.stringify(taskOptionsState));
  }, [taskOptionsState]);
  useEffect(() => {
    localStorage.setItem(LS_FORMAT_KEY, JSON.stringify(outputFormatOptionsState));
  }, [outputFormatOptionsState]);

  const handleInputChange = (idx: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[idx] = value;
    setInputs(newInputs);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    message.success('已复制到剪贴板');
  };

  // 通用下拉组件
  const DropdownField = ({ 
    value, 
    onChange, 
    dropdownOpen, 
    setDropdownOpen, 
    dropdownContent, 
    inputRef, 
    placeholder,
    isTextArea = false,
    rows = 3
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    dropdownOpen: boolean;
    setDropdownOpen: (open: boolean) => void;
    dropdownContent: () => React.ReactNode;
    inputRef?: React.Ref<any>;
    placeholder?: string;
    isTextArea?: boolean;
    rows?: number;
  }) => (
    <div style={{ display: 'flex', width: 500, gap: 8 }}>
      {isTextArea ? (
        <TextArea
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ resize: 'vertical', fontSize: 15, padding: '18px 12px', flex: 1, minHeight: '72px' }}
          rows={rows}
        />
      ) : (
        <Input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ fontSize: 15, padding: '18px 12px', flex: 1 }}
          size="large"
        />
      )}
      <Dropdown
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        dropdownRender={dropdownContent}
        placement="bottomLeft"
        trigger={['click']}
      >
        <Button
          icon={<DownOutlined />}
          style={{ marginLeft: 4, height: 48, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />
      </Dropdown>
    </div>
  );

  // 通用下拉内容渲染
  const DropdownContent = ({
    search,
    setSearch,
    options,
    onSelect,
    inputRef,
    placeholder
  }: {
    search: string;
    setSearch: (v: string) => void;
    options: { label: string; value: string }[];
    onSelect: (v: string) => void;
    inputRef?: React.Ref<any>;
    placeholder?: string;
  }) => (
    <div style={{ background: '#232b33', borderRadius: 8, width: 320, boxShadow: '0 4px 24px #0002', padding: 8 }}>
      <Input
        prefix={<SearchOutlined style={{ color: '#b0b6be' }} />}
        placeholder={placeholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8, borderRadius: 6 }}
        allowClear
        autoFocus
      />
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        <List
          size="small"
          dataSource={options}
          renderItem={(item: { label: string; value: string }) => (
            <List.Item
              style={{ color: '#fff', cursor: 'pointer', background: 'none', border: 'none', padding: '8px 12px', borderRadius: 6 }}
              onClick={() => {
                onSelect(item.value);
                if (inputRef && typeof inputRef !== 'function' && 'current' in inputRef && inputRef.current) {
                  setTimeout(() => inputRef.current?.focus(), 100);
                }
              }}
            >
              <span style={{ color: '#fff' }}>{item.label}</span>
            </List.Item>
          )}
          locale={{ emptyText: <span style={{ color: '#888' }}>无匹配</span> }}
        />
      </div>
    </div>
  );

  // 输出内容生成
  function getOutputText(inputs: string[], inputItems: { label: string }[]) {
    return inputItems
      .map((item: { label: string }, idx: number) => {
        if (!inputs[idx]) return '';
        if (idx === 0) return `你是一名：${inputs[0]}`;
        if (idx === 1) return `背景情况：${inputs[1]}`;
        return `${item.label}：${inputs[idx]}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#151c23', padding: 0 }}>
      {/* 右上角配置按钮 */}
      <div style={{ position: 'fixed', right: 40, top: 24, zIndex: 1000 }}>
        <Button icon={<SettingOutlined />} onClick={() => setConfigOpen(true)}>
          选项配置
        </Button>
      </div>
      <OptionConfigModal 
        open={configOpen} 
        onClose={() => setConfigOpen(false)}
        onOptionsChange={handleOptionsChange}
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 0', display: 'flex', gap: 32, justifyContent: 'center' }}>
        {/* 左侧输入区 */}
        <div style={{ flex: 1, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-start' }}>
          {inputItems.map((item, idx) => (
            <div key={item.label} style={{ marginBottom: 0 }}>
              <Text style={{ fontSize: 16, fontWeight: 500, margin: 0, padding: 0 }}>{item.label}</Text>
              {idx === 0 && (
                <DropdownField
                  value={inputs[0]}
                  onChange={(e) => handleInputChange(0, e.target.value)}
                  dropdownOpen={roleDropdownOpen}
                  setDropdownOpen={setRoleDropdownOpen}
                  dropdownContent={() => (
                    <DropdownContent
                      search={roleSearch}
                      setSearch={setRoleSearch}
                      options={filteredRoles}
                      onSelect={(val: string) => {
                        handleInputChange(0, val);
                        moveOptionToTop('role', val);
                        setRoleDropdownOpen(false);
                        setRoleSearch('');
                      }}
                      inputRef={inputRef}
                      placeholder="搜索角色..."
                    />
                  )}
                  inputRef={inputRef}
                  placeholder={item.placeholder}
                />
              )}
              {idx === 2 && (
                <DropdownField
                  value={inputs[2]}
                  onChange={(e) => handleInputChange(2, e.target.value)}
                  dropdownOpen={taskDropdownOpen}
                  setDropdownOpen={setTaskDropdownOpen}
                  dropdownContent={() => (
                    <DropdownContent
                      search={taskSearch}
                      setSearch={setTaskSearch}
                      options={filteredTasks}
                      onSelect={(val: string) => {
                        handleInputChange(2, val);
                        moveOptionToTop('task', val);
                        setTaskDropdownOpen(false);
                        setTaskSearch('');
                      }}
                      inputRef={taskInputRef}
                      placeholder="搜索任务..."
                    />
                  )}
                  inputRef={taskInputRef}
                  placeholder={item.placeholder}
                  isTextArea={true}
                />
              )}
              {idx === 5 && (
                <DropdownField
                  value={inputs[5]}
                  onChange={(e) => handleInputChange(5, e.target.value)}
                  dropdownOpen={outputFormatDropdownOpen}
                  setDropdownOpen={setOutputFormatDropdownOpen}
                  dropdownContent={() => (
                    <DropdownContent
                      search={outputFormatSearch}
                      setSearch={setOutputFormatSearch}
                      options={filteredOutputFormats}
                      onSelect={(val: string) => {
                        handleInputChange(5, val);
                        moveOptionToTop('format', val);
                        setOutputFormatDropdownOpen(false);
                        setOutputFormatSearch('');
                      }}
                      inputRef={outputFormatInputRef}
                      placeholder="搜索格式..."
                    />
                  )}
                  inputRef={outputFormatInputRef}
                  placeholder={item.placeholder}
                />
              )}
              {![0, 2, 5].includes(idx) && (
                item.single ? (
                  <Input
                    value={inputs[idx]}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder={item.placeholder}
                    style={{ fontSize: 15, padding: '18px 12px', flex: 1 }}
                    size="large"
                  />
                ) : (
                  <TextArea
                    value={inputs[idx]}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder={item.placeholder}
                    style={{ resize: 'vertical', flex: 1, minHeight: '72px' }}
                    rows={3}
                  />
                )
              )}
              {idx !== 0 && ![1, 2, 3, 4, 5, 6].includes(idx) && (
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(inputs[idx])}
                  style={{ marginLeft: 4, height: 48, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                />
              )}
            </div>
          ))}
        </div>
        {/* 右侧输出区 */}
        <div style={{ flex: 1, maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{ margin: 0, padding: 0 }}>
            <Text style={{ fontSize: 16, fontWeight: 500, margin: 0, padding: 0 }}>输出</Text>
          </div>
          <div style={{ 
            background: 'rgba(78,140,255,0.08)', 
            borderRadius: 10, 
            padding: 24, 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12, 
            flex: 1, 
            marginTop: 0,
            position: 'relative'
          }}>
            <div className="output-block" style={{ 
              color: '#fff',
              fontSize: 15,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {getOutputText(inputs, inputItems)}
            </div>
            <Button 
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(255,255,255,0.08)', color: 'white'
              }}
              icon={<CopyOutlined />}
              onClick={() => handleCopy(getOutputText(inputs, inputItems))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCraftDesigner;
