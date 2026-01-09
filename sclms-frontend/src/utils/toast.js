// Toast notification utility functions
export const showToast = (message, type = 'info', duration = 4000) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export const showSuccess = (message, duration = 4000) => {
  showToast(message, 'success', duration);
};

export const showError = (message, duration = 5000) => {
  showToast(message, 'error', duration);
};

export const showWarning = (message, duration = 4500) => {
  showToast(message, 'warning', duration);
};

export const showInfo = (message, duration = 4000) => {
  showToast(message, 'info', duration);
};
