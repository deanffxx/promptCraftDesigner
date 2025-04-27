import { useState, useRef, useEffect } from 'react';
import { defaultRoleOptions, defaultTaskOptions, defaultOutputFormatOptions } from '../constants/defaultOptions';

const LS_ROLE_KEY = 'promptcraft_roles';
const LS_TASK_KEY = 'promptcraft_tasks';
const LS_FORMAT_KEY = 'promptcraft_formats';

export function useDropdown(optionsVersion?: number) {
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

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const inputRef = useRef<any>(null);
  const [taskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const taskInputRef = useRef<any>(null);
  const [outputFormatDropdownOpen, setOutputFormatDropdownOpen] = useState(false);
  const [outputFormatSearch, setOutputFormatSearch] = useState('');
  const outputFormatInputRef = useRef<any>(null);

  useEffect(() => {
    // 这里根据 optionsVersion 变化重新读取 localStorage
    setRoleOptionsState(JSON.parse(localStorage.getItem(LS_ROLE_KEY) || '[]') || defaultRoleOptions);
    setTaskOptionsState(JSON.parse(localStorage.getItem(LS_TASK_KEY) || '[]') || defaultTaskOptions);
    setOutputFormatOptionsState(JSON.parse(localStorage.getItem(LS_FORMAT_KEY) || '[]') || defaultOutputFormatOptions);
  }, [optionsVersion]);

  // 持久化保存
  const saveToLocalStorage = () => {
    localStorage.setItem(LS_ROLE_KEY, JSON.stringify(roleOptionsState));
    localStorage.setItem(LS_TASK_KEY, JSON.stringify(taskOptionsState));
    localStorage.setItem(LS_FORMAT_KEY, JSON.stringify(outputFormatOptionsState));
  };

  // 过滤选项
  const filteredRoles = roleOptionsState.filter((opt: { label: string; value: string }) =>
    opt.label.toLowerCase().includes(roleSearch.toLowerCase())
  );
  const filteredTasks = taskOptionsState.filter((opt: { label: string; value: string }) =>
    opt.label.toLowerCase().includes(taskSearch.toLowerCase())
  );
  const filteredOutputFormats = outputFormatOptionsState.filter((opt: { label: string; value: string }) =>
    opt.label.toLowerCase().includes(outputFormatSearch.toLowerCase()) ||
    opt.value.toLowerCase().includes(outputFormatSearch.toLowerCase())
  );

  // 选择下拉项后，将其置顶
  const moveOptionToTop = (type: 'role' | 'task' | 'format', value: string) => {
    if (type === 'role') {
      const idx = roleOptionsState.findIndex((opt: { label: string; value: string }) => opt.value === value);
      if (idx > 0) {
        const newArr = [roleOptionsState[idx], ...roleOptionsState.slice(0, idx), ...roleOptionsState.slice(idx + 1)];
        setRoleOptionsState(newArr);
      }
    } else if (type === 'task') {
      const idx = taskOptionsState.findIndex((opt: { label: string; value: string }) => opt.value === value);
      if (idx > 0) {
        const newArr = [taskOptionsState[idx], ...taskOptionsState.slice(0, idx), ...taskOptionsState.slice(idx + 1)];
        setTaskOptionsState(newArr);
      }
    } else if (type === 'format') {
      const idx = outputFormatOptionsState.findIndex((opt: { label: string; value: string }) => opt.value === value);
      if (idx > 0) {
        const newArr = [outputFormatOptionsState[idx], ...outputFormatOptionsState.slice(0, idx), ...outputFormatOptionsState.slice(idx + 1)];
        setOutputFormatOptionsState(newArr);
      }
    }
    saveToLocalStorage();
  };

  return {
    roleOptionsState,
    setRoleOptionsState,
    taskOptionsState,
    setTaskOptionsState,
    outputFormatOptionsState,
    setOutputFormatOptionsState,
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
  };
} 