interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ActionButton({ label, onClick, disabled }: ActionButtonProps) {
  return <div>ActionButton</div>;
}
