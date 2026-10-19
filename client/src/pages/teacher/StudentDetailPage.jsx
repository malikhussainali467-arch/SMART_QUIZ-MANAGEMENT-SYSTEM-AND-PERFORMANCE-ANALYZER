import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PerformanceView from '../../components/PerformanceView.jsx';

/** Same analysis the student sees, but read-only (no practice buttons). */
export default function StudentDetailPage() {
  const { id } = useParams();
  const report = useFetch(() => api.get(`/analytics/students/${id}`), [id]);

  return (
    <Async state={report}>
      {(r) => (
        <>
          <PageHeader title={r.student.name} subtitle={r.student.email}>
            <Link to="/teacher/students" className="btn btn-ghost"><ArrowLeft size={17} /> All students</Link>
          </PageHeader>
          <PerformanceView report={r} />
        </>
      )}
    </Async>
  );
}
