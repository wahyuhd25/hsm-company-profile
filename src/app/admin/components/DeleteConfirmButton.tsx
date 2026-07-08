"use client";

interface Props {
  action: (formData: FormData) => Promise<any>;
  confirmMessage: string;
  className: string;
  children: React.ReactNode;
  fields: Record<string, string | number>;
  title?: string;
}

export default function DeleteConfirmButton({
  action,
  confirmMessage,
  className,
  children,
  fields,
  title,
}: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} style={{ display: "inline" }}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className} title={title}>
        {children}
      </button>
    </form>
  );
}
