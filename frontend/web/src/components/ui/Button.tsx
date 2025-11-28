type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${className}`}
    />
  );
}
