export { getHandHistory } from '../../services/hand-service';

import { listHands as _listHands } from '../../services/hand-service';

export async function listHands(options: { page: number; perPage: number; filterErrorsOnly?: boolean }) {
  return _listHands(options);
}
