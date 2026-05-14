import { CustomField, CustomJob } from "@/lib/settings";
import { Field, inputCls } from "./form-bits";

export type CustomValues = Record<string, string | number | boolean>;

export function defaultsFor(job: CustomJob): CustomValues {
  const v: CustomValues = {};
  for (const f of job.fields) {
    if (f.defaultValue !== undefined) {
      v[f.id] = f.type === "number" ? Number(f.defaultValue) : f.defaultValue;
    } else if (f.type === "boolean") {
      v[f.id] = false;
    } else if (f.type === "select" && f.options?.length) {
      v[f.id] = f.options[0];
    } else {
      v[f.id] = f.type === "number" ? 0 : "";
    }
  }
  return v;
}

export function CustomJobFields({
  job,
  values,
  onChange,
}: {
  job: CustomJob;
  values: CustomValues;
  onChange: (v: CustomValues) => void;
}) {
  function set(id: string, v: string | number | boolean) {
    onChange({ ...values, [id]: v });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {job.fields.map((f) => (
        <div key={f.id} className={f.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}>
          <Field label={`${f.label}${f.required ? " *" : ""}${f.unit ? ` (${f.unit})` : ""}`}>
            <RenderField field={f} value={values[f.id]} onChange={(v) => set(f.id, v)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

function RenderField({
  field,
  value,
  onChange,
}: {
  field: CustomField;
  value: string | number | boolean | undefined;
  onChange: (v: string | number | boolean) => void;
}) {
  switch (field.type) {
    case "select":
      return (
        <select
          className={inputCls}
          required={field.required}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Choose…
          </option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "number":
      return (
        <input
          type="number"
          className={inputCls}
          required={field.required}
          placeholder={field.placeholder}
          value={value === undefined || value === "" ? "" : Number(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "textarea":
      return (
        <textarea
          className={inputCls}
          required={field.required}
          rows={3}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "url":
      return (
        <input
          type="url"
          className={inputCls}
          required={field.required}
          placeholder={field.placeholder || "https://…"}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "boolean":
      return (
        <label className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-muted-foreground">{field.placeholder || "Yes"}</span>
        </label>
      );
    default:
      return (
        <input
          className={inputCls}
          required={field.required}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
