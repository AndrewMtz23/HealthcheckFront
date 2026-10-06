import type { Row } from '@/types/admin';
export function TopicFilter({ selected, topics, onChange }: {
    selected: string;
    topics: Row[];
    onChange: (value: string) => void;
}) { return <select name="tema_id" value={selected} onChange={event => onChange(event.target.value)}><option value="">Todos</option>{selected && !topics.some(t => String(t.id) === selected) && <option value={selected}>Tema #{selected}</option>}{topics.map(t => <option key={t.id} value={t.id}>{String(t.nombre)}</option>)}</select>; }
