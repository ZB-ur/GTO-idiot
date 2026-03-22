import React from 'react';
import ComplianceScore from '../ui/report/ComplianceScore';

const ReportPage: React.FC = () => {
  return (
    <div className="report-page">
      <h1>GTO Compliance Report</h1>
      <ComplianceScore score={0} />
    </div>
  );
};

export default ReportPage;
