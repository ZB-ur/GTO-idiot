import type { DBSchema } from 'idb';
import type { HandRecord } from '../types';

export interface GtoIdiotDB extends DBSchema {
  hands: {
    key: string;
    value: HandRecord;
    indexes: {
      'by-playedAt': string;
      'by-blindLevel': string;
      'by-profit': number;
    };
  };
}

export const DB_NAME = 'gto-idiot-db';
export const DB_VERSION = 1;
