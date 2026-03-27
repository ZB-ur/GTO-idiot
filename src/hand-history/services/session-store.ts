export { createSession, getSession, endSession } from '../../services/session-service';

import { listSessions as _listSessions } from '../../services/session-service';

export async function listSessions(options: { page: number; perPage: number }) {
  return _listSessions(options.page, options.perPage);
}
