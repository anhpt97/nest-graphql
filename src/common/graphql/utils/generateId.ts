export const generateId = () =>
  `${Date.now()}${Math.random().toString().slice(2, 8)}`;
