interface ValidationMessageProps {
  message?: string;
}

export function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-0.5 ml-0.5">{message}</p>
  );
}
