import { config } from 'dotenv';
config();

import '@/ai/flows/announcement-drafting-flow.ts';
import '@/ai/flows/financial-report-summary-flow.ts';
import '@/ai/flows/financial-anomaly-alert-flow.ts';
import '@/ai/flows/scan-receipt-flow.ts';
