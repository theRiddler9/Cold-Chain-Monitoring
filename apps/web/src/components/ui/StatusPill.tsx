import { statusLabel } from '../../utils/status';
export function StatusPill({status}:{status:string}) { return <span className={`status ${status}`}><i />{statusLabel(status)}</span>; }
