import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const reportQueue = new Queue('report-generation', REDIS_URL);

export async function addReportJob(
  evidenceId: string | undefined,
  caseId: string,
  reportType: 'CERTIFICATE' | 'FULL_CHAIN' | 'CASE_BUNDLE' | 'CHAIN_REPORT',
  generatedById: string
) {
  return await reportQueue.add({ evidenceId, caseId, reportType, generatedById }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
  });
}
