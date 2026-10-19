import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

/** Returns startPractice(topicIds, count): builds a practice set on the server and opens the quiz player. */
export function usePractice() {
  const navigate = useNavigate();
  const toast = useToast();

  return async function startPractice(topicIds = [], count = 10) {
    try {
      const { attemptId } = await api.post('/attempts/practice', { topicIds, count });
      navigate(`/attempt/${attemptId}`);
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  };
}
