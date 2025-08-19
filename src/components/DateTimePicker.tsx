interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function DateTimePicker({ value, onChange }: Props) {
  const local = value.slice(0, 16);
  return (
    <input
      type="datetime-local"
      className="border p-2 rounded w-full"
      value={local}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
