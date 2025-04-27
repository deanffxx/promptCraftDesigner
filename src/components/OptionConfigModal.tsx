import React, { useState, useEffect } from 'react';
import { Input, Button, message, Modal, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { defaultRoleOptions, defaultTaskOptions, defaultOutputFormatOptions } from '../constants/defaultOptions';

const LS_ROLE_KEY = 'promptcraft_roles';
const LS_TASK_KEY = 'promptcraft_tasks';
const LS_FORMAT_KEY = 'promptcraft_formats';

const OptionConfigModal: React.FC<{ open: boolean; onClose: () => void; onOptionsChange?: () => void }> = ({ open, onClose, onOptionsChange }) => {
  const [roleOptionsState, setRoleOptionsState] = useState(() => {
    const saved = localStorage.getItem(LS_ROLE_KEY);
    return saved ? JSON.parse(saved) : defaultRoleOptions;
  });
  const [taskOptionsState, setTaskOptionsState] = useState(() => {
    const saved = localStorage.getItem(LS_TASK_KEY);
    return saved ? JSON.parse(saved) : defaultTaskOptions;
  });
  const [outputFormatOptionsState, setOutputFormatOptionsState] = useState(() => {
    const saved = localStorage.getItem(LS_FORMAT_KEY);
    return saved ? JSON.parse(saved) : defaultOutputFormatOptions;
  });
  const [editIdx, setEditIdx] = useState<{ type: string; idx: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem(LS_ROLE_KEY, JSON.stringify(roleOptionsState));
  }, [roleOptionsState]);
  useEffect(() => {
    localStorage.setItem(LS_TASK_KEY, JSON.stringify(taskOptionsState));
  }, [taskOptionsState]);
  useEffect(() => {
    localStorage.setItem(LS_FORMAT_KEY, JSON.stringify(outputFormatOptionsState));
  }, [outputFormatOptionsState]);

  useEffect(() => {
    // 强制覆盖 AntD Modal 内容区样式
    if (open) {
      setTimeout(() => {
        document.querySelectorAll('.ant-modal-content').forEach(el => {
          (el as HTMLElement).style.background = '#232b33';
          (el as HTMLElement).style.backgroundColor = '#232b33';
          (el as HTMLElement).style.color = '#fff';
          (el as HTMLElement).style.borderRadius = '16px';
        });
      }, 0);
    }
  }, [open]);

  // 新增/修改选项时唯一性校验
  const handleAddOption = (_: 'role' | 'task' | 'format', options: any[], setOptions: any) => {
    if (!editValue.trim()) return;
    if (options.some((opt: any) => opt.label === editValue.trim())) {
      message.error('不能添加重复的选项！');
      return;
    }
    setOptions([...options, { label: editValue.trim(), value: editValue.trim() }]);
    setEditValue('');
    setEditIdx(null);
  };
  const handleEditOption = (_: 'role' | 'task' | 'format', options: any[], setOptions: any, idx: number) => {
    if (!editValue.trim()) return;
    if (options.some((opt: any, i: number) => opt.label === editValue.trim() && i !== idx)) {
      message.error('不能修改为重复的选项！');
      return;
    }
    const newOpts = [...options];
    newOpts[idx] = { ...options[idx], label: editValue.trim(), value: editValue.trim() };
    setOptions(newOpts);
    setEditIdx(null);
  };

  const renderConfigList = (type: 'role' | 'task' | 'format', options: any[], setOptions: any) => (
    <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 0, position: 'relative', display: 'flex', flexDirection: 'row' , color: '#fff'}}>
      {/* 左侧选项竖排 */}
      <div style={{ flex: 1, minWidth: 0 , color: '#fff'}}>
        {options.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {editIdx && editIdx.type === type && editIdx.idx === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  size="small"
                  style={{ width: 180, marginRight: 8 }}
                />
                <Button icon={<CheckOutlined />} size="small" type="link" onClick={() => handleEditOption(type, options, setOptions, idx)} />
                <Button icon={<CloseOutlined />} size="small" type="link" onClick={() => setEditIdx(null)} />
              </>
            ) : (
              <>
                <span style={{ width: 180, display: 'inline-block', marginRight: 8 }}>{item.label}</span>
                <Button icon={<EditOutlined />} size="small" type="link" onClick={() => { setEditIdx({type, idx}); setEditValue(item.label); }} />
                <Button icon={<DeleteOutlined />} size="small" type="link" danger onClick={() => {
                  const newOpts = options.filter((_, i) => i !== idx);
                  setOptions(newOpts);
                }} />
              </>
            )}
          </div>
        ))}
      </div>
      {/* 右侧新增选项输入框，sticky固定在右上角 */}
      <div style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', paddingTop: 0, paddingBottom: 8, marginLeft: 16, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            value={editIdx && editIdx.type === type && editIdx.idx === -1 ? editValue : ''}
            onChange={e => { setEditIdx({type, idx: -1}); setEditValue(e.target.value); }}
            size="small"
            placeholder="新增选项"
            style={{ width: 120, marginRight: 8 }}
          />
          <Button icon={<PlusOutlined />} size="small" type="link" onClick={() => handleAddOption(type, options, setOptions)} />
        </div>
      </div>
    </div>
  );

  const configTabs = [
    {
      key: 'role',
      label: '角色选项',
      children: renderConfigList('role', roleOptionsState, setRoleOptionsState),
    },
    {
      key: 'task',
      label: '任务选项',
      children: renderConfigList('task', taskOptionsState, setTaskOptionsState),
    },
    {
      key: 'format',
      label: '输出格式选项',
      children: renderConfigList('format', outputFormatOptionsState, setOutputFormatOptionsState),
    },
  ];

  const handleClose = () => {
    onClose();
    if (onOptionsChange) onOptionsChange();
    setEditIdx(null);
    setEditValue('');
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleClose}
      okText="关闭"
      cancelButtonProps={{ style: { display: 'none' } }}
      styles={{ body: { padding: 24 }, mask: { background: 'rgba(21,28,35,0.7)' } }}
      closeIcon={<span style={{ color: '#fff', fontSize: 20 }}>×</span>}
    >
      <Tabs
        items={configTabs}
        size="large"
        tabBarStyle={{ borderBottom: '2px solid #333' }}
        tabBarGutter={32}
        moreIcon={null}
        indicatorSize={0}
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} />
        )}
      />
    </Modal>
  );
};

export default OptionConfigModal; 