import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { usePractice } from '../../hooks/usePractice.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PerformanceView from '../../components/PerformanceView.jsx';
import PracticeModal from '../../components/PracticeModal.jsx';

export default function ProgressPage() {
  const practice = usePractice();
  const report = useFetch(() => api.get('/analytics/me'), []);
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function startPractice(topicIds, count = 10) {
    setBusy(true);
    if (!(await practice(topicIds, count))) setBusy(false); // on success we leave the page
  }

  return (
    <>
      <PageHeader title="My progress" subtitle="Your strengths, your weak spots, and what to practise next.">
        <button className="btn btn-primary" onClick={() => setChoosing(true)}><Dumbbell size={18} /> Build a practice set</button>
      </PageHeader>
      <Async state={report}>{(r) => <PerformanceView report={r} onPractice={(ids) => startPractice(ids)} />}</Async>
      {choosing && <PracticeModal busy={busy} onClose={() => setChoosing(false)} onStart={startPractice} />}
    </>
  );
}
