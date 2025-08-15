import { toast } from 'react-toastify';

export const showToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else if (type === 'error') {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else if (type === 'warning') {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } else if (type === 'info') {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

export const showApiError = (error) => {
  let message = 'An error occurred';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }
  
  showToast(message, 'error');
};

export const showApiSuccess = (message = 'Operation completed successfully') => {
  showToast(message, 'success');
}; 